"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import CoursePage from "@/components/courses/CoursesPage";

export default function Page({ params }) {
  // State Management
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      if (!user || !params.id) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/courses?courseId=${params.id}&userId=${user.id}`);
        
        if (!response.ok) throw new Error("Failed to fetch course");
        
        const data = await response.json();
        setCourse(data);
      } catch (error) {
        toast.error("Failed to load course");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [params.id, user]);

  // Handle lesson start and progress tracking
  const onStartLesson = async (lessonId) => {
    if (!user) {
      toast.error("Please login to start the lesson");
      return;
    }

    try {
      // Update progress in backend
      const response = await fetch("/api/courses/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          lessonId,
          courseId: params.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update progress");
      }

      // Find the current lesson
      const currentLesson = course?.lessons?.find(lesson => lesson.id === lessonId);
      
      // Navigate to first exercise if exists, otherwise to lesson
      if (currentLesson?.exercises?.length > 0) {
        router.push(`/courses/${params.id}/lesson/${lessonId}/exercise/`);
      } else {
        router.push(`/courses/${params.id}/lesson/${lessonId}`);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Failed to start lesson - please contact support");
    }
  };

  // Check if lesson is completed
  const isLessonCompleted = (lessonId) => {
    return course?.lessons?.some(lesson => 
      lesson.id === lessonId &&
      lesson.Progress?.some(p => p.status === "COMPLETED")
    );
  };

  // Check lesson accessibility based on previous completion
  const canAccessLesson = (lessonIndex) => {
    if (lessonIndex === 0) return true; // First lesson always accessible
    const previousLesson = course?.lessons?.[lessonIndex - 1];
    return previousLesson && isLessonCompleted(previousLesson.id);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Render main content
  return (
    <div className="max-w-7xl mx-auto">
      {course ? (
        <CoursePage
          course={course}
          onStartLesson={onStartLesson}
          isLessonCompleted={isLessonCompleted}
          canAccessLesson={canAccessLesson}
        />
      ) : (
        <div className="text-center py-10">
          <p>Course not found or enrollment required</p>
        </div>
      )}
    </div>
  );
}