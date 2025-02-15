"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, ArrowRight, ChevronDown } from 'lucide-react';
import { Info } from 'lucide-react';

const CourseCard = ({ course }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Content Section */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
            {course.level}
          </span>
        </div>

        <h3 className="text-xl font-bold mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {course.description || "No Description Provided"}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>{course.lessons?.length} Lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>{course.duration || 'Self-paced'}</span>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          <span className='flex items-center gap-2'>
            <Info className="size-4" />
            Lesson Information
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        {/* Lessons List with Smooth Animation */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <ul className="pt-4 space-y-2">
                {course.lessons?.map((lesson, index) => (
                  <motion.li
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
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
        <div className="mt-auto pt-6 border-t group">
          <Link
            href={`/courses/${course.id}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            View Course
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-all duration-300" />
          </Link>
        </div>
      </div>

      {/* Image Section */}
      <div className="w-full md:w-1/3 relative min-h-[200px] md:min-h-[300px]">
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