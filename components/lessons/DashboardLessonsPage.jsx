"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  BookOpen,
  ArrowRight,
  CheckCircle,
  ListChecks,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { getAllLessons } from "@/lib/actions";
import { Badge } from "../ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const data = await getAllLessons();
        setLessons(data);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Course Lessons</h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete all lessons to master this course
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LessonCard({ lesson }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden border-0 bg-white transition-all duration-300 hover:shadow-md">
      <div className="flex h-full flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative flex h-12 w-full items-center justify-center overflow-hidden bg-gray-50 md:h-full md:w-[100px]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-br from-blue-400 to-purple-400" />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-4 md:p-6">
          {/* Header Info */}
          <div className="mb-4 flex flex-col items-start justify-between sm:flex-row">
            <div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {lesson.title}
              </h3>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge className="border-0 bg-blue-50 text-blue-700 hover:bg-blue-100">
                  {lesson.subject}
                </Badge>
                <Badge className="border-0 bg-purple-50 text-purple-700 hover:bg-purple-100">
                  Grade {lesson.level}
                </Badge>
                <Badge
                  className={` ${lesson.type === "PRACTICE" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"} border-0`}
                >
                  {lesson.type}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="mb-4 text-sm text-gray-600">{lesson.description}</p>

          {/* Topics Button */}
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mb-4 flex w-full items-center justify-between text-gray-700 hover:bg-gray-50"
          >
            <span className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Topics Covered
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </Button>

          {/* Topics Section */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-4 overflow-hidden"
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {lesson.topics?.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle className="h-3 w-3 flex-shrink-0 text-green-500" />
                      <span className="break-words">{topic}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Info */}
          <div className="mt-auto flex flex-col items-start justify-between gap-4 border-t pt-4 sm:flex-row sm:items-center sm:gap-0">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{lesson.duration} minutes</span>
              </div>
              {lesson.teacher && (
                <div className="flex items-center gap-2">
                  <img
                    src={lesson.teacher.avatar}
                    alt={lesson.teacher.name}
                    className="h-6 w-6 rounded-full"
                  />
                  <span>{lesson.teacher.name}</span>
                </div>
              )}
              {lesson.quiz && (
                <Badge className="border-0 bg-red-50 text-red-700">
                  Includes Quiz
                </Badge>
              )}
            </div>

            <Link href={`/lessons/${lesson.id}`} className="w-full sm:w-auto">
              <Button
                variant="ghost"
                className="group flex w-full items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 sm:w-auto"
              >
                Begin Lesson
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
