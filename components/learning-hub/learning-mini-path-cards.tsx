import { Lock } from "lucide-react";
import type { LearningPath } from "@/app/actions/get-learning-path";

type Lesson = LearningPath["lessons"][number];

type LearningPathMiniCardsProps = {
  lessons: Lesson[];
  vocabDue?: Lesson;
  nextLesson?: Lesson;
};

export function LearningPathMiniCards({
  lessons,
  vocabDue,
  nextLesson,
}: LearningPathMiniCardsProps) {
  if (lessons.length === 0) return null;

  const isVocabFocus = !!vocabDue;
  const focusLesson = vocabDue || nextLesson;

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
      <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-indigo-500/20 bg-white shadow-sm ring-1 ring-indigo-500/10">
        {focusLesson?.imageUrl && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={focusLesson.imageUrl}
              alt={focusLesson.imageAlt ?? ""}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-blue-700 uppercase backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
              Current Focus
            </span>
          </div>
        )}

        <div className="flex flex-1 flex-col justify-between p-6">
          <div>
            {!focusLesson?.imageUrl && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-blue-700 uppercase">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
                Current Focus
              </span>
            )}
            <h4 className="mt-2 text-lg font-black text-slate-900">
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

          <div className="mt-6 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="w-1/2 rounded-full bg-blue-500" />
          </div>
        </div>
      </div>

      {/* RIGHT CARD: Locked */}
      <div className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/50 opacity-90">
        {lockedLesson?.imageUrl && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lockedLesson.imageUrl}
              alt=""
              aria-hidden
              className="h-full w-full scale-110 object-cover blur-sm grayscale"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-slate-600 uppercase">
                <Lock className="h-3 w-3" /> Locked
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col justify-between p-6">
          <div>
            {!lockedLesson?.imageUrl && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/70 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-slate-500 uppercase">
                <Lock className="h-3 w-3" /> Locked
              </span>
            )}
            <h4 className="mt-2 text-lg font-black text-slate-400">
              {isVocabFocus
                ? `Spoon ${lockedLesson?.orderIndex ?? "Next"}`
                : `Vocab Bridge ${lockedLesson?.orderIndex ?? "Next"}`}
            </h4>
            <p className="mt-1 font-bold text-slate-500">{lockedLesson?.title}</p>
            <p className="mt-1 text-xs text-slate-400">
              Complete your current focus to unlock this content.
            </p>
          </div>

          <div className="mt-6 flex h-2 w-full overflow-hidden rounded-full bg-slate-200/70" />
        </div>
      </div>
    </section>
  );
}