"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { SpeechProvider } from "@/context/speech-context"; // Adjust path to match your setup
import JournalModal from "./journal-modal"; // Adjust path to match your file structure
import { BookAudio } from "lucide-react";

// Helper to format date safely to YYYY-MM-DD (local time)
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function MainJournalPage({ journals = [] }: { journals: any[] }) {
  return (
    <SpeechProvider>
      <JournalPageContent journals={journals} />
    </SpeechProvider>
  );
}

function JournalPageContent({ journals }: { journals: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Map completed journals by date string for easy lookup
  const completedDates = useMemo(() => {
    const map = new Map<string, any>();
    journals.forEach((j) => {
      const d = new Date(j.createdAt);
      map.set(formatDate(d), j);
    });
    return map;
  }, [journals]);

  const openModal = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  // --- Calendar Logic ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(new Date(year, month, i));

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] py-12 text-white"
      >
        <div className="mx-auto max-w-7xl px-6">
          <motion.h1
            className="flex items-center gap-2 mb-2 text-3xl font-bold md:text-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Daily Journal
            <BookAudio 
            className="size-8"
            />
          </motion.h1>
          <motion.p
            className="mt-2 text-lg opacity-90 md:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Reflect, record, and revisit your thoughts. 🎙️
          </motion.p>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row">
          
          {/* Calendar Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex-1 rounded-xl bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => changeMonth(-1)}
                  className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
                >
                  Prev
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, idx) => {
                if (!date) return <div key={idx} />;
                const dateStr = formatDate(date);
                const isCompleted = completedDates.has(dateStr);
                const isToday = formatDate(new Date()) === dateStr;

                return (
                  <button
                    key={idx}
                    onClick={() => openModal(date)}
                    className={`relative flex h-10 items-center justify-center rounded-lg text-sm transition-colors ${
                      isToday ? "ring-2 ring-blue-500" : ""
                    } ${
                      isCompleted
                        ? "bg-emerald-50 font-medium text-emerald-700 hover:bg-emerald-100"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {date.getDate()}
                    {isCompleted && (
                      <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Right Sidebar (Completed Days) */}
          <div className="w-full shrink-0 md:w-80">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-700">Completed Journals</h3>
              {Array.from(completedDates.keys()).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from(completedDates.entries()).map(([dateStr]) => (
                    <button
                      key={dateStr}
                      onClick={() => openModal(new Date(dateStr))}
                      className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200"
                    >
                      {new Date(dateStr).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No journals completed yet.</p>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <JournalModal
          date={selectedDate}
          onClose={closeModal}
          existingEntry={selectedDate ? completedDates.get(formatDate(selectedDate)) : null}
        />
      )}
    </div>
  );
}