import { Lock } from "lucide-react";
import type { LearningPath } from "@/app/actions/get-learning-path";

type Lesson = LearningPath["lessons"][number];

type LearningPathMiniCardsProps = {
  lessons: Lesson[];
  vocabDue?: Lesson;
  nextLesson?: Lesson;
};

export function LearningPathMiniCards({ lessons, vocabDue, nextLesson }: LearningPathMiniCardsProps) {
  if (lessons.length === 0) return null;

  // Determine what is "Up Next" (Could be a Vocab Bridge or a new Spoon)
  const isVocabFocus = !!vocabDue;
  const focusLesson = vocabDue || nextLesson;

  // Determine what is "Locked" (The thing immediately after the focus)
  const lockedLessonIndex = focusLesson
    ? lessons.findIndex((l) => l.id === focusLesson.id) + (isVocabFocus ? 0 : 1)
    : -1;
  const lockedLesson =
    lockedLessonIndex >= 0 && lockedLessonIndex < lessons.length
      ? lessons[lockedLessonIndex]
      : null;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* LEFT CARD: Current Focus */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-indigo-500/20 bg-white p-6 shadow-sm ring-1 ring-indigo-500/10">
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-blue-700 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" /> Current Focus
            </span>
          </div>
          <h4 className="mt-4 text-lg font-black text-slate-900">
            {isVocabFocus
              ? `Vocab Bridge ${focusLesson?.orderIndex}`
              : `Spoon ${focusLesson?.orderIndex}`}
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            {isVocabFocus
              ? "Master the new words to unlock the next step."
              : "Core audio lesson and speaking drills."}
          </p>
        </div>

        {/* Visual Progress Indicator */}
        <div className="mt-6 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="w-1/2 rounded-full bg-blue-500" />
        </div>
      </div>

      {/* RIGHT CARD: On Deck */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/50 p-6 opacity-90">
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/70 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-slate-500 uppercase">
              <Lock className="h-3 w-3" /> Locked
            </span>
          </div>
          <h4 className="mt-4 text-lg font-black text-slate-400">
            {isVocabFocus
              ? `Spoon ${lockedLesson?.orderIndex ?? "Next"}`
              : `Vocab Bridge ${lockedLesson?.orderIndex ?? "Next"}`}
          </h4>
          <p className="mt-1 text-xs text-slate-400">
            Complete your current focus to unlock this content.
          </p>
        </div>

        <div className="mt-6 flex h-2 w-full overflow-hidden rounded-full bg-slate-200/70" />
      </div>
    </section>
  );
}