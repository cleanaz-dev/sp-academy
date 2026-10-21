// components/learning-hub/generation-cycle-card.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import type { UserGenerationData } from "@/lib/upstash";

const LOCALE_NAMES: Record<string, string> = {
  "en-US": "English",
  "fr-FR": "French",
  "es-ES": "Spanish",
  "de-DE": "German",
  "it-IT": "Italian",
  "pt-BR": "Portuguese",
  "ja-JP": "Japanese",
  "ko-KR": "Korean",
  "zh-CN": "Chinese",
  "ru-RU": "Russian",
  "ar-SA": "Arabic",
};

const STAGES = [
  {
    id: "analyzing",
    label: "Analyzing",
    startSec: 0,
    endSec: 18,
    getTitle: (name: string, lang: string) =>
      `Analyzing ${name}'s ${lang} profile...`,
    getSub: (level: string, goal: string) =>
      `Calibrating ${level} baseline around ${goal} and phonetic targets.`,
  },
  {
    id: "designing",
    label: "Designing",
    startSec: 18,
    endSec: 38,
    getTitle: (_: string, lang: string) =>
      `Designing your autonomous ${lang} curriculum...`,
    getSub: () =>
      `Mapping progression curves, speaking drills, and scenario checkpoints.`,
  },
  {
    id: "spoons",
    label: "SPOONS",
    startSec: 38,
    endSec: 65,
    getTitle: () => `Forging your first 3 SPOONS...`,
    getSub: () =>
      `Generating bite-sized core audio lessons, scene visuals, and dialogue.`,
  },
  {
    id: "vocabs",
    label: "VOCABS",
    startSec: 65,
    endSec: 90,
    getTitle: () => `Synthesizing mini VOCABS & voices...`,
    getSub: () =>
      `Extracting key scene words and generating native neural voice actors.`,
  },
  {
    id: "bosses",
    label: "BOSS'S",
    startSec: 90,
    endSec: 108,
    getTitle: () => `Awakening your Stage BOSS'S...`,
    getSub: () =>
      `Configuring Boss avatar moods, 3-heart survival rules, and timed gauntlets.`,
  },
  {
    id: "ready",
    label: "Almost Ready",
    startSec: 108,
    endSec: 9999,
    getTitle: (_: string, lang: string) =>
      `Almost Ready! Finalizing your ${lang} hub...`,
    getSub: () =>
      `Putting the final touches on Spoon 1. Opening your hub automatically...`,
  },
];

export function GenerationCycleCard({ data }: { data: UserGenerationData }) {
  const [elapsed, setElapsed] = useState(0);

  const firstName = data.firstName || "Learner";
  const targetLang =
    (data.targetLanguage && LOCALE_NAMES[data.targetLanguage]) ||
    data.targetLanguage ||
    "Language";
  const nativeLang =
    (data.nativeLanguage && LOCALE_NAMES[data.nativeLanguage]) ||
    data.nativeLanguage ||
    "";
  const level = data.level || "custom";
  const goal = data.goal || "fluency";

  // Sync with Redis createdAt so browser refreshes don't reset the 115s timer
  useEffect(() => {
    const startTime = data.createdAt || Date.now();

    const tick = () => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(Math.max(0, diff));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [data.createdAt]);

  const foundIndex = STAGES.findIndex(
    (s) => elapsed >= s.startSec && elapsed < s.endSec
  );
  const activeIndex = foundIndex === -1 ? STAGES.length - 1 : foundIndex;
  const activeStage = STAGES[activeIndex];

  const progress = Math.min(97, Math.max(4, Math.round((elapsed / 115) * 100)));

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-950 px-6 text-white">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[400px] w-[500px] rounded-full bg-fuchsia-500/15 blur-[120px]" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Top Brand + User Context Pills */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3.5 py-1.5 text-xs font-extrabold tracking-wide text-indigo-200 uppercase">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              SPOON ACADEMY FORGE
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300">
            {nativeLang && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {nativeLang} → {targetLang}
              </span>
            )}
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 capitalize">
              {level}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 capitalize">
              {goal}
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          {/* Step Counter + Percentage */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest text-indigo-400 uppercase">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Step {activeIndex + 1} of {STAGES.length} • {activeStage.label}
            </span>

            <span className="font-mono text-sm font-black text-indigo-300">
              {progress}%
            </span>
          </div>

          {/* Animated Stage Headline & Subtext */}
          <div className="my-7 min-h-[96px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {activeStage.getTitle(firstName, targetLang)}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                  {activeStage.getSub(level, goal)}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* The 6 Stage Pills: Analyzing -> Designing -> SPOONS -> VOCABS -> BOSS'S -> Almost Ready */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {STAGES.map((stage, idx) => {
              const isDone = idx < activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-xs font-extrabold tracking-wide transition-all duration-300 ${
                    isDone
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : isCurrent
                        ? "border-indigo-400/60 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/10"
                        : "border-white/5 bg-white/[0.02] text-slate-500"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                      isDone
                        ? "bg-emerald-500 text-slate-950"
                        : isCurrent
                          ? "bg-indigo-400 text-slate-950"
                          : "bg-white/10 text-slate-500"
                    }`}
                  >
                    {isDone ? <Check className="h-3 w-3 stroke-[3]" /> : idx + 1}
                  </span>
                  <span className="truncate">{stage.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Reassurance */}
        <p className="mt-6 text-center text-xs font-medium text-slate-400">
          Building your custom neural curriculum takes ~2 minutes. Your hub will open automatically.
        </p>
      </div>
    </div>
  );
}