"use client";

import { Lock, CheckCircle, PlayCircle, ChevronDown, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

export default function CoursePage({ course, userId, courseId }) {
  const [expandedLesson, setExpandedLesson] = useState(null);
  const router = useRouter();

  // Check if lesson is completed
  const isLessonCompleted = (lessonId) => {
    return course?.lessons?.some(
      (lesson) =>
        lesson.id === lessonId &&
        lesson.Progress?.some((p) => p.status === "COMPLETED")
    );
  };

  // Check lesson accessibility
  const canAccessLesson = (lessonIndex) => {
    if (lessonIndex === 0) return true;
    const previousLesson = course?.lessons?.[lessonIndex - 1];
    return previousLesson && isLessonCompleted(previousLesson.id);
  };

  // Handle lesson start
  const onStartLesson = async (lessonId) => {
    if (!userId) {
      toast.error("Please login to start the lesson");
      return;
    }

    try {
      const response = await fetch("/api/courses/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, lessonId, courseId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update progress");
      }

      const currentLesson = course?.lessons?.find((l) => l.id === lessonId);

      if (currentLesson?.exercises?.length > 0) {
        router.push(`/courses/${courseId}/lesson/${lessonId}/exercise/`);
      } else {
        router.push(`/courses/${courseId}/lesson/${lessonId}`);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Failed to start lesson");
    }
  };

  // Calculate progress
  const completedLessons = course?.lessons?.filter((l) => isLessonCompleted(l.id)).length || 0;
  const totalLessons = course?.lessons?.length || 0;
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="p-6">
      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {course.coverUrl && (
          <div className="relative mb-6 aspect-video overflow-hidden rounded-lg">
            <Image
              src={course.coverUrl}
              alt={course.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <h1 className="mb-4 text-3xl font-bold">{course.title}</h1>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
            />
          </div>
        </div>

        {/* Course Info */}
        <p className="mb-4 text-muted-foreground">{course.description}</p>
        <div className="flex gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {course.level}
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            {totalLessons} Lessons
          </span>
        </div>
      </motion.div>

      {/* Lessons List */}
      <div className="space-y-3">
        {course.lessons.map((lesson, index) => {
          const isUnlocked = canAccessLesson(index);
          const isCompleted = isLessonCompleted(lesson.id);
          const isExpanded = expandedLesson === lesson.id;

          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-lg border transition-colors ${
                isUnlocked ? "bg-card hover:border-primary/50" : "bg-muted/50"
              }`}
            >
              {/* Lesson Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : isUnlocked ? (
                    <PlayCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <h3 className="font-semibold">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {lesson.duration} • {lesson.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    disabled={!isUnlocked}
                    onClick={() => onStartLesson(lesson.id)}
                    variant={isCompleted ? "secondary" : "default"}
                    size="sm"
                  >
                    {isCompleted ? "Review" : isUnlocked ? "Start" : "Locked"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t px-4 pb-4 pt-3 space-y-3">
                      <div>
                        <h4 className="mb-1 text-sm font-semibold">Description</h4>
                        <p className="text-sm text-muted-foreground">{lesson.description}</p>
                      </div>
                      {lesson.topics && (
                        <div>
                          <h4 className="mb-2 text-sm font-semibold">Topics Covered</h4>
                          <ul className="space-y-1.5">
                            {lesson.topics.map((topic, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CircleCheck className="h-4 w-4 text-primary" />
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}