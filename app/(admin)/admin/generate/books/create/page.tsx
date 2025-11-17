"use client";

import GenerateBookForm from "@/components/new/read-a-book/forms/generate-book-form";
import { useState } from "react";
import { toast } from "sonner";


export default function Page() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateBook = async (formData: FormData) => {
    setIsGenerating(true);
    try {
      // Convert FormData to a plain object
      const data = Object.fromEntries(formData);
      console.log("Generating book with:", data);
      
      // Call your API route
      const response = await fetch("/api/new/read-a-book/generate-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to generate book");
      }

      const result = await response.json();
      console.log("Book generated successfully:", result);
      
       
      toast.success("Book preview generated successfully!");
      
    } catch (error) {
      console.error("Error generating book:", error);
      toast.error("Failed to generate book. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create New Book
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Generate a custom French learning book
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <GenerateBookForm
          onSubmit={handleGenerateBook}
          isGenerating={isGenerating}
        />
      </main>
    </div>
  );
}