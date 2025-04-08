"use client";
import { useState, useEffect } from "react";
import LessonForm from "@/components/generate-lesson/LessonForm";
import LessonPreview from "@/components/generate-lesson/LessonPreview";
import { getAllCourses } from "@/lib/actions";
import { generateMockLessonContent } from "@/components/generate-lesson/mockLessonContent";
import { toast } from "sonner";

export default function GenerateLessonPage() {
  const [previewContent, setPreviewContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

  const handleGenerate = async (data) => {
    setIsLoading(true);
    setError(null); // Reset error state on new attempt

    try {
      // Make API call
      const response = await fetch("/api/mock/generate-lesson/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // Send apiData from LessonForm
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log("results from api", result); // Assuming the API returns JSON with lesson content
      setPreviewContent(result);
    } catch (err) {
      console.error("Error generating lesson:", err);
      setError("Failed to generate lesson. Please try again."); // Set error message
    } finally {
      setIsLoading(false); // Always reset loading state
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await getAllCourses();
        setCourses(courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <LessonForm
        courses={courses}
        onGenerate={handleGenerate}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      <LessonPreview
        content={previewContent}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onClear={() => {
          setPreviewContent(null);
          setIsLoading(false);
        }}
      />
    </div>
  );
}
