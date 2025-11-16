"use client";

import { Card } from "@/components/old-ui/card";
import {
  BookA,
  BookOpen,
  ClipboardList,
  Video,
  Gamepad2,
  Award,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import React from "react";

export default function Page() {
  const types = [
    {
      name: "Lessons, Lectures & Exercises", // Combined into one
      href: "/admin/generate/lessons/create", // Shared URL
      icon: <BookA className="h-8 w-8" />, // You can choose a more generic icon if needed
      description: "Create and manage lessons, lectures, and exercises",
    },
    {
      name: "Courses",
      href: "/admin/generate/courses/create",
      icon: <BookOpen className="h-8 w-8" />,
      description: "Create and manage courses",
    },
    {
      name: "Games",
      href: "/admin/generate/games/create",
      icon: <Gamepad2 className="h-8 w-8" />,
      description: "Create and manage games",
    },
    {
      name: "Achievements",
      href: "/admin/generate/achievements/create",
      icon: <Award className="h-8 w-8" />,
      description: "Create and manage achievements",
    },
  ];

  return (
    <div className="p-6">
      {/* Animated Header */}
      <motion.header
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-bold">Generate Content</h1>
      </motion.header>

      {/* Animated Cards */}
      <motion.main
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 },
          },
        }}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((type, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Link href={type.href}>
                <Card className="group rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 text-blue-500 transition-all duration-500 group-hover:scale-125">
                      {type.icon}
                    </div>
                    <h2 className="mb-2 text-xl font-semibold">{type.name}</h2>
                    <p className="text-gray-600">{type.description}</p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.main>
    </div>
  );
}
