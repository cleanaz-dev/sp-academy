"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBookReport } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import { CreateBookReportButton } from "@/components/SubmitButton";

export default function CreateBookReportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  async function handleSubmit(formData) {
    setIsSubmitting(true);
    try {
      await createBookReport(formData);
      router.push("/book-reports");
    } catch (error) {
      console.error("Failed to create book report:", error);
      // Here you would typically show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Book Report</CardTitle>
        </CardHeader>
        <form action={handleSubmit}>
          <input type="hidden" name="userId" value={user.id} />
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input id="author" name="author" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select name="genre" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiction">Ficton</SelectItem>
                  <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                  <SelectItem value="mystery">Mystery</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select name="language" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" name="summary" rows={4} required />
            </div>
          </CardContent>
          <CardFooter>
            <CreateBookReportButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
