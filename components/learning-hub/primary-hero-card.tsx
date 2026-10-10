import Link from "next/link";
import { ArrowRight, Headphones, Loader2, Lock, Sparkles, Zap } from "lucide-react";
import type { LearningPath } from "@/app/actions/get-learning-path";
import { vocabWordCount } from "./utils";

type Lesson = LearningPath["lessons"][number];

type PrimaryHeroCardProps = {
  path: LearningPath | null;
  vocabDue?: Lesson;
  nextLesson?: Lesson;
  waitingOnVocab: boolean;
  getLessonHref: (id: string) => string;
};

export function PrimaryHeroCard({
  path,
  vocabDue,
  nextLesson,
  waitingOnVocab,
  getLessonHref,
}: PrimaryHeroCardProps) {
  const cardStyle =
    "relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs flex flex-col justify-between min-h-[230px]";

  if (!path) {
    return (
      <div className={cardStyle}>
        <div>
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
      </div>
    );
  }

  if (vocabDue?.bridge) {
    return (
      <div className={`${cardStyle} border-amber-200 bg-gradient-to-br from-amber-50/50 via-white to-white`}>
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800 uppercase">
            <Lock className="h-3.5 w-3.5" /> Next Spoon Locked
          </div>
          <h3 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
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

  if (waitingOnVocab) {
    return (
      <div className={cardStyle}>
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700 uppercase">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-blue-600" /> Lesson Complete
          </div>
          <h3 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
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

  if (nextLesson) {
    return (
      <div className={`${cardStyle} border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-white`}>
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Spoon {nextLesson.orderIndex} Ready
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