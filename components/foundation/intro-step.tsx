"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Square,
  ArrowRight,
  Loader2,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useS3Media } from "@/context/s3-context";
import { FLAG_MAP } from "@/lib/types";



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

export function IntroStep({
  data,
  onNext,
  spriteGender = "male",
}: {
  data: any;
  onNext: () => void;
  spriteGender?: "male" | "female";
}) {
  const handoff = data.lessonHandoff || {};

  // Data extraction
  const chunks = handoff.chunks || [];
  const targetSentence = handoff.targetSentence || "";
  const freestyleTopic = handoff.freestyleTopic || "";
  const introNative = handoff.introNative || "";
  const introTarget = handoff.introTarget || "";
  const introNativeAudio = handoff.introNativeAudio || "";
  const introTargetAudio = handoff.introTargetAudio || "";

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
    "Native Briefing"
  );
  const targetMeta = getLangMeta(
    data?.targetLanguage || handoff?.targetLanguage,
    "🇫🇷",
    "Target Intro"
  );

  // Fetch & cache audio from S3
  const { urls, isLoading } = useS3Media([introNativeAudio, introTargetAudio]);
  const [nativeUrl, targetUrl] = urls;

  const [activeAudio, setActiveAudio] = useState<"native" | "target" | null>(
    null
  );
  // Tracks which transcript is currently shown underneath ("native" | "target" | null)
  const [displayedTranscript, setDisplayedTranscript] = useState<
    "native" | "target" | null
  >(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

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

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(resolvedUrl);
    audioRef.current = audio;
    audio.onended = () => setActiveAudio(null);

    audio.play().catch((err) => {
      console.warn("Audio playback skipped:", err);
      setActiveAudio(null);
    });

    setActiveAudio(type);
  };

  const handleStart = () => {
    if (audioRef.current) audioRef.current.pause();
    onNext();
  };

  const isSpeaking = activeAudio !== null;

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-6 md:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-widest text-indigo-600 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Mission Briefing with {spriteName}
          </span>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            Lesson Overview
          </h1>
        </div>
      </div>

      {/* SPRITE + VECTOR STAGE + SINGLE COMBINED CHAT BUBBLE */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-6 shadow-sm md:p-7">
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
            stroke="url(#grad1)"
            strokeWidth="18"
            strokeDasharray="30 15"
          />
          <circle
            cx="100"
            cy="100"
            r="60"
            stroke="url(#grad2)"
            strokeWidth="10"
          />
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="200" y2="200">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
            <linearGradient id="grad2" x1="200" y1="0" x2="0" y2="200">
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
                      <span>Playing Briefing...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Play Briefing</span>
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

            {/* Bottom Transcript Area (1-2 sentences max) */}
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
                    {introNative}
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
                    {introTarget}
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
                      Tap a button above to hear {spriteName}&apos;s briefing or target intro
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TARGET SENTENCE */}
      <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center md:p-8">
        <h3 className="mb-3 text-xs font-bold tracking-widest text-gray-400 uppercase">
          Main Target Sentence
        </h3>
        <p className="text-2xl leading-snug font-semibold text-gray-900 md:text-3xl">
          &ldquo;{targetSentence}&rdquo;
        </p>
      </div>

      {/* VOCABULARY & CHUNKS */}
      {chunks.length > 0 && (
        <div className="mb-auto">
          <h3 className="mb-3 text-xs font-bold tracking-widest text-gray-400 uppercase">
            Vocabulary & Chunks to Master
          </h3>
          <div className="flex flex-wrap gap-2">
            {chunks.map((chunk: string, idx: number) => (
              <span
                key={idx}
                className="rounded-xl border border-gray-200/80 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-700"
              >
                {chunk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-10 flex flex-col items-center justify-between gap-6 border-t border-gray-100 pt-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <h3 className="mb-1 text-xs font-bold tracking-widest text-indigo-600 uppercase">
            Final Mission
          </h3>
          <p className="font-semibold text-gray-900">Roleplay: {freestyleTopic}</p>
        </div>

        <button
          onClick={handleStart}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-lg font-bold text-white shadow-md transition-transform hover:bg-black active:scale-95 sm:w-auto"
        >
          Begin Step 1 <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}