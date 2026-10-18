import Link from "next/link";
import {
  Lock,
  Sparkles,
  Loader2,
  ArrowRight,
  Mic,
  BookOpen,
  Swords,
} from "lucide-react";
import type { LearningPath } from "@/app/actions/get-learning-path";

type FocusState = LearningPath["currentFocus"];
type Lesson = LearningPath["lessons"][number];

type ScenarioPreview = {
  title?: string;
  setting?: string;
  description?: string;
  aiRole?: string;
  objective?: string;
};

export function LearningPathMiniCards({
  courseId,
  currentFocus,
  nextLocked,
  getLessonHref,
  getBossHref,
}: {
  courseId: string;
  currentFocus: FocusState;
  nextLocked: FocusState;
  getLessonHref?: (lessonId: string) => string;
  getBossHref?: (bossId: string, lessonId: string) => string;
}) {
  if (!currentFocus) return null;

  const resolveLessonHref = (lessonId: string) =>
    getLessonHref ? getLessonHref(lessonId) : `/foundation/${lessonId}/${courseId}`;

  const resolveBossHref = (bossId: string, lessonId: string) =>
    getBossHref
      ? getBossHref(bossId, lessonId)
      : `/foundation/${lessonId}/${courseId}/boss?bossId=${bossId}`;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* 1. ACTIVE FOCUS */}
      {currentFocus.type === "SPOON" && (
        <CurrentSpoonCard
          lesson={currentFocus.data}
          href={resolveLessonHref(currentFocus.data.id)}
        />
      )}
      {currentFocus.type === "BRIDGE" && (
        <VocabBridgeCard
          lesson={currentFocus.data}
          href={`${resolveLessonHref(currentFocus.data.id)}?step=bridge`}
        />
      )}
      {currentFocus.type === "BOSS" && (
        <BossStageCard
          lesson={currentFocus.data}
          getHref={(bossId) => resolveBossHref(bossId, currentFocus.data.id)}
        />
      )}

      {/* 2. UP NEXT LOCKED */}
      {nextLocked && (
        <LockedNextCard type={nextLocked.type} lesson={nextLocked.data} />
      )}
    </section>
  );
}

