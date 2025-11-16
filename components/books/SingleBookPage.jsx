"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/old-ui/card";
import { Input } from "@/components/old-ui/input";
import { Label } from "@/components/old-ui/label";
import { Textarea } from "@/components/old-ui/textarea";
import { addReadingLog } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ReadingLogs from "./ReadingLogs";
import { AddReadingLog } from "../SubmitButton";
import { Button } from "../old-ui/button";
import { Shapes } from "lucide-react";
import { toast } from "sonner";
import { Undo } from "lucide-react";
import { RotateCcw } from "lucide-react";

export default function SingleReportPage({ readingLogs }) {
  const { title, author, totalPages, id, readingLogs: logs } = readingLogs;

  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previousSummary, setPreviousSummary] = useState("");
  const ReadingLogSchema = z
    .object({
      startPage: z.number().min(1, "Start page must be at least 1"),
      endPage: z.number().min(1, "End page must be at least 1"),
      summary: z
        .string()
        .min(50, "Summary must be at least 50 characters long"), // Changed this line
      bookId: z.string(),
      userId: z.string(),
    })
    .refine((data) => data.startPage <= data.endPage, {
      message: "Start page must be less than or equal to end page",
      path: ["startPage"],
    })
    .refine((data) => data.endPage <= totalPages, {
      message: `End page cannot exceed total pages (${totalPages})`,
      path: ["endPage"],
    });

  const form = useForm({
    resolver: zodResolver(ReadingLogSchema),
    defaultValues: {
      startPage: 1,
      endPage: 2,
      summary: "",
      bookId: id,
      userId: user.id,
    },
  });

  // Add new state for draft summary
  const LOCAL_STORAGE_KEY = `reading-log-draft-${id}`; // unique key per book

  // Load draft from localStorage on initial render
  useEffect(() => {
    const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDraft) {
      form.setValue("summary", savedDraft);
    }
  }, []);

  // Save to localStorage whenever summary changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "summary") {
        localStorage.setItem(LOCAL_STORAGE_KEY, value.summary || "");
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Update both startPage and endPage when lastPage changes
  useEffect(() => {
    const readingLogsLastPage = logs.at(-1);
    if (readingLogsLastPage) {
      const newStartPage = readingLogsLastPage.endPage + 1;
      form.setValue("startPage", newStartPage);
      form.setValue("endPage", newStartPage + 1);
    } else {
      form.setValue("startPage", 1);
      form.setValue("endPage", 2);
    }
  }, [logs]);

  async function onSubmit(data) {
    setIsSubmitting(true);
    try {
      await addReadingLog(data);
      // Clear localStorage after successful submission
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      router.refresh();
      form.reset();
    } catch (error) {
      console.error("Failed to add daily log:", error.message);
      toast.error("Failed to add reading log");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSummarizeSummary() {
    const summary = form.getValues("summary");

    // Check if the summary is null or empty
    if (!summary || summary.trim() === "") {
      toast.error("Please enter a summary");
      return;
    }

    // Check if the summary meets the minimum character count
    if (summary.trim().length < 50) {
      toast.error("Summary must be at least 100 characters long");
      return;
    }

    setPreviousSummary(summary); // Access the current summary from the form
    setIsSummarizing(true);

    try {
      const summaryResponse = await fetch(`/api/books/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: summary }),
      });

      if (!summaryResponse.ok) {
        throw new Error("Failed to summarize text");
      }

      const summaryData = await summaryResponse.json();
      form.setValue("summary", summaryData.summary);
    } catch (error) {
      toast.error("Failed to summarize text: " + error.message);
    } finally {
      setIsSummarizing(false);
    }
  }

  return (
    <div className="h-full py-8">
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>
            <span className="text-4xl">{title}</span>
          </CardTitle>
          <CardDescription>by {author}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mb-4">
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="space-y-2">
                  <Label htmlFor="startPage">Page Started</Label>
                  <Input
                    {...form.register("startPage", { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max={readingLogs.totalPages}
                    className="w-20"
                  />
                  {form.formState.errors.startPage && (
                    <span className="text-xs text-red-500">
                      {form.formState.errors.startPage.message}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endPage">Page Finished</Label>
                  <Input
                    {...form.register("endPage", { valueAsNumber: true })}
                    type="number"
                    min={form.watch("startPage") + 1}
                    max={readingLogs.totalPages}
                    className="w-20"
                  />
                  {form.formState.errors.endPage && (
                    <span className="text-xs text-red-500">
                      {form.formState.errors.endPage.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Short Summary</Label>
                <Textarea
                  {...form.register("summary")}
                  rows={10}
                  placeholder="Write a brief summary of what you've read today..."
                />
                {form.formState.errors.summary && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.summary.message}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-6">
              <AddReadingLog isSubmitting={isSubmitting} />
              <Button
                type="button"
                onClick={handleSummarizeSummary}
                className="group transition-colors duration-500 hover:bg-emerald-400"
                disabled={isSummarizing}
              >
                {isSummarizing ? (
                  <>Summarizing...</>
                ) : (
                  <>
                    Summarize
                    <Shapes className="ml-2 size-4 transition-all duration-500 ease-in-out group-hover:rotate-90" />
                  </>
                )}
              </Button>

              {previousSummary && (
                <Button
                  type="button"
                  onClick={() => {
                    form.setValue("summary", previousSummary);
                    setPreviousSummary("");
                  }}
                  disabled={isSummarizing}
                  className="group bg-sky-400 transition-colors duration-500 hover:bg-emerald-400"
                >
                  Bring back previous summary!
                  <RotateCcw className="ml-2 size-4 transition-all duration-500 ease-in-out group-hover:-rotate-180" />
                </Button>
              )}
            </div>
          </form>

          <ReadingLogs data={readingLogs} />
        </CardContent>
      </Card>
    </div>
  );
}
