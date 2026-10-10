import { Lock, Sparkles } from "lucide-react";
import type { LearningPath } from "@/app/actions/get-learning-path";

type Lesson = LearningPath["lessons"][number];

type LearningPathMiniCardsProps = {
  lessons: Lesson[];
  vocabDue?: Lesson;
  nextLesson?: Lesson;
};

const SPOONS_PER_PICK = 5;
const TOPIC_CHIPS = ["🐶 Dogs", "🐱 Cats", "☕ Coffee", "✈️ Travel", "🍽️ Food", "🎵 Music"];

export function LearningPathMiniCards({
  lessons,
  vocabDue,
  nextLesson,
}: LearningPathMiniCardsProps) {
  if (lessons.length === 0) return null;

  const focusLesson = vocabDue ?? nextLesson;
  const isVocabFocus = !!vocabDue;

  // The "up next" spoon is ALWAYS the lesson after the focus lesson.
  // (Previously the vocab case used +0, which pointed back at the same spoon.)
  const focusIndex = focusLesson
    ? lessons.findIndex((l) => l.id === focusLesson.id)
    : -1;
  const upNextLesson =
    focusIndex >= 0 && focusIndex + 1 < lessons.length
      ? lessons[focusIndex + 1]
      : null;

  const completedCount = lessons.filter((l) => !!l.completedAt).length;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* LEFT COLUMN: current focus + up next */}
      <div className="flex flex-col gap-4">
        {focusLesson &&
          (isVocabFocus ? (
            <VocabBridgeCard lesson={focusLesson} />
          ) : (
            <CurrentSpoonCard lesson={focusLesson} />
          ))}

        {upNextLesson && <UpNextSpoonCard lesson={upNextLesson} />}
      </div>

      {/* RIGHT COLUMN: custom generator teaser */}
      <CustomGeneratorCard completedCount={completedCount} />
    </section>
  );
}

/* ---------- Vocab bridge: text only, no image ---------- */
function VocabBridgeCard({ lesson }: { lesson: Lesson }) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border-2 border-indigo-500/20 bg-white p-6 shadow-sm ring-1 ring-indigo-500/10">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-blue-700 uppercase">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
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
      <div className="mt-6 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="w-1/2 rounded-full bg-blue-500" />
      </div>
    </div>
  );
}

/* ---------- Current spoon: image banner ---------- */
function CurrentSpoonCard({ lesson }: { lesson: Lesson }) {
  return (
    <div className="overflow-hidden rounded-3xl border-2 border-indigo-500/20 bg-white shadow-sm ring-1 ring-indigo-500/10">
      {lesson.imageUrl && (
        <div className="relative aspect-[16/8] w-full bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lesson.imageUrl}
            alt={lesson.imageAlt ?? ""}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      )}
      <div className="p-6">
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
  );
}

/* ---------- Up next spoon: blurred teaser ---------- */
function UpNextSpoonCard({ lesson }: { lesson: Lesson }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/60">
      {lesson.imageUrl && (
        <div className="relative aspect-[16/7] w-full overflow-hidden bg-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lesson.imageUrl}
            alt=""
            aria-hidden
            className="h-full w-full scale-110 object-cover blur-sm grayscale"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-slate-600 uppercase">
              <Lock className="h-3 w-3" /> Up Next
            </span>
          </div>
        </div>
      )}
      <div className="p-6">
        {!lesson.imageUrl && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/70 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-slate-500 uppercase">
            <Lock className="h-3 w-3" /> Up Next
          </span>
        )}
        <h4 className="mt-2 text-lg font-black text-slate-400">
          Spoon {lesson.orderIndex}
        </h4>
        <p className="mt-1 text-sm font-bold text-slate-500">{lesson.title}</p>
        <p className="mt-1 text-xs text-slate-400">
          Complete your current focus to unlock this lesson.
        </p>
      </div>
    </div>
  );
}

/* ---------- Custom generator: coming soon teaser ---------- */
function CustomGeneratorCard({ completedCount }: { completedCount: number }) {
  const progress = completedCount % SPOONS_PER_PICK;
  const remaining = SPOONS_PER_PICK - progress;

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-dashed border-violet-300/70 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-violet-700 uppercase">
          <Sparkles className="h-3 w-3" /> Coming Soon
        </span>

        <h4 className="mt-4 text-lg font-black text-slate-900">
          Custom Spoon Generator
        </h4>
        <p className="mt-1 text-xs text-slate-500">
          Every {SPOONS_PER_PICK} spoons, you choose what to learn next.
        </p>

        <div className="mt-5 flex flex-wrap gap-2" aria-label="Example topics">
          {TOPIC_CHIPS.map((chip) => (
            <span
              key={chip}
              className="cursor-not-allowed select-none rounded-full border border-violet-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-500 opacity-70"
            >
              {chip}
            </span>
          ))}
          <span className="select-none rounded-full border border-dashed border-violet-200 px-3 py-1.5 text-xs font-bold text-violet-400">
            + Your own
          </span>
        </div>
      </div>

      <div className="relative mt-6">
        <div className="flex gap-1.5">
          {Array.from({ length: SPOONS_PER_PICK }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < progress ? "bg-violet-500" : "bg-violet-200/60"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] font-bold text-slate-400">
          {remaining} more {remaining === 1 ? "spoon" : "spoons"} until your next pick
        </p>
      </div>
    </div>
  );
}