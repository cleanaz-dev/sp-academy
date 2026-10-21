"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  X,
} from "lucide-react";
import { useS3Media } from "@/context/s3-context";
import { WordMatrix } from "./matrix/word-matrix";

type Feedback = "hard" | "ok" | "easy";

const FLAG_MAP: Record<string, { flag: string; label: string }> = {
  "en-US": { flag: "🇺🇸", label: "English" },
  "fr-FR": { flag: "🇫🇷", label: "Français" },
  "es-ES": { flag: "🇪🇸", label: "Español" },
  "de-DE": { flag: "🇩🇪", label: "Deutsch" },
  "it-IT": { flag: "🇮🇹", label: "Italiano" },
  "pt-BR": { flag: "🇧🇷", label: "Português" },
  "ja-JP": { flag: "🇯🇵", label: "日本語" },
  "ko-KR": { flag: "🇰🇷", label: "한국어" },
  "zh-CN": { flag: "🇨🇳", label: "中文" },
  "ru-RU": { flag: "🇷🇺", label: "Русский" },
  "ar-SA": { flag: "🇸🇦", label: "العربية" },
};

function getLangMeta(
  codeOrName: string | undefined,
  fallbackFlag: string,
  fallbackLabel: string
) {
  if (!codeOrName) return { flag: fallbackFlag, label: fallbackLabel };
  if (FLAG_MAP[codeOrName]) return FLAG_MAP[codeOrName];
  const found = Object.entries(FLAG_MAP).find(
    ([k, v]) =>
      k.toLowerCase().startsWith(codeOrName.toLowerCase().slice(0, 2)) ||
      v.label.toLowerCase() === codeOrName.toLowerCase()
  );
  return found ? found[1] : { flag: fallbackFlag, label: codeOrName };
}

