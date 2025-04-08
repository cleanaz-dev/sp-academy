"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getAllCoursesByUserId } from "@/lib/actions";
import { motion } from "framer-motion";
import Link from "next/link";
import CoursesGrid from "@/components/courses/CourseGrid";

export default function page() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
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

  // console.log("courses:", courses)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] py-16 text-white"
      >
        <div className="mx-auto max-w-7xl px-6">
          <motion.h1
            className="mb-4 text-4xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Courses
          </motion.h1>
          <motion.p
            className="mt-2 text-xl opacity-90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Knowledge is the key to success. Learn and grow, unlocking new
            possibilities. 🔑
          </motion.p>
        </div>
      </motion.header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="py-12"
        >
          <div className="mb-8 text-center">
            <h2 className="text-xl font-medium text-muted-foreground">
              Your enrolled courses
            </h2>
          </div>

          {courses.length > 0 ? (
            <CoursesGrid courses={courses} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="mb-4 text-gray-500">
                You're not enrolled in any courses yet.
              </div>
              <Link
                href="/courses"
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
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
