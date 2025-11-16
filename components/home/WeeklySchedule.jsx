"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/old-ui/card";
import { format, addDays, startOfWeek } from "date-fns";

const dummySchedule = {
  Mon: { lessons: 2, quiz: false, exercise: true },
  Tue: { lessons: 1, quiz: true, exercise: false },
  Wed: { lessons: 3, quiz: false, exercise: true },
  Thu: { lessons: 0, quiz: false, exercise: false },
  Fri: { lessons: 2, quiz: false, exercise: true },
  Sat: { lessons: 1, quiz: true, exercise: true },
  Sun: { lessons: 0, quiz: false, exercise: false },
};

export default function WeeklySchedule() {
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(null);

  return (
    <div className="grid gap-4">
      <Card className="transition-shadow hover:shadow-lg">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="flex items-center justify-between text-lg font-semibold">
            <span>Weekly Schedule</span>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-blue-100"></span>{" "}
                Lessons
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-red-100"></span> Quiz
              </span>
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-green-100"></span>{" "}
                Exercise
              </span>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-3">
            {days.map((day, index) => {
              const currentDate = addDays(startDate, index);
              const formattedDate = format(currentDate, "MMM d");
              const { lessons, quiz, exercise } = dummySchedule[day] || {};
              const isToday =
                format(currentDate, "yyyy-MM-dd") ===
                format(today, "yyyy-MM-dd");
              const isSelected = selectedDay === day;

              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-sm font-semibold text-gray-800">
                    {day}
                  </div>
                  <div className="text-xs text-gray-500">{formattedDate}</div>
                  <div
                    className={`mt-2 flex h-16 w-full cursor-pointer flex-col items-center justify-center space-y-1 rounded-lg p-2 transition-all ${
                      isToday ? "bg-blue-100 text-blue-600" : "bg-gray-50"
                    } ${
                      isSelected ? "ring-2 ring-blue-400" : ""
                    } hover:bg-gray-100`}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                  >
                    {lessons > 0 && (
                      <p className="text-xs font-medium">📚 {lessons}</p>
                    )}
                    {quiz && <p className="text-xs font-semibold">📖</p>}
                    {exercise && <p className="text-xs">📝</p>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="h-[200px]">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {!selectedDay ? (
              <motion.div
                key="default"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex h-full flex-col items-center justify-center text-gray-500"
              >
                <p className="text-lg font-medium">
                  Select a day to view details
                </p>
                <p className="text-sm">
                  Click on any day above to see the schedule
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedDay} // This forces Framer Motion to re-render the div on selection change
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedDay}'s Schedule
                  </h3>
                  {/* <button
                    onClick={() => setSelectedDay(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button> */}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {dummySchedule[selectedDay]?.lessons > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center rounded-lg bg-blue-50 p-3"
                    >
                      <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        📚
                      </div>
                      <div>
                        <p className="text-sm font-medium md:text-base">
                          Lessons
                        </p>
                        <p className="text-xs text-gray-600 md:text-sm">
                          {dummySchedule[selectedDay].lessons} scheduled
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {dummySchedule[selectedDay]?.quiz && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center rounded-lg bg-red-50 p-3"
                    >
                      <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                        📖
                      </div>
                      <div>
                        <p className="text-sm font-medium md:text-base">Quiz</p>
                        <p className="text-xs text-gray-600 md:text-sm">
                          Today
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {dummySchedule[selectedDay]?.exercise && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center rounded-lg bg-green-50 p-3"
                    >
                      <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        📝
                      </div>
                      <div>
                        <p className="text-sm font-medium md:text-base">
                          Exercise
                        </p>
                        <p className="text-xs text-gray-600 md:text-sm">
                          Available
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
