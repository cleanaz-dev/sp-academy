"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getAllCoursesByUserId } from "@/lib/actions";
import { motion } from 'framer-motion';
import Link from 'next/link';
import CoursesGrid from "@/components/courses/CourseGrid";

export default function page() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser()
  const userId = user?.id;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getAllCoursesByUserId(userId);
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCourses();
    }
  }, [userId]);

  console.log("courses:", courses)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] animate-[gradient_6s_ease_infinite] text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.h1 
            className="text-4xl font-bold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Courses
          </motion.h1>
          <motion.p
            className="text-xl opacity-90 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Knowledge is the key to success. Learn and grow, unlocking new possibilities. 🔑
          </motion.p>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="py-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-xl text-muted-foreground font-medium">
              Your enrolled courses
            </h2>
          </div>

          {courses.length > 0 ? (
            <CoursesGrid courses={courses} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-gray-500 mb-4">
                You're not enrolled in any courses yet.
              </div>
              <Link
                href="/courses"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Browse Available Courses
              </Link>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}