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

  return (
    <div className="min-h-screen bg-[#F4F6FC] font-sans text-slate-900 selection:bg-indigo-100">
      {/* TOP HERO HEADER */}
      <header className="relative overflow-hidden bg-slate-900 pt-12 pb-24 text-white shadow-xl">
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-96 w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-violet-600/30 via-fuchsia-600/20 to-blue-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-1/2 -z-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          {/* Top Pill Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-200 backdrop-blur-md">
              <Globe2 className="h-4 w-4 text-violet-400" />
              <span>
                Learning <strong className="text-white uppercase">{lang?.targetLanguage ?? "French"}</strong> from{" "}
                <span className="text-slate-400">{lang?.nativeLanguage ?? "English"}</span>
              </span>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>Streak: 1</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                <Trophy className="h-4 w-4 text-emerald-400" />
                <span>{completedLessonsCount} Completed</span>
              </div>
            </div>
          </div>

          <div className="max-w-2xl">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Ready to learn today?
            </h1>
            <p className="mt-2 text-base text-slate-300 sm:text-lg">
              Master essential speech patterns step-by-step through bite-sized interactive audio lessons.
            </p>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-20 mx-auto -mt-14 max-w-5xl px-6 pb-24">
        {/* ACTION CARDS ROW */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* PRIMARY CURRENT SPOON CARD */}
          <div className="md:col-span-2">
            <PrimaryHeroCard
              path={path}
              vocabDue={vocabDue}
              nextLesson={nextLesson}
              waitingOnVocab={waitingOnVocab}
              getLessonHref={getLessonHref}
            />
          </div>

          {/* AI PRACTICE CARD */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-100/60 blur-2xl transition group-hover:scale-150" />

            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold tracking-wider text-purple-700 uppercase">
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                  Free Practice
                </span>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              </div>

              <h3 className="mt-4 text-xl font-extrabold text-slate-900">
                Conversational AI Tutor
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Practice whatever you've learned in live spoken dialogues anytime with instant pronunciation feedback.
              </p>
            </div>

            <Link
              href="/learning-hub/conversation"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3.5 text-sm font-bold text-slate-800 transition hover:bg-slate-900 hover:text-white"
            >
              <MessageSquare className="h-4 w-4" /> Start conversation
            </Link>
          </div>
        </div>

        {/* LEARNING TIMELINE PATH */}
        <section className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Your Learning Path
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Structured lessons designed to build fluent reflexes.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-400">
              {lessons.length} {lessons.length === 1 ? "Spoon" : "Spoons"} Scheduled
            </div>
          </div>

          {lessons.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
              <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <p className="font-semibold">No lessons prepared yet.</p>
              <p className="text-xs text-slate-400">Complete setup or refresh in a moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
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
    "relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:shadow-md flex flex-col justify-between";

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
          <h3 className="mt-4 text-2xl font-black text-slate-900">
            Review Vocabulary for Spoon {vocabDue.orderIndex}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Solidify the {vocabWordCount(vocabDue.bridge.vocabMoment)} new words you encountered to unlock Spoon {vocabDue.orderIndex + 1}.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Estimated: 3 mins</span>
          <Link
            href={`/foundation/vocab/${vocabDue.bridge.id}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600 active:scale-95"
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
          <h3 className="mt-4 text-2xl font-black text-slate-900">
            Synthesizing Your Vocab Bridge...
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Our language engine is extracting the key vocabulary moments from your completed session.
          </p>
        </div>
        <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-400">
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
            <span className="text-xs font-bold text-slate-400">5-7 min session</span>
          </div>

          <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Spoon {nextLesson.orderIndex}: Foundation Lesson
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Target speaking exercises, sentence construction, and listening drills tailored to your level.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Headphones className="h-4 w-4 text-slate-500" />
            <span>Interactive Audio Lesson</span>
          </div>

          <Link
            href={getLessonHref(nextLesson.id)}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
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
// TIMELINE ROW ITEM
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
      className={`group relative flex flex-col justify-between gap-4 rounded-2xl border p-5 transition-all sm:flex-row sm:items-center ${
        isNext
          ? "border-blue-300 bg-white shadow-md ring-2 ring-blue-500/10"
          : isDone
          ? "border-slate-200/70 bg-white/80 opacity-95"
          : "border-slate-200/50 bg-slate-50/50"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Status Indicator Icon */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black transition-all ${
            isDone
              ? "bg-emerald-100 text-emerald-600 shadow-xs"
              : isNext
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-slate-200/80 text-slate-400"
          }`}
        >
          {isDone ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : isNext ? (
            <BookOpen className="h-5 w-5" />
          ) : (
            <Lock className="h-5 w-5" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900">Spoon {lesson.orderIndex}</h3>
            {isDone && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Completed
              </span>
            )}
            {isNext && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                Up Next
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {isDone ? `Finished on ${formatDate(lesson.completedAt)}` : "Core Lesson & Practice"}
            {wordsCount > 0 && ` • ${wordsCount} vocabulary items`}
          </p>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-3 self-end sm:self-auto">
        {/* 1. Completed state with passed bridge */}
        {isDone && bridge?.passed && (
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              Score: {Math.round((bridge.score ?? 1) * 100)}%
            </span>
            <Link
              href={getLessonHref(lesson.id)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Review
            </Link>
          </div>
        )}

        {/* 2. Completed state waiting on vocab bridge generation */}
        {isDone && !bridge && (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Vocab building...
          </span>
        )}

        {/* 3. Completed state with unpassed vocab bridge */}
        {isDone && bridge && !bridge.passed && (
          <Link
            href={`/learning-hub/vocab/${bridge.id}`}
            className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-600"
          >
            {bridge.attempts > 0 ? "Retry Vocab Bridge" : "Take Vocab Bridge"}
          </Link>
        )}

        {/* 4. Lesson Not Done (Active CTA) */}
        {!isDone && (
          <Link
            href={getLessonHref(lesson.id)}
            className={`rounded-xl px-5 py-2 text-xs font-extrabold transition-all ${
              isNext
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            {isNext ? "Start Spoon" : "Locked"}
          </Link>
        )}
      </div>
    </div>
  );
}