"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { SpeechProvider } from "@/context/speech-context"; // Adjust path
import JournalModal from "./journal-modal"; // Adjust path
import { BookAudio, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] py-12 text-white shrink-0"
      >
        <div className="mx-auto w-full max-w-[1600px] px-6">
          <motion.h1
            className="flex items-center gap-2 mb-2 text-3xl font-bold md:text-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Daily Journal
            <BookAudio className="size-8" />
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

      {/* Main Content - Expanded Width with Flex Layout */}
      <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        {/* lg:flex-row ensures it stacks on mobile, but goes side-by-side on desktop */}
        <div className="flex flex-col gap-8 lg:flex-row items-start">
          
          {/* BIG CALENDAR SECTION */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex-1 w-full rounded-xl bg-white shadow-sm border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => changeMonth(-1)}
                  className="flex items-center gap-1 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="rounded-md bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors hidden sm:block"
                >
                  Today
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  className="flex items-center gap-1 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-3 text-center text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider border-r last:border-r-0 border-gray-200">
                  <span className="hidden sm:inline">{d}</span>
                  <span className="sm:hidden">{d.charAt(0)}</span>
                </div>
              ))}
            </div>

            {/* Days grid - Large layout */}
            <div className="grid grid-cols-7 auto-rows-[minmax(100px,1fr)] bg-gray-200 gap-px">
              {calendarDays.map((date, idx) => {
                if (!date) return <div key={idx} className="bg-gray-50/50" />; // Empty cells
                
                const dateStr = formatDate(date);
                const isCompleted = completedDates.has(dateStr);
                const isToday = formatDate(new Date()) === dateStr;
                const journalData = completedDates.get(dateStr);

                return (
                  <button
                    key={idx}
                    onClick={() => openModal(date)}
                    className="relative flex flex-col p-2 sm:p-3 text-left transition-colors bg-white hover:bg-sky-50 group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
                  >
                    <div className="flex justify-between items-start w-full">
                      <span
                        className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${
                          isToday
                            ? "bg-sky-500 text-white"
                            : "text-gray-700 group-hover:text-sky-700"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>

                    {/* Display entry info if completed */}
                    {isCompleted && (
                      <div className="mt-1 sm:mt-2 w-full">
                        <div className="bg-emerald-100 border border-emerald-200 rounded p-1.5 sm:p-2 text-[10px] sm:text-xs text-emerald-800 flex flex-col gap-1 shadow-sm">
                          <div className="flex items-center gap-1 font-semibold">
                             <CheckCircle2 className="w-3 h-3 shrink-0" />
                             <span className="truncate">Entry Logged</span>
                          </div>
                          {journalData?.title && (
                             <span className="truncate opacity-80 hidden sm:block">{journalData.title}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* RIGHT SIDEBAR (Completed Days) */}
          <div className="w-full shrink-0 lg:w-80">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 sticky top-8">
              <h3 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Completed Journals</h3>
              {Array.from(completedDates.keys()).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from(completedDates.entries()).map(([dateStr]) => (
                    <button
                      key={dateStr}
                      onClick={() => openModal(new Date(dateStr))}
                      className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200 transition-colors shadow-sm"
                    >
                      {new Date(dateStr).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
                  <p className="text-sm text-gray-500">No journals completed yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Click a day to start writing!</p>
                </div>
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