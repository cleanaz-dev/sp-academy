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
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addReadingLog } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ReadingLogs from "./ReadingLogs";
import { AddReadingLog } from "../SubmitButton";

export default function SingleBookReportPage({ bookReport }) {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ReadingLogSchema = z
    .object({
      startPage: z.number().min(1, "Start page must be at least 1"),
      endPage: z.number().min(1, "End page must be at least 1"),
      summary: z.string().min(1, "Summary is required"),
      bookId: z.string(),
      userId: z.string(),
      bookReportId: z.string(),
    })
    .refine((data) => data.startPage <= data.endPage, {
      message: "Start page must be less than or equal to end page",
      path: ["startPage"],
    })
    .refine((data) => data.endPage <= bookReport.book.pages, {
      message: `End page cannot exceed total pages (${bookReport.book.pages})`,
      path: ["endPage"],
    });

  const form = useForm({
    resolver: zodResolver(ReadingLogSchema),
    defaultValues: {
      startPage: 1,
      endPage: 2, // Initialize as startPage + 1
      summary: "",
      bookId: bookReport.bookId,
      userId: user.id,
      bookReportId: bookReport.id,
    },
  });

  // Update both startPage and endPage when lastPage changes
  useEffect(() => {
    const bookReportLastPage = bookReport.readingLogs.at(-1);
    if (bookReportLastPage) {
      const newStartPage = bookReportLastPage.endPage + 1;
      form.setValue("startPage", newStartPage);
      form.setValue("endPage", newStartPage + 1);
    } else {
      form.setValue("startPage", 1);
      form.setValue("endPage", 2);
    }
  }, [bookReport.readingLogs]);

  async function onSubmit(data) {
    setIsSubmitting(true);
    try {
      await addReadingLog(data);
      router.refresh();
      // Optionally reset the form
      form.reset();
    } catch (error) {
      console.error("Failed to add daily log:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="py-8 h-full">
      <Card className="max-w-4xl ">
        <CardHeader>
          <CardTitle>
            <span className="text-4xl">{bookReport.book.title}</span>
          </CardTitle>
          <CardDescription>by {bookReport.book.author}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mb-4">
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="startPage">Page Started</Label>
                  <Input
                    {...form.register("startPage", { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max={bookReport.totalPages}
                  />
                  {form.formState.errors.startPage && (
                    <span className="text-red-500 text-xs">
                      {form.formState.errors.startPage.message}
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="endPage">Page Finished</Label>
                  <Input
                    {...form.register("endPage", { valueAsNumber: true })}
                    type="number"
                    min={form.watch("startPage") + 1}
                    max={bookReport.totalPages}
                  />
                  {form.formState.errors.endPage && (
                    <span className="text-red-500 text-xs">
                      {form.formState.errors.endPage.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Short Summary</Label>
                <Textarea
                  {...form.register("summary")}
                  rows={4}
                  placeholder="Write a brief summary of what you've read today..."
                />
                {form.formState.errors.summary && (
                  <span className="text-red-500 text-xs">
                    {form.formState.errors.summary.message}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6">
              <AddReadingLog isSubmitting={isSubmitting} />
            </div>
          </form>
          <ReadingLogs data={bookReport.readingLogs} />
        </CardContent>
      </Card>
    </div>
  );
}