export function OutroStep({
  data,
  userId,
  targetLang = "fr-FR",
  spriteGender = "male",
  onFinish,
}: {
  data: any;
  userId: string;
  targetLang?: string;
  spriteGender?: "male" | "female";
  onFinish: (feedback: Feedback) => Promise<void>;
}) {
  const handoff = data.lessonHandoff || {};
  const { urls, isLoading } = useS3Media([
    handoff.outroNativeAudio,
    handoff.outroTargetAudio,
  ]);
  const [nativeUrl, targetUrl] = urls;

  // Resolve Sprite (Vox vs Vivi)
  const isVivi =
    spriteGender === "female" || data?.user?.gender === "female";
  const spriteName = isVivi ? "Vivi" : "Vox";
  const spriteSrc =
    data?.user?.spriteUrl || (isVivi ? "/sprite-f.png" : "/sprite-m.png");

  // Resolve Flags
  const nativeMeta = getLangMeta(
    data?.nativeLanguage || handoff?.nativeLanguage,
    "🇺🇸",
    "Native Debrief"
  );
  const targetMeta = getLangMeta(
    targetLang || data?.targetLanguage || handoff?.targetLanguage,
    "🇫🇷",
    "Target Debrief"
  );

  const [activeAudio, setActiveAudio] = useState<"native" | "target" | null>(
    null
  );
  const [displayedTranscript, setDisplayedTranscript] = useState<
    "native" | "target" | null
  >(null);

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
              (a: any, b: any) => b.masteryScore - a.masteryScore
            );
            const avg = Math.round(
              words.reduce((acc: number, w: any) => acc + w.masteryScore, 0) /
                words.length
            );
            setMatrixStats({
              totalWords: words.length,
              avgMastery: avg,
              topWords: sorted.slice(0, 5),
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
    setDisplayedTranscript(type);

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
      setIsFinishing(false);
    }
  };

  const isSpeaking = activeAudio !== null;

  return (
    <>
      <div className="mx-auto flex h-full max-w-4xl flex-col overflow-y-auto p-6 md:p-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between shrink-0">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-widest text-indigo-600 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Mission Debrief with {spriteName}
            </span>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Mission Accomplished!
            </h2>
          </div>
        </div>

        {/* SPRITE + VECTOR STAGE + SINGLE COMBINED DEBRIEF BUBBLE */}
        <div className="relative mb-6 shrink-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-6 shadow-sm md:p-7">
          {/* Decorative vector background rings */}
          <svg
            className="pointer-events-none absolute -top-12 -left-12 h-64 w-64 opacity-25"
            viewBox="0 0 200 200"
            fill="none"
          >
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="url(#outroGrad1)"
              strokeWidth="18"
              strokeDasharray="30 15"
            />
            <circle
              cx="100"
              cy="100"
              r="60"
              stroke="url(#outroGrad2)"
              strokeWidth="10"
            />
            <defs>
              <linearGradient id="outroGrad1" x1="0" y1="0" x2="200" y2="200">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
              <linearGradient id="outroGrad2" x1="200" y1="0" x2="0" y2="200">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center">
            {/* LEFT: Sprite Avatar Column */}
            <div className="flex shrink-0 flex-col items-center">
              <div className="relative">
                {isSpeaking && (
                  <span className="absolute -inset-2 animate-pulse rounded-3xl bg-gradient-to-tr from-teal-400 via-indigo-500 to-fuchsia-500 opacity-35 blur-md" />
                )}

                <motion.div
                  animate={
                    isSpeaking
                      ? { y: [0, -4, 0], scale: [1, 1.03, 1] }
                      : { y: 0, scale: 1 }
                  }
                  transition={{
                    repeat: isSpeaking ? Infinity : 0,
                    duration: 1.4,
                    ease: "easeInOut",
                  }}
                  className="relative h-28 w-28 overflow-hidden rounded-3xl border-2 border-white bg-gradient-to-b from-indigo-100/80 to-white shadow-lg md:h-32 md:w-32"
                >
                  <img
                    src={spriteSrc}
                    alt={spriteName}
                    className="h-full w-full object-cover object-top"
                  />
                </motion.div>

                <div className="absolute -bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-900 px-3 py-0.5 text-[11px] font-extrabold tracking-wider text-white uppercase shadow">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isSpeaking ? "animate-ping bg-emerald-400" : "bg-teal-400"
                    }`}
                  />
                  {spriteName}
                </div>
              </div>
            </div>

            {/* RIGHT: Combined Speech Bubble */}
            <div
              className={`flex-1 rounded-2xl rounded-tl-sm border p-5 transition-all duration-300 ${
                activeAudio === "native"
                  ? "border-teal-400 bg-white shadow-md ring-2 ring-teal-400/20"
                  : activeAudio === "target"
                    ? "border-indigo-500 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20"
                    : "border-slate-200/90 bg-white/95 shadow-xs"
              }`}
            >
              {/* Top Controls Row: Both Native & Target Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Native Play Button */}
                  <button
                    type="button"
                    disabled={isLoading || !nativeUrl}
                    onClick={() => toggleAudio("native")}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
                      isLoading
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : activeAudio === "native"
                          ? "bg-teal-500 text-white shadow-sm shadow-teal-500/30"
                          : displayedTranscript === "native"
                            ? "bg-slate-900 text-white ring-2 ring-slate-900/15"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-sm leading-none">{nativeMeta.flag}</span>
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : activeAudio === "native" ? (
                      <>
                        <Square className="h-3 w-3 fill-current" />
                        <span>Playing Debrief...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Play Debrief</span>
                      </>
                    )}
                  </button>

                  {/* Target Play Button */}
                  <button
                    type="button"
                    disabled={isLoading || !targetUrl}
                    onClick={() => toggleAudio("target")}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
                      isLoading
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : activeAudio === "target"
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/30"
                          : displayedTranscript === "target"
                            ? "bg-indigo-600 text-white ring-2 ring-indigo-600/20"
                            : "bg-indigo-600 text-white hover:bg-indigo-500"
                    }`}
                  >
                    <span className="text-sm leading-none">{targetMeta.flag}</span>
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : activeAudio === "target" ? (
                      <>
                        <Square className="h-3 w-3 fill-current" />
                        <span>Playing Target...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 fill-current" />
                        <span>Listen in Target</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom Transcript Area */}
              <div className="mt-4 border-t border-slate-100 pt-3.5">
                <AnimatePresence mode="wait">
                  {displayedTranscript === "native" ? (
                    <motion.p
                      key="native-transcript"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="text-base leading-relaxed font-medium text-slate-700"
                    >
                      {handoff.outroNative}
                    </motion.p>
                  ) : displayedTranscript === "target" ? (
                    <motion.p
                      key="target-transcript"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="text-base leading-relaxed font-semibold text-indigo-950"
                    >
                      {handoff.outroTarget}
                    </motion.p>
                  ) : (
                    <motion.div
                      key="idle-waveform"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 py-1 text-xs font-semibold text-slate-400"
                    >
                      <div className="flex items-center gap-1">
                        {[12, 20, 14, 24, 16, 10, 22, 14, 18, 12, 20, 14].map(
                          (h, i) => (
                            <span
                              key={i}
                              style={{ height: `${h}px` }}
                              className="w-1 rounded-full bg-gradient-to-t from-teal-400/60 to-indigo-400/60"
                            />
                          )
                        )}
                      </div>
                      <span>
                        Tap a button above to hear {spriteName}&apos;s wrap-up for Spoon{" "}
                        {handoff.day || 1}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
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
            How was today&apos;s lesson?
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