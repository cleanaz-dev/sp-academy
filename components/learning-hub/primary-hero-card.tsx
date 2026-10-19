"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  Loader2,
  Mic,
  Quote,
  Sparkles,
  Swords,
  Zap,
} from "lucide-react";
import type { LearningPath } from "@/app/actions/get-learning-path";
import { vocabWordCount } from "./utils";

type Lesson = LearningPath["lessons"][number];

// Curated high-contrast Boss Arena palettes so every render feels fresh & intentional
const BOSS_THEMES = [
  {
    name: "neon-fuchsia",
    scrim: "from-slate-950 via-slate-950/85 to-fuchsia-950/55",
    glow: "radial-gradient(circle at 85% 20%, rgba(217, 70, 239, 0.28), transparent 60%)",
    badge: "border-fuchsia-400/35 bg-fuchsia-500/20 text-fuchsia-200",
    icon: "text-fuchsia-300",
    accentText: "text-fuchsia-300",
    avatarBorder: "border-fuchsia-400/75 shadow-fuchsia-500/30",
    button:
      "from-fuchsia-500 to-indigo-600 shadow-fuchsia-500/30 hover:from-fuchsia-400 hover:to-indigo-500",
  },
  {
    name: "cyber-emerald",
    scrim: "from-slate-950 via-slate-950/85 to-teal-950/60",
    glow: "radial-gradient(circle at 85% 20%, rgba(16, 185, 129, 0.28), transparent 60%)",
    badge: "border-emerald-400/35 bg-emerald-500/20 text-emerald-200",
    icon: "text-emerald-300",
    accentText: "text-emerald-300",
    avatarBorder: "border-emerald-400/75 shadow-emerald-500/30",
    button:
      "from-emerald-500 to-teal-600 shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500",
  },
  {
    name: "crimson-velvet",
    scrim: "from-slate-950 via-slate-950/85 to-rose-950/60",
    glow: "radial-gradient(circle at 85% 20%, rgba(244, 63, 94, 0.28), transparent 60%)",
    badge: "border-rose-400/35 bg-rose-500/20 text-rose-200",
    icon: "text-rose-300",
    accentText: "text-rose-300",
    avatarBorder: "border-rose-400/75 shadow-rose-500/30",
    button:
      "from-rose-500 to-orange-600 shadow-rose-500/30 hover:from-rose-400 hover:to-orange-500",
  },
  {
    name: "imperial-gold",
    scrim: "from-slate-950 via-slate-950/85 to-amber-950/55",
    glow: "radial-gradient(circle at 85% 20%, rgba(245, 158, 11, 0.26), transparent 60%)",
    badge: "border-amber-400/35 bg-amber-500/20 text-amber-200",
    icon: "text-amber-300",
    accentText: "text-amber-300",
    avatarBorder: "border-amber-400/75 shadow-amber-500/30",
    button:
      "from-amber-500 to-rose-600 shadow-amber-500/30 hover:from-amber-400 hover:to-rose-500",
  },
  {
    name: "electric-cyan",
    scrim: "from-slate-950 via-slate-950/85 to-cyan-950/60",
    glow: "radial-gradient(circle at 85% 20%, rgba(6, 182, 212, 0.28), transparent 60%)",
    badge: "border-cyan-400/35 bg-cyan-500/20 text-cyan-200",
    icon: "text-cyan-300",
    accentText: "text-cyan-300",
    avatarBorder: "border-cyan-400/75 shadow-cyan-500/30",
    button:
      "from-cyan-500 to-blue-600 shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500",
  },
  {
    name: "royal-violet",
    scrim: "from-slate-950 via-slate-950/85 to-violet-950/60",
    glow: "radial-gradient(circle at 85% 20%, rgba(139, 92, 246, 0.30), transparent 60%)",
    badge: "border-violet-400/35 bg-violet-500/20 text-violet-200",
    icon: "text-violet-300",
    accentText: "text-violet-300",
    avatarBorder: "border-violet-400/75 shadow-violet-500/30",
    button:
      "from-violet-500 to-fuchsia-600 shadow-violet-500/30 hover:from-violet-400 hover:to-fuchsia-500",
  },
] as const;

