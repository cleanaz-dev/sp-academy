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

// Maps BCP-47 or language names to flags + labels
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

function getLangMeta(codeOrName: string | undefined, fallbackFlag: string, fallbackLabel: string) {
  if (!codeOrName) return { flag: fallbackFlag, label: fallbackLabel };
  if (FLAG_MAP[codeOrName]) return FLAG_MAP[codeOrName];
  const found = Object.entries(FLAG_MAP).find(([k, v]) =>
    k.toLowerCase().startsWith(codeOrName.toLowerCase().slice(0, 2)) ||
    v.label.toLowerCase() === codeOrName.toLowerCase()
  );
  return found ? found[1] : { flag: fallbackFlag, label: codeOrName };
}

export function IntroStep({
  data,
  onNext,
  spriteGender = "male", // Pass "male" for Vox (/sprite-m.png) or "female" for Vivi (/sprite-f.png)
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
  const spriteSrc = data?.user?.spriteUrl || (isVivi ? "/sprite-f.png" : "/sprite-m.png");

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

  const [activeAudio, setActiveAudio] = useState<"native" | "target" | null>(null);
  // Track which bubbles have been unlocked/revealed by clicking play
  const [revealed, setRevealed] = useState<{ native: boolean; target: boolean }>({
    native: false,
    target: false,
  });

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
    // Reveal the chat bubble as soon as they click play
    setRevealed((prev) => ({ ...prev, [type]: true }));

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

      {/* SPRITE + VECTOR STAGE + CHAT BUBBLES */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-6 shadow-sm md:p-7">
        {/* Subtle decorative vector background shapes (Primary, Secondary, Accent, Tertiary) */}
        <svg
          className="pointer-events-none absolute -top-12 -left-12 h-64 w-64 opacity-25"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="90" stroke="url(#grad1)" strokeWidth="18" strokeDasharray="30 15" />
          <circle cx="100" cy="100" r="60" stroke="url(#grad2)" strokeWidth="10" />
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

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start">
          {/* LEFT: Sprite Avatar Column */}
          <div className="flex shrink-0 flex-col items-center">
            <div className="relative">
              {/* Animated speaking aura */}
              {isSpeaking && (
                <span className="absolute -inset-2 animate-pulse rounded-3xl bg-gradient-to-tr from-teal-400 via-indigo-500 to-fuchsia-500 opacity-35 blur-md" />
              )}

              {/* Avatar Frame */}
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

              {/* Name pill badge */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-900 px-3 py-0.5 text-[11px] font-extrabold tracking-wider text-white uppercase shadow">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isSpeaking ? "animate-ping bg-emerald-400" : "bg-teal-400"
                  }`}
                />
                {spriteName}
              </div>
            </div>
          </div>

          {/* RIGHT: Audio Controls + Speech Bubbles */}
          <div className="flex flex-1 flex-col gap-3.5">
            {/* 1. Native Language Bubble */}
            <div
              onClick={() => !isLoading && nativeUrl && toggleAudio("native")}
              className={`group relative cursor-pointer rounded-2xl rounded-tl-sm border p-4 transition-all duration-300 ${
                activeAudio === "native"
                  ? "border-teal-400 bg-white shadow-md ring-2 ring-teal-400/20"
                  : "border-slate-200/90 bg-white/90 hover:border-slate-300 hover:bg-white hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Flag + Language Pill */}
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  <span className="text-base leading-none">{nativeMeta.flag}</span>
                  <span>{nativeMeta.label}</span>
                </div>

                {/* Custom Vector/Pill Play Trigger */}
                <button
                  type="button"
                  disabled={isLoading || !nativeUrl}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAudio("native");
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all ${
                    isLoading
                      ? "bg-slate-100 text-slate-400"
                      : activeAudio === "native"
                        ? "bg-teal-500 text-white shadow-sm shadow-teal-500/30"
                        : "bg-slate-900 text-white group-hover:bg-indigo-600"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : activeAudio === "native" ? (
                    <>
                      <Square className="h-3 w-3 fill-current" />
                      <span>Playing...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>{revealed.native ? "Replay" : "Play Briefing"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Speech Content: Waveform Teaser OR Revealed Text */}
              <AnimatePresence mode="wait">
                {revealed.native ? (
                  <motion.p
                    key="native-text"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 text-base leading-relaxed font-medium text-slate-700"
                  >
                    {introNative}
                  </motion.p>
                ) : (
                  <motion.div
                    key="native-teaser"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-3 text-xs font-semibold text-slate-400"
                  >
                    {/* Subtle Decorative Soundwave Bars */}
                    <div className="flex items-center gap-1">
                      {[12, 20, 14, 24, 16, 10, 22, 14, 18, 12].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${h}px` }}
                          className="w-1 rounded-full bg-gradient-to-t from-teal-400/50 to-indigo-400/50 transition-transform group-hover:scale-y-110"
                        />
                      ))}
                    </div>
                    <span>Tap to hear {spriteName}&apos;s mission briefing</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Target Language Bubble */}
            <div
              onClick={() => !isLoading && targetUrl && toggleAudio("target")}
              className={`group relative cursor-pointer rounded-2xl rounded-tl-sm border p-4 transition-all duration-300 ${
                activeAudio === "target"
                  ? "border-indigo-500 bg-indigo-50/70 shadow-md ring-2 ring-indigo-500/20"
                  : "border-indigo-100 bg-indigo-50/35 hover:border-indigo-200 hover:bg-indigo-50/60 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Flag + Target Pill */}
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white px-3 py-1 text-xs font-bold text-indigo-950 shadow-2xs">
                  <span className="text-base leading-none">{targetMeta.flag}</span>
                  <span>{targetMeta.label}</span>
                </div>

                {/* Target Play Trigger */}
                <button
                  type="button"
                  disabled={isLoading || !targetUrl}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAudio("target");
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all ${
                    isLoading
                      ? "bg-white text-slate-400"
                      : activeAudio === "target"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/30"
                        : "bg-indigo-600 text-white group-hover:bg-indigo-500"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : activeAudio === "target" ? (
                    <>
                      <Square className="h-3 w-3 fill-current" />
                      <span>Playing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 fill-current" />
                      <span>{revealed.target ? "Replay" : "Listen in Target"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Target Speech Content: Waveform Teaser OR Revealed Text */}
              <AnimatePresence mode="wait">
                {revealed.target ? (
                  <motion.p
                    key="target-text"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 text-base leading-relaxed font-semibold text-indigo-950"
                  >
                    {introTarget}
                  </motion.p>
                ) : (
                  <motion.div
                    key="target-teaser"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-3 text-xs font-semibold text-indigo-400"
                  >
                    <div className="flex items-center gap-1">
                      {[14, 22, 12, 26, 18, 14, 20, 12, 22, 10].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${h}px` }}
                          className="w-1 rounded-full bg-gradient-to-t from-indigo-400/60 to-fuchsia-400/60 transition-transform group-hover:scale-y-110"
                        />
                      ))}
                    </div>
                    <span>Tap to hear {spriteName} speak in {targetMeta.label}</span>
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