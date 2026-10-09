"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flame,
  Globe2,
  Headphones,
  Loader2,
  Lock,
  MessageSquare,
  Sparkles,
  Trophy,
  Zap,
  Grid3X3,
  ExternalLink,
} from "lucide-react";
import type { LearningPath } from "@/app/actions/get-learning-path";
import { formatDate } from "./utils";

type Lesson = LearningPath["lessons"][number];

type Props = {
  path: LearningPath | null;
  lang: { nativeLanguage: string; targetLanguage: string | null | any };
};

function vocabWordCount(vocabMoment: unknown): number {
  return Array.isArray(vocabMoment) ? vocabMoment.length : 0;
}

export default function FoundationHubPage({ path, lang }: Props) {
  const router = useRouter();
  const lessons = path?.lessons ?? [];
  const courseId = path?.courseId ?? (path as any)?.id ?? "default";

  const getLessonHref = (lessonId: string) => `/foundation/${lessonId}/${courseId}`;

  // Poll when background vocab builder is running
  const waitingOnVocab = lessons.some((l) => l.completedAt && !l.bridge);
  useEffect(() => {
    if (!waitingOnVocab) return;
    const interval = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(interval);
  }, [waitingOnVocab, router]);

  // Identify next active milestones
  const vocabDue = lessons.find((l) => l.completedAt && l.bridge && !l.bridge.passed);
  const nextLesson = lessons.find((l) => !l.completedAt);
  const completedLessonsCount = lessons.filter((l) => !!l.completedAt).length;

  // Calculate quick vocabulary stats for the Word Matrix widget
  const totalWordsLearned = lessons.reduce((acc, l) => {
    return acc + (l.completedAt && l.bridge ? vocabWordCount(l.bridge.vocabMoment) : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-[#F4F6FC] font-sans text-slate-900 selection:bg-indigo-100">
      
      {/* 1. COMPACT APP-STYLE HEADER (Doesn't waste 350px of vertical space) */}
      <header className="border-b border-slate-200/80 bg-white px-6 py-5 shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Learning Hub
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                <Globe2 className="h-3.5 w-3.5 text-violet-600" />
                <span className="uppercase">{lang?.targetLanguage ?? "French"}</span>
                <span className="text-slate-400 font-normal">from {lang?.nativeLanguage ?? "English"}</span>
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Structured conversational foundation • Mastered speech reflexes
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-1.5 text-xs font-extrabold text-amber-800">
              <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span>Streak: 1</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-1.5 text-xs font-extrabold text-emerald-800">
              <Trophy className="h-4 w-4 text-emerald-600" />
              <span>{completedLessonsCount} Spoons Done</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN APP CANVAS: 2-COLUMN DESKTOP COCKPIT */}
      <main className="mx-auto max-w-7xl p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* ================= LEFT / MAIN COLUMN (8 cols): Primary Action + Path ================= */}
          <div className="flex flex-col gap-8 lg:col-span-8">
            
            {/* HERO UP-NEXT CARD */}
            <PrimaryHeroCard
              path={path}
              vocabDue={vocabDue}
              nextLesson={nextLesson}
              waitingOnVocab={waitingOnVocab}
              getLessonHref={getLessonHref}
            />

            {/* BOUNDED LEARNING PATH (Does NOT scroll infinitely!) */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-900">
                    Your Learning Path
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    Step-by-step foundation progression
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {lessons.length} Spoons Scheduled
                </span>
              </div>

              {/* Bounded Scroll Container: Never breaks viewport, scrollable inside */}
              {lessons.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                  No spoons scheduled yet.
                </div>
              ) : (
                <div className="max-h-[380px] space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                  {lessons.map((lesson, idx) => (
                    <TimelineLessonCard
                      key={lesson.id}
                      lesson={lesson}
                      isNext={nextLesson?.id === lesson.id}
                      index={idx}
                      getLessonHref={getLessonHref}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ================= RIGHT PANEL (4 cols): Word Matrix + AI Companion ================= */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            
            {/* 🟩 WORD MATRIX WIDGET (Fitted right here above the fold!) */}
            <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-white p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100/80 px-2.5 py-1 text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider">
                  <Grid3X3 className="h-3.5 w-3.5 text-indigo-600" /> Word Matrix
                </span>
                <span className="text-xs font-extrabold text-indigo-600">
                  {totalWordsLearned} Words Banked
                </span>
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-900">
                Vocabulary Retention
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Words automatically cycle into your retention matrix as you finish lessons and vocab bridges.
              </p>

              {/* Matrix Preview Pills / Visual Grid */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-2xs">
                  <span className="block text-xl font-black text-slate-900">{totalWordsLearned}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acquired</span>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-2xs">
                  <span className="block text-xl font-black text-emerald-600">100%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mastery</span>
                </div>
              </div>

              <Link
                href="/matrix"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-extrabold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-98"
              >
                Open Word Matrix <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* 🟣 AI COMPANION PRACTICE CARD */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-violet-300 hover:shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-extrabold text-purple-700 uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" /> Practice
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                </div>

                <h3 className="mt-3 text-lg font-black text-slate-900">
                  Spoken AI Tutor
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Put whatever words you've learned into conversational practice with live speech feedback.
                </p>
              </div>

              <Link
                href="/learning-hub/conversation"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-800 transition hover:bg-slate-900 hover:text-white"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Start Conversation
              </Link>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// PRIMARY HERO CALLOUT CARD
// -------------------------------------------------------------
function PrimaryHeroCard({
  path,
  vocabDue,
  nextLesson,
  waitingOnVocab,
  getLessonHref,
}: {
  path: LearningPath | null;
  vocabDue?: Lesson;
  nextLesson?: Lesson;
  waitingOnVocab: boolean;
  getLessonHref: (id: string) => string;
}) {
  const cardStyle =
    "relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs flex flex-col justify-between min-h-[220px]";

  if (!path) {
    return (
      <div className={cardStyle}>
        <div>
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Getting Started
          </span>
          <h3 className="mt-2 text-2xl font-black text-slate-900">Welcome to your curriculum</h3>
          <p className="mt-1 text-sm text-slate-500">
            Hold tight while your initial learning path is being prepared.
          </p>
        </div>
      </div>
    );
  }

  // Vocab Bridge gate needs passing
  if (vocabDue?.bridge) {
    return (
      <div className={`${cardStyle} border-amber-200 bg-gradient-to-br from-amber-50/50 via-white to-white`}>
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800 uppercase">
            <Lock className="h-3.5 w-3.5" /> Next Spoon Locked
          </div>
          <h3 className="mt-3 text-2xl font-black text-slate-900">
            Review Vocabulary for Spoon {vocabDue.orderIndex}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Solidify the {vocabWordCount(vocabDue.bridge.vocabMoment)} new words you encountered to unlock Spoon {vocabDue.orderIndex + 1}.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs font-semibold text-slate-400">⏱️ ~3 mins</span>
          <Link
            href={`/foundation/vocab/${vocabDue.bridge.id}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600 active:scale-95"
          >
            <Zap className="h-4 w-4" /> Start Vocab Bridge <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Waiting on AI Vocab generation
  if (waitingOnVocab) {
    return (
      <div className={cardStyle}>
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700 uppercase">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-blue-600" /> Lesson Complete
          </div>
          <h3 className="mt-3 text-2xl font-black text-slate-900">
            Synthesizing Your Vocab Bridge...
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Our language engine is extracting the key vocabulary moments from your completed session.
          </p>
        </div>
        <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> Ready in just a moment
        </div>
      </div>
    );
  }

  // Next lesson ready to play
  if (nextLesson) {
    return (
      <div className={`${cardStyle} border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-white`}>
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Spoon {nextLesson.orderIndex} Ready
            </span>
            <span className="text-xs font-bold text-slate-400">⏱️ 5-7 min session</span>
          </div>

          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Spoon {nextLesson.orderIndex}: Foundation Lesson
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Target speaking exercises, sentence construction, and listening drills tailored to your level.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Headphones className="h-4 w-4 text-slate-500" />
            <span>Interactive Audio Lesson</span>
          </div>

          <Link
            href={getLessonHref(nextLesson.id)}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
          >
            Start Spoon {nextLesson.orderIndex} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cardStyle}>
      <h3 className="text-2xl font-black text-slate-900">All caught up! 🎉</h3>
      <p className="mt-1 text-sm text-slate-500">
        You've completed every available spoon on this track. Practice in free conversation while new content is baked.
      </p>
    </div>
  );
}

// -------------------------------------------------------------
// COMPACT TIMELINE ROW ITEM (Takes less vertical height)
// -------------------------------------------------------------
function TimelineLessonCard({
  lesson,
  isNext,
  index,
  getLessonHref,
}: {
  lesson: Lesson;
  isNext: boolean;
  index: number;
  getLessonHref: (id: string) => string;
}) {
  const { bridge } = lesson;
  const isDone = Boolean(lesson.completedAt);
  const wordsCount = vocabWordCount(bridge?.vocabMoment);

  return (
    <div
      className={`group relative flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
        isNext
          ? "border-blue-300 bg-white shadow-sm ring-1 ring-blue-500/20"
          : isDone
          ? "border-slate-200/70 bg-white/70"
          : "border-slate-200/50 bg-slate-50/50"
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black transition-all ${
            isDone
              ? "bg-emerald-100 text-emerald-600"
              : isNext
              ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
              : "bg-slate-200/80 text-slate-400"
          }`}
        >
          {isDone ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : isNext ? (
            <BookOpen className="h-4 w-4" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold text-slate-900">Spoon {lesson.orderIndex}</h4>
            {isDone && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Done
              </span>
            )}
            {isNext && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                Up Next
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {isDone ? `Finished ${formatDate(lesson.completedAt)}` : "Core Lesson & Practice"}
            {wordsCount > 0 && ` • ${wordsCount} words`}
          </p>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex items-center gap-2">
        {isDone && bridge?.passed && (
          <>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              {Math.round((bridge.score ?? 1) * 100)}%
            </span>
            <Link
              href={getLessonHref(lesson.id)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Review
            </Link>
          </>
        )}

        {isDone && !bridge && (
          <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-400">
            <Loader2 className="h-3 w-3 animate-spin" /> Building...
          </span>
        )}

        {isDone && bridge && !bridge.passed && (
          <Link
            href={`/foundation/vocab/${bridge.id}`}
            className="rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-amber-600"
          >
            Vocab Bridge
          </Link>
        )}

        {!isDone && (
          <Link
            href={getLessonHref(lesson.id)}
            className={`rounded-xl px-4 py-1.5 text-xs font-extrabold transition-all ${
              isNext
                ? "bg-blue-600 text-white shadow-xs hover:bg-blue-700 active:scale-95"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            {isNext ? "Start" : "Locked"}
          </Link>
        )}
      </div>
    </div>
  );
}