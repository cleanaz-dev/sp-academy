// components/journal/completed-journals-sidebar.tsx
"use client";

import { CheckCircle2, Mic, BookAudio } from "lucide-react";

interface CompletedJournalsSidebarProps {
  completedDates: Map<string, any>;
  openModal: (date: Date) => void;
}

export default function CompletedJournalsSidebar({ 
  completedDates, 
  openModal 
}: CompletedJournalsSidebarProps) {
  
  const entries = Array.from(completedDates.entries()).sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  ); // Sort newest first

  return (
    <div className="w-full shrink-0 lg:w-80">
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 sticky top-8">
        <h3 className="mb-4 text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Completed Journals
        </h3>
        
        {entries.length > 0 ? (
          <div className="flex flex-col gap-2">
            {entries.map(([dateStr, journal]) => (
              <button
                key={dateStr}
                onClick={() => openModal(new Date(dateStr))}
                className="group flex flex-col items-start rounded-lg bg-gray-50 border border-gray-100 p-3 text-left hover:border-emerald-200 hover:bg-emerald-50/50 transition-all"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-700">
                    {new Date(dateStr).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                  {/* Now we just check for s3Key instead of audioUrl */}
                  {journal.s3Key && (
                    <Mic className="w-3 h-3 text-emerald-500" />
                  )}
                </div>
                {journal.transcript && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1 italic">
                    "{journal.transcript}"
                  </p>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center bg-gray-50">
            <BookAudio className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">No journals yet</p>
            <p className="text-xs text-gray-400 mt-1">Click a day on the calendar to start your first entry.</p>
          </div>
        )}
      </div>
    </div>
  );
}