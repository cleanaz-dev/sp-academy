"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  Loader2,
  Mic,
  Quote,
  Swords,
  Zap,
} from "lucide-react";
import type { LearningPath } from "@/app/actions/get-learning-path";
import { vocabWordCount } from "./utils";

type Lesson = LearningPath["lessons"][number];

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
  waitingOnSpoon?: boolean;
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
  waitingOnSpoon = false,
  waitingOnVocab,
  waitingOnBoss = false,
  getLessonHref,
  getBossHref,
}: PrimaryHeroCardProps) {
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

  // 1. WAITING ON SPOON, VOCAB, OR BOSS GENERATION (Check FIRST so unbaked lessons never show empty UI)
  if (waitingOnSpoon || waitingOnVocab || waitingOnBoss) {
    const spoonNum =
      nextLesson?.orderIndex ??
      vocabDue?.orderIndex ??
      bossDue?.orderIndex ??
      1;

    return (
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3.5 py-1 text-xs font-extrabold tracking-wide text-indigo-200 uppercase">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-300" />
            {waitingOnSpoon
              ? `Crafting Spoon ${spoonNum}`
              : waitingOnBoss
                ? "Building Boss Arena"
                : `Building Vocab Bridge ${spoonNum}`}
          </div>

          <h3 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {waitingOnSpoon
              ? `Personalizing Spoon ${spoonNum} for you...`
              : waitingOnBoss
                ? "Designing Your Boss Stage Scenario..."
                : "Synthesizing Your Vocab Bridge..."}
          </h3>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
            {waitingOnSpoon
              ? "Our language engine is generating your custom audio, speaking drills, and visual scene. This takes about 20–30 seconds."
              : "Preparing your interactive checkpoint. Ready in just a moment..."}
          </p>

          <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
            <div className="h-2 w-48 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-indigo-400" />
            </div>
            <span className="text-xs font-bold text-indigo-300">
              Auto-updating when ready...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. BOSS STAGE READY
  if (bossDue?.bossStage) {
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
        {coverUrl && (
          <img
            src={coverUrl}
            alt={bossName}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-105"
          />
        )}

        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-r transition-all duration-700 ${theme.scrim}`}
        />
        <div
          className="pointer-events-none absolute inset-0 transition-all duration-700"
          style={{ background: theme.glow }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

        <div className="relative z-10 p-7 sm:p-8">
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

// 3. VOCAB BRIDGE READY — Full-bleed Scene Image + Warm Amber/Daylight Overlay
  if (vocabDue?.bridge) {
    const isMilestoneLesson = vocabDue.orderIndex % 3 === 0;
    const unlockTargetText = isMilestoneLesson
      ? `Milestone ${vocabDue.orderIndex / 3} Boss Stage`
      : `Spoon ${vocabDue.orderIndex + 1}`;

    const words =
      (vocabDue.bridge.vocabMoment as Array<{
        word: string;
        gloss?: string;
      }>) ?? [];

    return (
      <div className="group relative overflow-hidden rounded-3xl border border-amber-300/80 bg-amber-50 text-slate-900 shadow-xl shadow-amber-950/5">
        {/* Full-bleed Lesson Scene Image in the background (matches Spoon & Boss cards) */}
        {vocabDue.imageUrl && (
          <img
            src={vocabDue.imageUrl}
            alt={vocabDue.imageAlt ?? ""}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35 transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Warm Daylight / Amber-Orange Scrim Overlay (Opposite of the dark Spoon/Boss overlay) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-amber-50/92 to-orange-100/70" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-amber-100/60 via-transparent to-white/50" />

        <div className="relative z-10 flex flex-col justify-between p-7 sm:p-8">
          <div>
            {/* Top Status Pills (Matches Spoon & Boss Card Header) */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-500/15 px-3.5 py-1 text-xs font-extrabold tracking-wide text-amber-900 uppercase backdrop-blur-md">
                <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
                Vocab Bridge {vocabDue.orderIndex} Ready
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-white/85 px-3 py-1 text-xs font-bold text-amber-900 shadow-2xs backdrop-blur-md">
                🔓 Unlocks {unlockTargetText}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Vocab Bridge {vocabDue.orderIndex}: {vocabDue.title}
            </h3>
            <p className="mt-1.5 max-w-xl text-sm font-medium leading-relaxed text-slate-600">
              Solidify the {vocabWordCount(vocabDue.bridge.vocabMoment)} key
              scene words from Spoon {vocabDue.orderIndex} to unlock{" "}
              <span className="font-extrabold text-amber-900">
                {unlockTargetText}
              </span>
              .
            </p>

            {/* Word Pills */}
            {words.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {words.map((w, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300/80 bg-white/95 px-3.5 py-1.5 text-xs font-extrabold text-slate-900 shadow-2xs backdrop-blur-md"
                  >
                    <span className="text-amber-700">{w.word}</span>
                    {w.gloss && (
                      <span className="font-semibold text-slate-400">
                        • {w.gloss}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Action Bar (Matches Spoon & Boss Card Footer) */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-amber-300/50 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900/80">
              <Zap className="h-4 w-4 text-amber-600" />
              <span>Interactive Scene Checkpoint • ~3 mins</span>
            </div>

            <Link
              href={`/foundation/vocab/${vocabDue.bridge.id}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-600 active:scale-95"
            >
              Start Vocab Bridge {vocabDue.orderIndex}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. NEXT SPOON READY
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
              Master essential speech patterns, native pronunciation, and
              interactive listening drills in this bite-sized audio lesson.
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

  return (
    <div className="rounded-3xl bg-white/80 p-7 backdrop-blur-md">
      <h3 className="text-2xl font-black text-slate-900">All caught up! 🎉</h3>
      <p className="mt-1 text-sm text-slate-500">
        You&apos;ve completed every available spoon on this track.
      </p>
    </div>
  );
}