function VocabBridgeCard({ lesson, href }: { lesson: Lesson; href: string }) {
  const isGenerating = !lesson.bridge;
  const vocabList = (lesson.bridge?.vocabMoment as Array<{ word: string }>) ?? [];
  const wordsToReview = vocabList.slice(0, 3);
  const remainingWords = Math.max(0, vocabList.length - 3);

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-400/40 bg-white p-6 shadow-sm ring-1 ring-amber-400/20">
      {lesson.imageUrl && (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.04]"
          style={{ backgroundImage: `url(${lesson.imageUrl})` }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-amber-700 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            Current Focus
          </span>
          {lesson.bridge && lesson.bridge.attempts > 0 && (
            <span className="text-[11px] font-bold text-amber-700">
              Best: {lesson.bridge.score ?? 0}%
            </span>
          )}
        </div>

        <h4 className="mt-4 text-lg font-black text-slate-900">
          Vocab Bridge {lesson.orderIndex}
        </h4>
        <p className="mt-0.5 text-sm font-bold text-slate-600">
          Reviewing: {lesson.title}
        </p>

        {/* VOCAB PREVIEW PILLS */}
        {isGenerating ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-50/80 px-3 py-2 text-xs font-semibold text-amber-800">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
            Extracting key vocabulary...
          </div>
        ) : (
          wordsToReview.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {wordsToReview.map((v, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900"
                >
                  {v.word}
                </span>
              ))}
              {remainingWords > 0 && (
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                  +{remainingWords} more
                </span>
              )}
            </div>
          )
        )}

        <p className="mt-3 text-xs text-slate-500">
          Master the new words to unlock the next step.
        </p>
      </div>

      <div className="relative z-10 mt-6">
        {isGenerating ? (
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-amber-100">
            <div className="w-1/3 animate-pulse rounded-full bg-amber-400" />
          </div>
        ) : (
          <Link
            href={href}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 active:scale-[0.99]"
          >
            Start Vocab Bridge
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

function CurrentSpoonCard({ lesson, href }: { lesson: Lesson; href: string }) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border-2 border-indigo-500/20 bg-white shadow-sm ring-1 ring-indigo-500/10 transition hover:border-indigo-500/40 hover:shadow-md"
    >
      {lesson.imageUrl && (
        <div className="relative aspect-[16/8] w-full shrink-0 overflow-hidden bg-slate-100">
          <img
            src={lesson.imageUrl}
            alt={lesson.imageAlt ?? ""}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-indigo-700 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-600" />
            Current Focus
          </span>
          <h4 className="mt-3 text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
            Spoon {lesson.orderIndex}
          </h4>
          <p className="mt-0.5 text-sm font-bold text-slate-600">{lesson.title}</p>
          <p className="mt-1.5 text-xs text-slate-500">
            Core audio lesson and speaking drills.
          </p>
        </div>

        <div className="mt-5 flex items-center text-xs font-extrabold text-indigo-600">
          Continue Lesson
          <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function BossStageCard({
  lesson,
  getHref,
}: {
  lesson: Lesson;
  getHref: (bossId: string) => string;
}) {
  const boss = lesson.bossStage;
  const milestoneNumber = boss?.milestoneIndex ?? Math.ceil(lesson.orderIndex / 3);
  const startSpoon = Math.max(1, lesson.orderIndex - 2);
  const endSpoon = lesson.orderIndex;

  // Check if Boss Stage is still being assembled by the backend
  const isBuilding = !boss || boss.status === "BUILDING";

  // Extract optional scenario metadata if scenarioData is populated JSON
  const scenario = (boss?.scenarioData ?? null) as ScenarioPreview | null;
  const scenarioTitle = scenario?.title || scenario?.setting || "AI Conversation";
  const scenarioDesc =
    scenario?.description ||
    scenario?.objective ||
    "Prove your fluency! Have a live conversation with AI using the patterns and vocabulary from your last 3 lessons.";

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border-2 border-fuchsia-500/40 bg-gradient-to-br from-white via-fuchsia-50/40 to-fuchsia-100/60 p-6 shadow-sm ring-1 ring-fuchsia-500/20">
      {/* Subtle decorative background icon */}
      <Swords className="pointer-events-none absolute -right-4 -bottom-4 h-28 w-28 rotate-12 text-fuchsia-500/5" />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-fuchsia-800 uppercase shadow-sm">
            <Sparkles className="h-3 w-3 text-fuchsia-600" />
            Milestone {milestoneNumber}
          </span>
          <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-fuchsia-700 ring-1 ring-fuchsia-200">
            Spoons {startSpoon}–{endSpoon}
          </span>
        </div>

        <h4 className="mt-4 text-lg font-black text-slate-900">
          {scenarioTitle}
        </h4>

        {scenario?.aiRole && (
          <p className="mt-0.5 text-xs font-bold text-fuchsia-700">
            Speaking with: {scenario.aiRole}
          </p>
        )}

        <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
          {scenarioDesc}
        </p>
      </div>

      <div className="relative z-10 mt-6">
        {isBuilding ? (
          <button
            disabled
            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-fuchsia-200/80 py-2.5 text-sm font-bold text-fuchsia-800"
          >
            <Loader2 className="h-4 w-4 animate-spin text-fuchsia-700" />
            Building Scenario...
          </button>
        ) : (
          <Link
            href={getHref(boss.id)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-fuchsia-600 py-2.5 text-sm font-bold text-white shadow-md shadow-fuchsia-500/20 transition hover:bg-fuchsia-700 active:scale-95"
          >
            <Mic className="h-4 w-4" />
            Start Conversation
          </Link>
        )}
      </div>
    </div>
  );
}

function LockedNextCard({
  type,
  lesson,
}: {
  type: "SPOON" | "BRIDGE" | "BOSS";
  lesson: Lesson;
}) {
  const startSpoon = Math.max(1, lesson.orderIndex - 2);
  const endSpoon = lesson.orderIndex;

  const getTitle = () => {
    if (type === "SPOON") return `Spoon ${lesson.orderIndex}`;
    if (type === "BRIDGE") return `Vocab Bridge ${lesson.orderIndex}`;
    return `Milestone ${Math.ceil(lesson.orderIndex / 3)} Boss`;
  };

  const getSubtitle = () => {
    if (type === "SPOON") return lesson.title;
    if (type === "BRIDGE") return `Reviewing: ${lesson.title}`;
    return `Fluency Checkpoint (Spoons ${startSpoon}–${endSpoon})`;
  };

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50/70 shadow-sm">
      {type === "SPOON" && lesson.imageUrl && (
        <div className="relative aspect-[16/8] w-full shrink-0 overflow-hidden bg-slate-200 grayscale opacity-60">
          <img
            src={lesson.imageUrl}
            alt={lesson.imageAlt ?? ""}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/80 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-slate-500 uppercase">
              Up Next
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/80 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-slate-500 uppercase">
              <Lock className="h-3 w-3" /> Locked
            </span>
          </div>

          <h4 className="mt-4 text-lg font-black text-slate-400">
            {getTitle()}
          </h4>
          <p className="mt-0.5 text-sm font-bold text-slate-400">
            {getSubtitle()}
          </p>
        </div>

        <p className="mt-6 flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <BookOpen className="h-3.5 w-3.5 shrink-0 text-slate-300" />
          Finish your current focus to unlock this step.
        </p>
      </div>
    </div>
  );
}