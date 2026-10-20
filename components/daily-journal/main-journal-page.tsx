// app/journal/page.tsx
"use client";

import { useState, useMemo } from "react";
import { SpeechProvider } from "@/context/speech-context";
import JournalModal from "./journal-modal";
import InteractiveReviewModal from "./interactive-review-modal";
import CompletedJournalsSidebar from "./completed-journal-sidebar";
import {
  BookAudio,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Mic,
  Plus,
  Quote,
  Sparkles,
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

export default function MainJournalPage({
  journals = [],
  nativeLanguage = "en-US",
}: {
  journals: any[];
  nativeLanguage?: string;
}) {
  return (
    <SpeechProvider>
      <JournalPageContent journals={journals} nativeLanguage={nativeLanguage} />
    </SpeechProvider>
  );
}

function JournalPageContent({
  journals,
  nativeLanguage = "en-US",
}: {
  journals: any[];
  nativeLanguage?: string;
}) {
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
  for (let i = 1; i <= daysInMonth; i++)
    calendarDays.push(new Date(year, month, i));

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const todayStr = formatDateEST(new Date());

  return (
    <div className="flex min-h-screen flex-col bg-slate-100/80 font-sans text-slate-900">
    {/* SPOON HEADER BANNER (Matches Learning Hub) */}
      <header className="relative shrink-0 overflow-hidden animate-bg pt-9 pb-22 text-white shadow-lg">
        {/* Subtle dark-glass contrast scrim so white text is always razor-sharp */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/25 via-slate-950/15 to-slate-950/35 backdrop-blur-[2px]" />

        {/* Soft ambient highlights */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[850px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          {/* Top Bar: Frosted Dark-Glass Pills */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/35 px-4 py-1.5 text-xs font-extrabold tracking-wide text-white uppercase shadow-sm backdrop-blur-md">
              <Mic className="h-4 w-4 text-cyan-300" />
              <span>Spoken Audio Diary</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/35 px-3.5 py-1.5 text-xs font-extrabold text-emerald-300 shadow-sm backdrop-blur-md">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{journals.length} Entries Logged</span>
              </div>
            </div>
          </div>

          <div className="max-w-3xl">
            <h1 className="flex items-center gap-3.5 text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(15,23,42,0.22)] sm:text-4xl lg:text-5xl">
              <span>Daily Journal</span>
              <BookAudio
                strokeWidth={2}
                className="size-9 text-white/95 drop-shadow-md sm:size-11"
              />
            </h1>
            <p className="mt-2.5 text-base font-medium text-white/90 drop-shadow-[0_1px_4px_rgba(15,23,42,0.18)] sm:text-lg">
              Reflect, record, and revisit your spoken thoughts day by day.
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-20 mx-auto -mt-12 w-full max-w-7xl px-6 pb-24 lg:px-8">
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <div className=" flex w-full flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white p-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => changeMonth(-1)}
                  className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <button
                  onClick={() => setCurrentDate(getESTDate())}
                  className="hidden rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:block"
                >
                  Today
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="border-r border-gray-200 py-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase last:border-r-0 sm:text-sm"
                >
                  <span className="hidden sm:inline">{d}</span>
                  <span className="sm:hidden">{d.charAt(0)}</span>
                </div>
              ))}
            </div>

            <div className="grid auto-rows-[minmax(120px,1fr)] grid-cols-7 gap-px bg-gray-200">
              {calendarDays.map((date, idx) => {
                if (!date) return <div key={idx} className="bg-gray-50/50" />;

                const dateStr = formatDateEST(date);
                const journalData = completedDates.get(dateStr);
                const isCompleted = !!journalData;
                const isToday = todayStr === dateStr;

                const hasAudio = !!journalData?.s3Key;
                const langCode =
                  journalData?.language?.split("-")[0].toUpperCase() || "EN";
                const transcriptPreview = journalData?.transcript;

                return (
                  <button
                    key={idx}
                    onClick={() => openModal(date)}
                    className={`group relative flex flex-col p-2 text-left transition-all duration-200 focus:ring-2 focus:ring-sky-500 focus:outline-hidden focus:ring-inset sm:p-3 ${
                      isCompleted
                        ? "bg-white hover:bg-emerald-50/30"
                        : "bg-white hover:bg-sky-50"
                    }`}
                  >
                    <div className="flex w-full items-start justify-between">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                          isToday
                            ? "bg-sky-500 text-white"
                            : isCompleted
                              ? "text-emerald-700"
                              : "text-gray-600 group-hover:text-sky-700"
                        }`}
                      >
                        {date.getDate()}
                      </span>

                      {!isCompleted && (
                        <Plus className="hidden h-4 w-4 text-sky-300 opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
                      )}

                      {isCompleted && hasAudio && (
                        <div className="rounded-full bg-emerald-100 p-1 text-emerald-600 shadow-xs">
                          <Mic className="h-3 w-3" />
                        </div>
                      )}
                    </div>

                    {isCompleted && transcriptPreview && (
                      <div className="mt-2 hidden w-full flex-1 sm:block">
                        <div className="flex gap-1 text-gray-500">
                          <Quote className="mt-0.5 h-3 w-3 shrink-0 opacity-50" />
                          <p className="line-clamp-2 text-xs leading-relaxed text-gray-600 italic">
                            &ldquo;{transcriptPreview}&rdquo;
                          </p>
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="mt-auto flex w-full flex-wrap items-center gap-1.5 pt-2">
                        {!journalData?.review && (
                          <span className="flex items-center gap-1 rounded-sm bg-emerald-500 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-xs">
                            <CheckCircle2 className="h-3 w-3" />{" "}
                            <span className="hidden md:inline">Logged</span>
                          </span>
                        )}
                        <span className="rounded-sm border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-gray-600">
                          {langCode}
                        </span>

                        {journalData?.review && (
                          <span className="mt-1 flex w-full items-center justify-center gap-1 rounded-sm border border-indigo-200 bg-indigo-100 px-1.5 py-1 text-[10px] font-bold tracking-wider text-indigo-700 shadow-xs transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                            <Sparkles className="h-3 w-3" /> REVIEW READY
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

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