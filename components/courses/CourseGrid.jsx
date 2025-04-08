"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, ArrowRight, ChevronDown } from "lucide-react";
import { Info } from "lucide-react";

const CourseCard = ({ course }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col overflow-hidden rounded-lg bg-white shadow-lg transition-shadow hover:shadow-xl md:flex-row"
    >
      {/* Content Section */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
            {course.level}
          </span>
        </div>

        <h3 className="mb-2 text-xl font-bold">{course.title}</h3>
        <p className="mb-4 line-clamp-3 text-gray-600">
          {course.description || "No Description Provided"}
        </p>

        <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span>{course.lessons?.length} Lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>{course.duration || "Self-paced"}</span>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between rounded-lg py-2 text-blue-600 hover:bg-blue-50"
        >
          <span className="flex items-center gap-2">
            <Info className="size-4" />
            Lesson Information
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </button>

        {/* Lessons List with Smooth Animation */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <ul className="space-y-2 pt-4">
                {course.lessons?.map((lesson, index) => (
                  <motion.li
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 rounded p-2 hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-500">{index + 1}.</span>
                    <span className="text-gray-700">{lesson.title}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed "View Course" Button */}
        <div className="group mt-auto border-t pt-6">
          <Link
            href={`/courses/${course.id}`}
            className="inline-flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800"
          >
            View Course
            <ArrowRight className="h-4 w-4 transition-all duration-300 group-hover:translate-x-2" />
          </Link>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative min-h-[200px] w-full md:min-h-[300px] md:w-1/3">
        <Image
          src={course.coverUrl || "https://placehold.co/400"}
          alt={course.title}
          fill
          className="object-cover"
          priority
        />
      </div>
    </motion.div>
  );
};

const CoursesGrid = ({ courses }) => (
  <div className="flex flex-col gap-6 p-6">
    {courses.map((course) => (
      <CourseCard key={course.id} course={course} />
    ))}
  </div>
);
export default CoursesGrid;
