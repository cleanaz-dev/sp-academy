"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, ArrowRight, ChevronDown, Info } from "lucide-react";

export default function CoursesGrid({ courses }) {
  const [expandedCourses, setExpandedCourses] = useState({});

  const toggleExpand = (courseId) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      {courses.map((course) => {
        const isExpanded = expandedCourses[course.id];

        return (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col overflow-hidden rounded-lg bg-card shadow-lg transition-shadow hover:shadow-xl md:flex-row"
          >
            <div className="flex flex-1 flex-col p-6">
              <span className="mb-4 w-fit rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {course.level}
              </span>

              <h3 className="mb-2 text-xl font-bold">{course.title}</h3>
              <p className="mb-4 line-clamp-3 text-muted-foreground">
                {course.description || "No description provided"}
              </p>

              <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>{course.lessons?.length || 0} Lessons</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{course.duration || "Self-paced"}</span>
                </div>
              </div>

              {course.lessons?.length > 0 && (
                <>
                  <button
                    onClick={() => toggleExpand(course.id)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-primary hover:bg-accent"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Info className="h-4 w-4" />
                      Lesson Information
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-1.5 overflow-hidden pt-3"
                      >
                        {course.lessons.map((lesson, index) => (
                          <motion.li
                            key={lesson.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
                          >
                            <span className="text-muted-foreground">{index + 1}.</span>
                            <span>{lesson.title}</span>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              )}

              <div className="group mt-auto border-t pt-4">
                <Link
                  href={`/courses/${course.id}`}
                  scroll={false}
                  className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                >
                  View Course
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {course.coverUrl && (
              <div className="relative h-48 w-full md:h-auto md:w-1/3">
                <Image
                  src={course.coverUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}