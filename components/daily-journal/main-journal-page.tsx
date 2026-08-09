// app/journal/page.tsx
"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { SpeechProvider } from "@/context/speech-context"; 
import JournalModal from "./journal-modal"; 
import InteractiveReviewModal from "./interactive-review-modal";
import CompletedJournalsSidebar from "./completed-journal-sidebar";
import { 
  BookAudio, ChevronLeft, ChevronRight, CheckCircle2, Mic, Plus, Quote, Sparkles
} from "lucide-react";

// --- TIMEZONE HELPERS (Hardcoded to EST for now) ---
const TIMEZONE = "America/New_York";

// 1. Formats any date (UTC or local) into a strict EST "YYYY-MM-DD" string
const formatDateEST = (date: Date | string) => {
  const d = new Date(date);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(d);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
};

// 2. Returns a Date object shifted to represent the current time in EST
const getESTDate = (date: Date = new Date()) => {
  return new Date(date.toLocaleString("en-US", { timeZone: TIMEZONE }));
};


export default function MainJournalPage({ journals = [], nativeLanguage = "en-US" }: { journals: any[], nativeLanguage?: string }) {
  return (
    <SpeechProvider>
      <JournalPageContent journals={journals} nativeLanguage={nativeLanguage} />
    </SpeechProvider>
  );
}

function JournalPageContent({ journals, nativeLanguage }: { journals: any[], nativeLanguage?: string }) {
  // Initialize calendar with current EST time
  const [currentDate, setCurrentDate] = useState(getESTDate());
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<any>(null); 

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Map journals using their exact EST date
  const completedDates = useMemo(() => {
    const map = new Map<string, any>();
    journals.forEach((j) => {
      // Convert database UTC date into an EST YYYY-MM-DD string
      const estString = formatDateEST(j.entryDate || j.createdAt);
      map.set(estString, j);
    });
    return map;
  }, [journals]);

  const openModal = (dateOrStr: Date | string) => {
    let dateStr: string;
    let actualDate: Date;

    if (typeof dateOrStr === "string") {
      dateStr = dateOrStr;
      // To prevent timezone shifting, parse the string as local time by adding T12:00:00
      actualDate = new Date(`${dateStr}T12:00:00`); 
    } else {
      dateStr = formatDateEST(dateOrStr);
      actualDate = new Date(`${dateStr}T12:00:00`);
    }

    const journalData = completedDates.get(dateStr);
    
    setSelectedDate(actualDate);
    setSelectedJournal(journalData || null);

    if (journalData?.review) {
      setIsReviewModalOpen(true);
    } else {
      setIsRecordModalOpen(true);
    }
  };

  const closeModals = () => {
    setIsRecordModalOpen(false);
    setIsReviewModalOpen(false);
    setSelectedDate(null);
    setSelectedJournal(null);
  };

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

  const todayStr = formatDateEST(new Date());

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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

      <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row items-start">
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex-1 w-full rounded-xl bg-white shadow-sm border border-gray-200 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </h2>
              <div className="flex gap-2">
                <button onClick={() => changeMonth(-1)} className="flex items-center gap-1 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button onClick={() => setCurrentDate(getESTDate())} className="rounded-md bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors hidden sm:block">
                  Today
                </button>
                <button onClick={() => changeMonth(1)} className="flex items-center gap-1 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-3 text-center text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider border-r last:border-r-0 border-gray-200">
                  <span className="hidden sm:inline">{d}</span>
                  <span className="sm:hidden">{d.charAt(0)}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-[minmax(120px,1fr)] bg-gray-200 gap-px">
              {calendarDays.map((date, idx) => {
                if (!date) return <div key={idx} className="bg-gray-50/50" />;
                
                const dateStr = formatDateEST(date);
                const journalData = completedDates.get(dateStr);
                const isCompleted = !!journalData;
                const isToday = todayStr === dateStr;
                
                const hasAudio = !!journalData?.s3Key;
                const langCode = journalData?.language?.split("-")[0].toUpperCase() || "EN";
                const transcriptPreview = journalData?.transcript;

                return (
                  <button
                    key={idx}
                    onClick={() => openModal(date)}
                    className={`relative flex flex-col p-2 sm:p-3 text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 ${
                      isCompleted ? "bg-white hover:bg-emerald-50/30" : "bg-white hover:bg-sky-50"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className={`text-sm font-semibold h-7 w-7 flex items-center justify-center rounded-full transition-colors ${
                          isToday ? "bg-sky-500 text-white" : isCompleted ? "text-emerald-700" : "text-gray-600 group-hover:text-sky-700"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      
                      {!isCompleted && (
                         <Plus className="w-4 h-4 text-sky-300 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                      )}

                      {isCompleted && hasAudio && (
                        <div className="bg-emerald-100 text-emerald-600 rounded-full p-1 shadow-sm">
                          <Mic className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {isCompleted && transcriptPreview && (
                      <div className="mt-2 hidden sm:block w-full flex-1">
                        <div className="flex gap-1 text-gray-500">
                          <Quote className="w-3 h-3 shrink-0 mt-0.5 opacity-50" />
                          <p className="text-xs italic leading-relaxed text-gray-600 line-clamp-2">
                            "{transcriptPreview}"
                          </p>
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="mt-auto pt-2 w-full flex flex-wrap items-center gap-1.5">
                        {!journalData?.review && (
                          <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-medium shadow-sm">
                            <CheckCircle2 className="w-3 h-3" /> <span className="hidden md:inline">Logged</span>
                          </span>
                        )}
                        <span className="bg-gray-100 text-gray-600 border border-gray-200 text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wider">
                          {langCode}
                        </span>
                        
                        {journalData?.review && (
                           <span className="text-[10px] w-full mt-1 bg-indigo-100 border border-indigo-200 text-indigo-700 px-1.5 py-1 rounded-sm font-bold tracking-wider flex justify-center items-center gap-1 shadow-sm transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                             <Sparkles className="w-3 h-3" /> REVIEW READY
                           </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          <CompletedJournalsSidebar 
            completedDates={completedDates} 
            openModal={openModal} 
          />
        </div>
      </main>

      {isRecordModalOpen && (
         <JournalModal
          date={selectedDate}
          onClose={closeModals}
          existingEntry={selectedJournal}
          nativeLanguage={nativeLanguage}
        />
      )}

      {isReviewModalOpen && selectedJournal && (
        <InteractiveReviewModal
          onClose={closeModals}
          onComplete={closeModals}
          journal={selectedJournal}
        />
      )}
    </div>
  );
}