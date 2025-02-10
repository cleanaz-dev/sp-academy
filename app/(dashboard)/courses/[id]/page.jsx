"use client";

import React, { useState, useEffect } from "react";
import { getCourseById } from "@/lib/actions";
import CoursePage from "@/components/courses/CoursesPage";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export default function page({ params }) {
  const [course, setCourse] = useState(null);
  const router = useRouter();
  const { user } = useUser();

  // Fetch the course data using the provided ID with useEffect hook
  // This will ensure that the course data is fetched only when the page mounts or the course ID changes
  useEffect(() => {
    const fetchCourse = async () => {
      if (!params?.id) return; // Ensure ID exists before fetching
      const courseData = await getCourseById(params.id);
      setCourse(courseData);
    };

    fetchCourse();
  }, [params?.id]);

  // Define the onStartLesson function
  const onStartLesson = async (lessonId) => {
    console.log(`Starting lesson ${lessonId}`);
  
    try {
      const response = await fetch("/api/courses/progress/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          lessonId,
        }),
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update progress");
      }
  
      console.log("Progress updated successfully");
  
      // ✅ Only navigate if the update succeeds
      router.push(`/courses/${params.id}/lesson/${lessonId}`);
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Failed to start lesson and update progress, please contact your admin" )
    }
  };
  return (
    <>
      <header className="bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] animate-[gradient_6s_ease_infinite] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">Courses</h1>
          <p className="text-xl opacity-90">
            Dive in, complete courses, and unlock new skills with our AI-powered
            learning experiences! 🎯💡
          </p>
        </div>
      </header>
      <div className="max-w-7xl mx-auto container">
        <CoursePage course={course} onStartLesson={onStartLesson} />
      </div>
    </>
  );
}
