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

  const focusLesson = vocabDue ?? nextLesson;
  const isVocabFocus = !!vocabDue;

  // Up next is always the lesson after the focus lesson.
  const focusIndex = focusLesson
    ? lessons.findIndex((l) => l.id === focusLesson.id)
    : -1;
  const upNextLesson =
    focusIndex >= 0 && focusIndex + 1 < lessons.length
      ? lessons[focusIndex + 1]
      : null;

  return (
    // items-stretch (grid default) + h-full on each card = identical height and width
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {focusLesson &&
        (isVocabFocus ? (
          <VocabBridgeCard lesson={focusLesson} />
        ) : (
          <CurrentSpoonCard lesson={focusLesson} />
        ))}

      {upNextLesson && <UpNextSpoonCard lesson={upNextLesson} />}
    </section>
  );
}

/* ---------- Vocab bridge: amber, text only ---------- */
function VocabBridgeCard({ lesson }: { lesson: Lesson }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border-2 border-amber-400/40 bg-white p-6 shadow-sm ring-1 ring-amber-400/20">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-amber-700 uppercase">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          Current Focus
        </span>
        <h4 className="mt-4 text-lg font-black text-slate-900">
          Vocab Bridge {lesson.orderIndex}
        </h4>
        <p className="mt-1 text-sm font-bold text-slate-600">
          Reviewing: {lesson.title}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Master the new words to unlock the next step.
        </p>
      </div>
      <div className="mt-6 flex h-2 w-full overflow-hidden rounded-full bg-amber-100">
        <div className="w-1/2 rounded-full bg-amber-500" />
      </div>
    </div>
  );
}

/* ---------- Current spoon: blue, image banner ---------- */
function CurrentSpoonCard({ lesson }: { lesson: Lesson }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border-2 border-indigo-500/20 bg-white shadow-sm ring-1 ring-indigo-500/10">
      {lesson.imageUrl && (
        <div className="relative aspect-[16/8] w-full shrink-0 overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lesson.imageUrl}
            alt={lesson.imageAlt ?? ""}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-blue-700 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
            Current Focus
          </span>
          <h4 className="mt-3 text-lg font-black text-slate-900">
            Spoon {lesson.orderIndex}
          </h4>
          <p className="mt-1 text-sm font-bold text-slate-600">{lesson.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            Core audio lesson and speaking drills.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Up next spoon: lightly blurred, no overlay ---------- */
function UpNextSpoonCard({ lesson }: { lesson: Lesson }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white">
      {lesson.imageUrl && (
        <div className="relative aspect-[16/8] w-full shrink-0 overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lesson.imageUrl}
            alt=""
            aria-hidden
            className="h-full w-full scale-105 object-cover blur-[3px]"
            loading="lazy"
          />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-slate-600 uppercase shadow-sm backdrop-blur">
            <Lock className="h-3 w-3" /> Up Next
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          {!lesson.imageUrl && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-slate-500 uppercase">
              <Lock className="h-3 w-3" /> Up Next
            </span>
          )}
          <h4 className="mt-3 text-lg font-black text-slate-500">
            Spoon {lesson.orderIndex}
          </h4>
          <p className="mt-1 text-sm font-bold text-slate-600">{lesson.title}</p>
          <p className="mt-1 text-xs text-slate-400">
            Complete your current focus to unlock this lesson.
          </p>
        </div>
      </div>
    </div>
  );
}