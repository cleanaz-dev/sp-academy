"use client";

import { Lock, CheckCircle, PlayCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CircleCheckBig } from "lucide-react";
import { CircleCheck } from "lucide-react";

export default function CoursePage({ course, userProgress, onStartLesson }) {
  const [expandedLesson, setExpandedLesson] = useState(null);

  return (
    <div className="p-6 min-h-screen relative">
      {!course ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-gray-500">Course not found</p>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">
                Progress: {Math.round(userProgress?.overallProgress || 0)}%
              </span>
            </div>
            <div className="bg-gray-100 rounded-full h-4 mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${userProgress?.overallProgress || 0}%` }}
                transition={{ duration: 1 }}
                className="bg-gradient-to-r from-blue-600 to-violet-600 h-full rounded-full"
              />
            </div>
          </motion.div>

          <motion.div className="space-y-4" layout>
            {course.lessons.map((lesson, index) => {
              const isUnlocked =
                index === 0 ||
                userProgress?.completedLessons.includes(
                  course.lessons[index - 1].id
                );
              const isCompleted = userProgress?.completedLessons.includes(
                lesson.id
              );
              const isExpanded = expandedLesson === lesson.id;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    damping: 25,
                    duration: 1,
                    delay: index * 0.1,
                  }}
                  layout
                  className={`border rounded-lg ${
                    isUnlocked ? "bg-white hover:border-blue-200" : "bg-gray-50"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {isCompleted ? (
                          <CheckCircle className="text-green-500" />
                        ) : isUnlocked ? (
                          <PlayCircle className="text-blue-500" />
                        ) : (
                          <Lock className="text-gray-400" />
                        )}
                        <div>
                          <h3 className="font-medium">{lesson.title} {lesson.id}</h3>
                          <p className="text-sm text-gray-500">
                            {lesson.duration} • {lesson.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          disabled={!isUnlocked}
                          onClick={() => onStartLesson(lesson.id)}
                          variant={isUnlocked ? "default" : "outline"}
                          className="transition-all duration-200"
                        >
                          {isCompleted
                            ? "Review"
                            : isUnlocked
                            ? "Start Lesson"
                            : "Locked"}
                        </Button>
                        <motion.button
                          initial={false}
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          onClick={() =>
                            setExpandedLesson(isExpanded ? null : lesson.id)
                          }
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t">
                          <div className="text-sm text-gray-600 space-y-3">
                            <div>
                              <h4 className="font-semibold mb-1">Description:</h4>
                              <p>{lesson.description}</p>
                            </div>
                            {lesson.topics && (
                              <div>
                                <h4 className="font-semibold mb-1">
                                  Topics covered:
                                </h4>
                                <ul className="list-none list-inside space-y-2">
                                  {lesson.topics.map((topic, i) => (
                                    <li key={i} className="flex items-center gap-2 ">
                                      <CircleCheck strokeWidth={1} size={20} />
                                      {topic}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}
    </div>
  );
}