type PrimaryHeroCardProps = {
  path: LearningPath | null;
  vocabDue?: Lesson;
  nextLesson?: Lesson;
  bossDue?: Lesson;
  waitingOnVocab: boolean;
  waitingOnBoss?: boolean;
  getLessonHref: (id: string) => string;
  getBossHref?: (bossId: string, lessonId: string) => string;
};

export function PrimaryHeroCard({
  path,
  vocabDue,
  nextLesson,
  bossDue,
  waitingOnVocab,
  waitingOnBoss = false,
  getLessonHref,
  getBossHref,
}: PrimaryHeroCardProps) {
  // Pick a random Boss palette on client mount (avoids Next.js SSR hydration mismatch)
  const [themeIndex, setThemeIndex] = useState(0);

  useEffect(() => {
    setThemeIndex(Math.floor(Math.random() * BOSS_THEMES.length));
  }, []);

  const theme = BOSS_THEMES[themeIndex];

  if (!path) {
    return (
      <div className="rounded-3xl bg-white/80 p-8 backdrop-blur-md">
        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          Getting Started
        </span>
        <h3 className="mt-2 text-2xl font-black text-slate-900">
          Welcome to your curriculum
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Hold tight while your initial learning path is being prepared.
        </p>
      </div>
    );
  }

  // 1. BOSS STAGE READY — Full-bleed Cover + Dynamic Theme + Boss Avatar + Quote
  if (bossDue?.bossStage && !waitingOnBoss) {
    const bossStage = bossDue.bossStage;
    const milestoneNum =
      bossStage.milestoneIndex ?? Math.ceil(bossDue.orderIndex / 3);
    const startSpoon = Math.max(1, bossDue.orderIndex - 2);
    const scenario = bossStage.scenarioData;
    const boss = scenario?.boss;

    const coverUrl =
      bossStage.coverUrl || boss?.coverUrl || bossDue.imageUrl || null;
    const avatarUrl = bossStage.avatarUrl || boss?.avatar?.default || null;

    const bossName =
      boss?.name ||
      scenario?.title ||
      `Milestone ${milestoneNum}: AI Conversation Checkpoint`;

    const bossPersona =
      boss?.persona ||
      scenario?.description ||
      `Put Spoons ${startSpoon}–${bossDue.orderIndex} to the test to unlock the next unit.`;

    const bossHref = getBossHref
      ? getBossHref(bossStage.id, bossDue.id)
      : `/foundation/boss/${bossStage.id}`;

    return (
      <div className="group relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl shadow-indigo-950/15 transition-colors duration-700">
        {/* Presigned Boss Cover Background */}
        {coverUrl && (
          <img
            src={coverUrl}
            alt={bossName}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Dynamic Randomized Gradient Scrims */}
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-r transition-all duration-700 ${theme.scrim}`}
        />
        <div
          className="pointer-events-none absolute inset-0 transition-all duration-700"
          style={{ background: theme.glow }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

        <div className="relative z-10 p-7 sm:p-8">
          {/* Top Status Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-extrabold tracking-wide uppercase backdrop-blur-md transition-colors duration-500 ${theme.badge}`}
            >
              <Swords className={`h-3.5 w-3.5 ${theme.icon}`} />
              Milestone {milestoneNum} Boss Stage
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/75 px-3 py-1 text-xs font-bold text-slate-200 backdrop-blur-md">
              <span>🎯 Covers Spoons {startSpoon}–{bossDue.orderIndex}</span>
              {scenario?.rules?.passingScore && (
                <>
                  <span className="text-white/30">•</span>
                  <span className={theme.accentText}>
                    Pass: {scenario.rules.passingScore}/
                    {scenario.rules.totalExercises}
                  </span>
                </>
              )}
            </span>
          </div>

          {/* Boss Avatar + Name + Persona */}
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            {avatarUrl && (
              <div className="relative shrink-0">
                <div
                  className={`h-24 w-24 overflow-hidden rounded-2xl border-2 bg-slate-900 shadow-lg transition-all duration-500 sm:h-28 sm:w-28 ${theme.avatarBorder}`}
                >
                  <img
                    src={avatarUrl}
                    alt={bossName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="absolute -right-1.5 -bottom-1.5 rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-black tracking-wider text-slate-950 uppercase shadow">
                  Boss
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <span
                className={`text-xs font-extrabold tracking-wider uppercase ${theme.accentText}`}
              >
                Milestone Challenger
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                {bossName}
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-300 line-clamp-2">
                {bossPersona}
              </p>
            </div>
          </div>

          {/* Boss Intro Speech Bubble */}
          {boss?.introMessage && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <Quote
                  className={`mt-0.5 h-4 w-4 shrink-0 rotate-180 ${theme.icon}`}
                />
                <p className="text-xs leading-relaxed font-medium text-slate-100 italic sm:text-sm">
                  &ldquo;{boss.introMessage}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Mic className={`h-4 w-4 ${theme.icon}`} />
              <span>Live AI Checkpoint • 15 Exercises</span>
            </div>

            <Link
              href={bossHref}
              className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r px-7 py-3.5 text-sm font-extrabold text-white shadow-lg transition-all active:scale-95 ${theme.button}`}
            >
              Challenge {bossName.split(",")[0]}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. VOCAB BRIDGE READY
  if (vocabDue?.bridge) {
    const isMilestoneLesson = vocabDue.orderIndex % 3 === 0;
    const unlockTargetText = isMilestoneLesson
      ? `Milestone ${vocabDue.orderIndex / 3} Boss Stage`
      : `Spoon ${vocabDue.orderIndex + 1}`;

    const words =
      (vocabDue.bridge.vocabMoment as Array<{ word: string; gloss?: string }>) ??
      [];

    return (
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white p-7 shadow-sm">
        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-extrabold text-amber-800 uppercase">
              <Zap className="h-3.5 w-3.5 text-amber-600" /> Vocab Bridge{" "}
              {vocabDue.orderIndex}
            </div>
            <h3 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Review Vocabulary for Spoon {vocabDue.orderIndex}
            </h3>
            <p className="text-sm text-slate-600">
              Solidify the {vocabWordCount(vocabDue.bridge.vocabMoment)} new
              words you encountered to unlock{" "}
              <span className="font-bold text-slate-800">
                {unlockTargetText}
              </span>
              .
            </p>

            {words.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {words.map((w, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200/80 bg-white/90 px-3 py-1 text-xs font-bold text-slate-800"
                  >
                    <span className="text-amber-600">{w.word}</span>
                    {w.gloss && (
                      <span className="font-normal text-slate-400">
                        • {w.gloss}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Link
            href={`/foundation/vocab/${vocabDue.bridge.id}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600 active:scale-95"
          >
            <Zap className="h-4 w-4" /> Start Vocab Bridge{" "}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. NEXT SPOON READY
  if (nextLesson) {
    return (
      <div className="group relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-lg">
        {nextLesson.imageUrl && (
          <img
            src={nextLesson.imageUrl}
            alt={nextLesson.imageAlt ?? ""}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35 transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-indigo-950/40" />

        <div className="relative z-10 flex flex-col justify-between p-7 sm:p-8">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/25 px-3 py-1 text-xs font-extrabold text-indigo-200 uppercase backdrop-blur-md">
                <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                Spoon {nextLesson.orderIndex} Ready
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200 backdrop-blur-md">
                ⏱️ 5–7 min session
              </span>
            </div>

            <h3 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Spoon {nextLesson.orderIndex}: {nextLesson.title}
            </h3>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-300">
              {nextLesson.imageAlt ||
                "Target speaking exercises, sentence construction, and listening drills tailored to your level."}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Headphones className="h-4 w-4 text-indigo-400" />
              <span>Interactive Audio Lesson</span>
            </div>
            <Link
              href={getLessonHref(nextLesson.id)}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-400 active:scale-95"
            >
              Start Spoon {nextLesson.orderIndex}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. WAITING ON VOCAB OR BOSS GENERATION
  if (waitingOnVocab || waitingOnBoss) {
    return (
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-white p-7">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-extrabold text-indigo-700 uppercase">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Preparing Next Step
        </div>
        <h3 className="mt-3 text-2xl font-black text-slate-900">
          {waitingOnBoss
            ? "Designing Your Boss Stage Scenario..."
            : "Synthesizing Your Vocab Bridge..."}
        </h3>
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Ready in just a moment...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white/80 p-7 backdrop-blur-md">
      <h3 className="text-2xl font-black text-slate-900">All caught up! 🎉</h3>
      <p className="mt-1 text-sm text-slate-500">
        You&apos;ve completed every available spoon on this track.
      </p>
    </div>
  );
}