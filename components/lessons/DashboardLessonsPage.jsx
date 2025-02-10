"use client"

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300 border-0 bg-white">
      <div className="flex flex-col md:flex-row h-full">
        {/* Image Section */}
        <div className="w-full h-12 md:w-[100px] md:h-full bg-gray-50 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400 to-purple-400" />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-4 md:p-6">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-xl text-gray-900 mb-2">
                {lesson.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0">
                  {lesson.subject}
                </Badge>
                <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-0">
                  Grade {lesson.level}
                </Badge>
                <Badge
                  className={`
                    ${lesson.type === "PRACTICE" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"} 
                    border-0`}
                >
                  {lesson.type}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4">{lesson.description}</p>

          {/* Topics Button */}
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mb-4 flex items-center justify-between text-gray-700 hover:bg-gray-50"
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
                className="overflow-hidden mb-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lesson.topics?.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="break-words">{topic}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-auto pt-4 border-t gap-4 sm:gap-0">
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
                <Badge className="bg-red-50 text-red-700 border-0">
                  Includes Quiz
                </Badge>
              )}
            </div>

            <Link href={`/lessons/${lesson.id}`} className="w-full sm:w-auto">
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 group flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Begin Lesson
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}