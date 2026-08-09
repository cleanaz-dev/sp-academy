// components/journal/completed-journal-sidebar.tsx
"use client";

import { CheckCircle2, Mic, BookAudio, Play, Pause, Loader2, Sparkles } from "lucide-react";
import { useMiniAudioPlayer } from "@/hooks/use-mini-audio-player";

interface CompletedJournalsSidebarProps {
  completedDates: Map<string, any>;
  openModal: (date: Date) => void;
}

export default function CompletedJournalsSidebar({ 
  completedDates, 
  openModal 
}: CompletedJournalsSidebarProps) {
  
  const audioPlayer = useMiniAudioPlayer();
  
  const entries = Array.from(completedDates.entries()).sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  );

  return (
    <div className="w-full shrink-0 lg:w-80">
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 sticky top-8">
        <h3 className="mb-4 text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Completed Journals
        </h3>
        
        {entries.length > 0 ? (
          <div className="flex flex-col gap-3">
            {entries.map(([dateStr, journal]) => {
              const isCurrent = audioPlayer.currentS3Key === journal.s3Key;
              const isThisPlaying = isCurrent && audioPlayer.isPlaying;
              const isThisLoading = isCurrent && audioPlayer.isLoading;
              const hasReview = !!journal.review;

              return (
                <div
                  key={dateStr}
                  role="button"
                  tabIndex={0}
                  onClick={() => openModal(new Date(dateStr))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openModal(new Date(dateStr));
                    }
                  }}
                  className={`group flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    hasReview 
                      ? "bg-indigo-50/40 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50" 
                      : "bg-gray-50 border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                      {new Date(dateStr).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                    
                    {/* Play / Pause Toggle Button */}
                    {journal.s3Key && !hasReview && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          audioPlayer.play(journal.s3Key);
                        }}
                        className="p-1 rounded-full hover:bg-emerald-100 transition-colors"
                        aria-label={isThisPlaying ? "Pause audio" : "Play audio"}
                      >
                        {isThisLoading ? (
                          <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />
                        ) : isThisPlaying ? (
                          <Pause className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Mic className="w-3 h-3 text-emerald-500" />
                        )}
                      </button>
                    )}
                  </div>

                  {journal.transcript && (
                    <p className="text-xs text-gray-500 line-clamp-2 italic mb-2">
                      "{journal.transcript}"
                    </p>
                  )}

                  {/* INDICATOR: Review Ready */}
                  {hasReview && (
                    <div className="mt-auto w-full pt-1">
                      <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-indigo-100 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 border border-indigo-200 shadow-sm transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                        <Sparkles className="w-3 h-3" /> View Review
                      </span>
                    </div>
                  )}

                  {/* Mini Progress Bar */}
                  {isCurrent && audioPlayer.duration > 0 && !hasReview && (
                    <div className="w-full mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500" 
                        style={{ width: `${(audioPlayer.progress / audioPlayer.duration) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
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