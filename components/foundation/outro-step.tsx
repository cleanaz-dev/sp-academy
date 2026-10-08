"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Volume2,
  Square,
  Frown,
  Meh,
  Smile,
  Loader2,
  BrainCircuit,
  ChevronRight,
  X,
} from "lucide-react";
import { useS3Media } from "@/context/s3-context";
import { WordMatrix } from "./matrix/word-matrix";

// Shared cap so the native and target cards truncate to the same length
const MAX_OUTRO_CHARS = 50;

type Feedback = "hard" | "ok" | "easy";

function truncateToChars(text: string, maxChars: number): string {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  const sliced = text.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${lastSpace > maxChars * 0.6 ? sliced.slice(0, lastSpace) : sliced}…`;
}

export function OutroStep({
  data,
  userId,
  targetLang = "fr-FR", // Fallback if not passed
  onFinish,
}: {
  data: any;
  userId: string;
  targetLang?: string;
  onFinish: (feedback: Feedback) => Promise<void>;
}) {
  const handoff = data.lessonHandoff || {};
  const { urls, isLoading } = useS3Media([
    handoff.outroNativeAudio,
    handoff.outroTargetAudio,
  ]);
  const [nativeUrl, targetUrl] = urls;

  const [activeAudio, setActiveAudio] = useState<"native" | "target" | null>(
    null,
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // --- FINISH STATE ---
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  // --- MATRIX STATES ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [matrixStats, setMatrixStats] = useState({
    totalWords: 0,
    avgMastery: 0,
    topWords: [] as any[],
  });
  const [isMatrixLoading, setIsMatrixLoading] = useState(true);

  // 1. Fetch Mini Matrix Summary on mount
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/matrix/${targetLang}`);
        if (res.ok) {
          const { words } = await res.json();
          if (words && words.length > 0) {
            const sorted = words.sort(
              (a: any, b: any) => b.masteryScore - a.masteryScore,
            );
            const avg = Math.round(
              words.reduce((acc: number, w: any) => acc + w.masteryScore, 0) /
                words.length,
            );
            setMatrixStats({
              totalWords: words.length,
              avgMastery: avg,
              topWords: sorted.slice(0, 5), // Grab top 5 for the mini display
            });
          }
        }
      } catch (e) {
        console.error("Failed to load mini matrix:", e);
      } finally {
        setIsMatrixLoading(false);
      }
    };
    fetchSummary();
  }, [userId, targetLang]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const toggleAudio = (type: "native" | "target") => {
    if (activeAudio === type) {
      audioRef.current?.pause();
      setActiveAudio(null);
      return;
    }
    const resolvedUrl = type === "native" ? nativeUrl : targetUrl;
    if (!resolvedUrl) return;
    if (audioRef.current) audioRef.current.pause();

    const audio = new Audio(resolvedUrl);
    audioRef.current = audio;
    audio.onended = () => setActiveAudio(null);
    audio.play().catch(() => setActiveAudio(null));
    setActiveAudio(type);
  };

  const handleFinish = async () => {
    if (isFinishing || !feedback) return;
    audioRef.current?.pause();
    setIsFinishing(true);
    setFinishError(null);
    try {
      await onFinish(feedback);
    } catch (e) {
      setFinishError(e instanceof Error ? e.message : "Something went wrong");
      setIsFinishing(false); // only re-enable on failure; success navigates away
    }
  };

  const outroNativeText = truncateToChars(handoff.outroNative, MAX_OUTRO_CHARS);
  const outroTargetText = truncateToChars(handoff.outroTarget, MAX_OUTRO_CHARS);

  return (
    <>
      <div className="flex flex-col h-full p-6 md:p-8 animate-in fade-in duration-500 overflow-y-auto">
        {/* Header */}
        <div className="mb-8 text-center flex flex-col items-center shrink-0">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2">
            Mission Accomplished!
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-xl">
            You've completed Day {handoff.day || 1}. Let's review what you
            learned and wrap things up.
          </p>
        </div>

        {/* Outro Audio Players */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch shrink-0">
          <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex gap-3 items-start">
            <button
              onClick={() => toggleAudio("native")}
              disabled={isLoading || !nativeUrl}
              className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isLoading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : activeAudio === "native"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : activeAudio === "native" ? (
                <Square size={18} className="fill-current" />
              ) : (
                <Volume2 size={18} />
              )}
            </button>
            <p
              className="text-gray-700 text-sm sm:text-base flex-1 break-words"
              title={handoff.outroNative}
            >
              {outroNativeText}
            </p>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl shadow-sm flex gap-3 items-start">
            <button
              onClick={() => toggleAudio("target")}
              disabled={isLoading || !targetUrl}
              className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                isLoading
                  ? "bg-white text-gray-400 cursor-not-allowed border border-gray-200"
                  : activeAudio === "target"
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-gray-50 text-blue-600"
              }`}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : activeAudio === "target" ? (
                <Square size={18} className="fill-current" />
              ) : (
                <Play size={18} className="fill-current ml-1" />
              )}
            </button>
            <p
              className="text-blue-900 font-medium text-sm sm:text-base flex-1 break-words"
              title={handoff.outroTarget}
            >
              {outroTargetText}
            </p>
          </div>
        </div>

        {/* 🧠 MINI MATRIX DASHBOARD */}
        <div className="mb-8 shrink-0">
          <div className="bg-gray-900 rounded-3xl p-1 shadow-lg relative overflow-hidden group">
            <div className="bg-gray-900 rounded-[22px] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex-1 w-full text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-400 font-bold uppercase tracking-widest text-xs mb-3">
                  <BrainCircuit size={16} /> Matrix Synced
                </div>

                {isMatrixLoading ? (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 h-8">
                    <Loader2 size={18} className="animate-spin" /> Compiling
                    stats...
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-extrabold text-white mb-3">
                      {matrixStats.totalWords} Words Tracked
                    </h3>

                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      {matrixStats.topWords.map((w, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-800 text-gray-200 border border-gray-700 px-3 py-1 rounded-lg text-xs font-semibold"
                        >
                          {w.word}
                        </span>
                      ))}
                      {matrixStats.totalWords > 5 && (
                        <span className="bg-gray-800 text-gray-400 border border-gray-700 px-3 py-1 rounded-lg text-xs font-semibold">
                          +{matrixStats.totalWords - 5} more
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setIsDrawerOpen(true)}
                disabled={isMatrixLoading}
                className="w-full sm:w-auto shrink-0 bg-white hover:bg-gray-100 text-gray-900 px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                View Details <ChevronRight size={18} />
              </button>
            </div>

            <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 to-purple-600/20 blur-xl z-0 group-hover:opacity-100 transition-opacity opacity-50" />
          </div>
        </div>

        {/* User Feedback */}
        <div className="mt-auto border-t border-gray-100 pt-6 pb-2 text-center shrink-0">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            How was today's lesson?
          </h3>

          <div className="flex justify-center gap-3 sm:gap-6 mb-6">
            <button
              onClick={() => setFeedback("hard")}
              disabled={isFinishing}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                feedback === "hard"
                  ? "bg-red-50 text-red-600 scale-110 shadow-sm ring-2 ring-red-200"
                  : "text-gray-400 hover:bg-gray-50 hover:text-red-500 hover:scale-105"
              }`}
            >
              <Frown size={40} />
              <span className="font-bold text-[10px] sm:text-xs uppercase tracking-widest">
                Hard
              </span>
            </button>

            <button
              onClick={() => setFeedback("ok")}
              disabled={isFinishing}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                feedback === "ok"
                  ? "bg-blue-50 text-blue-600 scale-110 shadow-sm ring-2 ring-blue-200"
                  : "text-gray-400 hover:bg-gray-50 hover:text-blue-500 hover:scale-105"
              }`}
            >
              <Meh size={40} />
              <span className="font-bold text-[10px] sm:text-xs uppercase tracking-widest">
                OK
              </span>
            </button>

            <button
              onClick={() => setFeedback("easy")}
              disabled={isFinishing}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                feedback === "easy"
                  ? "bg-green-50 text-green-600 scale-110 shadow-sm ring-2 ring-green-200"
                  : "text-gray-400 hover:bg-gray-50 hover:text-green-500 hover:scale-105"
              }`}
            >
              <Smile size={40} />
              <span className="font-bold text-[10px] sm:text-xs uppercase tracking-widest">
                Easy
              </span>
            </button>
          </div>

          <button
            onClick={handleFinish}
            disabled={!feedback || isFinishing}
            className={`w-full sm:w-80 mx-auto py-3.5 font-bold rounded-xl text-base transition-all shadow-md active:scale-95 ${
              feedback && !isFinishing
                ? "bg-gray-900 hover:bg-black text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isFinishing ? "Preparing your next lesson..." : "Continue"}
          </button>
          {finishError && (
            <p className="text-red-600 text-sm mt-3">{finishError}</p>
          )}
        </div>
      </div>

      {/* 🚀 FULL MATRIX SLIDE-OVER DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="relative w-full max-w-3xl bg-gray-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <BrainCircuit className="text-blue-500" />
                <h2>Detailed Neural Matrix</h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <WordMatrix userId={userId} targetLang={targetLang} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}