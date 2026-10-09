"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Loader2,
  Lock,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import type { LearningPath } from "@/app/actions/get-learning-path";
import { Reveal } from "@/components/ui/misc/reveal"; // adjust to wherever Reveal lives
import { formatDate } from "./utils";

type Lesson = LearningPath["lessons"][number];

type Props = {
  path: LearningPath | null;
  // Included `any` to allow strict Enums (like `Languages`) passed down from Prisma
  lang: { nativeLanguage: string; targetLanguage: string | null | any };
};

function vocabWordCount(vocabMoment: unknown): number {
  return Array.isArray(vocabMoment) ? vocabMoment.length : 0;
}

export default function FoundationHubPage({ path, lang }: Props) {
  const router = useRouter();
  const lessons = path?.lessons ?? [];

  // A finished lesson with no bridge yet means the vocab lambda is still running
  const waitingOnVocab = lessons.some((l) => l.completedAt && !l.bridge);

  useEffect(() => {
    if (!waitingOnVocab) return;
    const t = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(t);
  }, [waitingOnVocab, router]);

  // Vocab gate comes first, then the next unfinished lesson
  const vocabDue = lessons.find((l) => l.completedAt && l.bridge && !l.bridge.passed);
  const nextLesson = lessons.find((l) => !l.completedAt);

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans">
      <header className="animate-gradient bg-linear-to-r from-violet-500 via-fuchsia-500 to-indigo-500 bg-size-[300%_300%] py-16 text-white shadow-md">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal as="h1" className="mb-3 text-4xl font-extrabold tracking-tight">
            Your Learning Hub
          </Reveal>
          <Reveal as="p" delay={0.1} className="text-lg opacity-90 font-medium">
            {lang?.targetLanguage
              ? `Learning ${lang.targetLanguage} from ${lang.nativeLanguage}`
              : "Pick up where you left off."}
          </Reveal>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-10 pb-24 space-y-10">
        {/* PRIMARY ACTION + CONVERSATION */}
        <div className="grid gap-6 md:grid-cols-3">
          <Reveal className="md:col-span-2">
            <PrimaryCard
              path={path}
              vocabDue={vocabDue}
              nextLesson={nextLesson}
              waitingOnVocab={waitingOnVocab}
            />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full rounded-3xl border border-gray-100 bg-white p-6 shadow-xs flex flex-col gap-4">
              <div className="text-xs font-bold uppercase tracking-widest text-purple-600">
                Practice anytime
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Talk to the AI</h3>
              <p className="text-sm text-gray-500">
                Use what you've learned in a real conversation.
              </p>
              <Link
                href="/learning-hub/conversation"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 font-bold text-gray-900 hover:bg-gray-200"
              >
                <MessageCircle size={18} /> Start conversation
              </Link>
            </div>
          </Reveal>
        </div>

        {/* LESSON PATH */}
        <section>
          <Reveal as="h2" className="mb-5 text-2xl font-extrabold text-gray-900">
            Your path
          </Reveal>

          {lessons.length === 0 ? (
            <Reveal>
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-500">
                No lessons yet. Start your first one to see it here.
              </div>
            </Reveal>
          ) : (
            <ul className="space-y-4">
              {lessons.map((lesson, i) => (
                <Reveal as="li" key={lesson.id} delay={Math.min(i * 0.05, 0.3)}>
                  <LessonRow lesson={lesson} />
                </Reveal>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function PrimaryCard({
  path,
  vocabDue,
  nextLesson,
  waitingOnVocab,
}: {
  path: LearningPath | null;
  vocabDue?: Lesson;
  nextLesson?: Lesson;
  waitingOnVocab: boolean;
}) {
  const shell = "h-full rounded-3xl bg-white border border-gray-100 p-6 shadow-xs flex flex-col gap-4";

  if (!path) {
    return (
      <div className={shell}>
        <h3 className="text-xl font-extrabold text-gray-900">Welcome</h3>
        <p className="text-sm text-gray-500">Start your first lesson to begin your path.</p>
      </div>
    );
  }

  if (vocabDue?.bridge) {
    return (
      <div className={shell}>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600">
          <Lock size={14} /> Next lesson locked
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900">
          Finish mini vocab to unlock Day {vocabDue.orderIndex + 1}
        </h3>
        <Link
          href={`/learning-hub/vocab/${vocabDue.bridge.id}`}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 font-bold text-white hover:bg-black"
        >
          <Sparkles size={18} /> Start mini vocab
        </Link>
      </div>
    );
  }

  if (waitingOnVocab) {
    return (
      <div className={shell}>
        <div className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Nice work
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900">Preparing your mini vocab...</h3>
        <div className="mt-auto flex items-center gap-2 text-sm text-gray-400">
          <Loader2 size={16} className="animate-spin" /> Usually a few minutes
        </div>
      </div>
    );
  }

  if (nextLesson) {
    return (
      <div className={shell}>
        <div className="text-xs font-bold uppercase tracking-widest text-green-600">
          Unlocked
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900">
          Day {nextLesson.orderIndex} is ready
        </h3>
        <Link
          href={`/learning-hub/lesson/${nextLesson.id}`}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700"
        >
          Start Day {nextLesson.orderIndex} <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className={shell}>
      <h3 className="text-2xl font-extrabold text-gray-900">All caught up 🎉</h3>
      <p className="text-sm text-gray-500">Try a conversation while your next lesson builds.</p>
    </div>
  );
}

function LessonRow({ lesson }: { lesson: Lesson }) {
  const { bridge } = lesson;
  const done = !!lesson.completedAt;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            done ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-600"
          }`}
        >
          {done ? <CheckCircle2 size={22} /> : <BookOpen size={22} />}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Day {lesson.orderIndex}</h3>
          <p className="text-sm text-gray-500">
            {done ? `Finished ${formatDate(lesson.completedAt)}` : "Not finished yet"}
            {bridge && ` · ${vocabWordCount(bridge.vocabMoment)} new words`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {done && !bridge && (
          <span className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 size={14} className="animate-spin" /> Vocab building
          </span>
        )}

        {bridge?.passed && (
          <span className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-bold text-green-700">
            Vocab {Math.round((bridge.score ?? 1) * 100)}%
          </span>
        )}

        {bridge && !bridge.passed && (
          <Link
            href={`/learning-hub/vocab/${bridge.id}`}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-black"
          >
            {bridge.attempts > 0 ? "Retry vocab" : "Start vocab"}
          </Link>
        )}

        {!done && (
          <Link
            href={`/learning-hub/lesson/${lesson.id}`}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            Start
          </Link>
        )}
      </div>
    </div>
  );
}