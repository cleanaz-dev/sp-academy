import Link from "next/link";
import {
  Lock,
  Sparkles,
  Loader2,
  ArrowRight,
  Mic,
  CheckCircle2,
  Swords,
  Zap,
  Headphones,
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
  coverUrl?: string;
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
    getLessonHref
      ? getLessonHref(lessonId)
      : `/foundation/${lessonId}/${courseId}`;

  const resolveBossHref = (bossId: string, lessonId: string) =>
    getBossHref
      ? getBossHref(bossId, lessonId)
      : `/foundation/${lessonId}/${courseId}/boss?bossId=${bossId}`;

  return (
    <div className="space-y-3">
      {/* Path Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          <h3 className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
            Current Unit Progression
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Complete current step to unlock next
        </span>
      </div>

      <section className="relative grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Desktop Step Connector Badge */}
        {nextLocked && (
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-md">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        )}

        {/* 1. ACTIVE FOCUS CARD */}
        {currentFocus.type === "SPOON" && (
          <CurrentSpoonCard
            lesson={currentFocus.data}
            href={resolveLessonHref(currentFocus.data.id)}
          />
        )}
        {currentFocus.type === "BRIDGE" && (
          <VocabBridgeCard
            lesson={currentFocus.data}
            href={
              currentFocus.data.bridge
                ? `/foundation/vocab/${currentFocus.data.bridge.id}`
                : "#"
            }
          />
        )}
        {currentFocus.type === "BOSS" && (
          <BossStageCard
            lesson={currentFocus.data}
            getHref={(bossId) => resolveBossHref(bossId, currentFocus.data.id)}
          />
        )}

        {/* 2. UP NEXT LOCKED CARD */}
        {nextLocked && (
          <LockedNextCard type={nextLocked.type} lesson={nextLocked.data} />
        )}
      </section>
    </div>
  );
}

function CurrentSpoonCard({ lesson, href }: { lesson: Lesson; href: string }) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-indigo-200/90 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-2 ring-indigo-500/15 transition-all hover:shadow-[0_8px_30px_rgb(99,102,241,0.12)]"
    >
      <div className="relative aspect-[16/8] w-full shrink-0 overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700">
        {lesson.imageUrl ? (
          <img
            src={lesson.imageUrl}
            alt={lesson.imageAlt ?? ""}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Headphones className="h-12 w-12 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />

        <div className="absolute top-3.5 right-3.5 left-3.5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600/95 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase shadow-sm backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Active Focus
          </span>
          <span className="rounded-full bg-slate-900/65 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
            Step 1 of 2
          </span>
        </div>

        <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5 text-xs font-bold text-white/95">
          <Headphones className="h-3.5 w-3.5 text-indigo-300" />
          Spoon {lesson.orderIndex} Audio Lesson
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h4 className="text-lg font-black text-slate-900 transition-colors group-hover:text-indigo-600">
            {lesson.title || `Spoon ${lesson.orderIndex}`}
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Complete the core audio lesson and speaking drills to unlock your
            Vocab Bridge.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 text-xs font-extrabold text-indigo-600">
          <span>Continue Spoon {lesson.orderIndex}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function VocabBridgeCard({ lesson, href }: { lesson: Lesson; href: string }) {
  const isGenerating = !lesson.bridge;
  const vocabList =
    (lesson.bridge?.vocabMoment as Array<{ word: string }>) ?? [];
  const wordsToReview = vocabList.slice(0, 3);
  const remainingWords = Math.max(0, vocabList.length - 3);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-amber-300/90 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-2 ring-amber-400/20">
      <div className="relative aspect-[16/8] w-full shrink-0 overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600">
        {lesson.imageUrl ? (
          <img
            src={lesson.imageUrl}
            alt={lesson.imageAlt ?? ""}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Zap className="h-12 w-12 text-white/25" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/20 to-transparent" />

        <div className="absolute top-3.5 right-3.5 left-3.5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/95 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase shadow-sm backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Active Focus
          </span>
          {lesson.bridge && lesson.bridge.attempts > 0 ? (
            <span className="rounded-full bg-slate-900/65 px-2.5 py-1 text-[10px] font-bold text-amber-300 backdrop-blur-md">
              Best: {lesson.bridge.score ?? 0}%
            </span>
          ) : (
            <span className="rounded-full bg-slate-900/65 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
              Vocab Checkpoint
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5 text-xs font-bold text-white/95">
          <Zap className="h-3.5 w-3.5 text-amber-300" />
          Vocab Bridge {lesson.orderIndex}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h4 className="text-lg font-black text-slate-900">
            Reviewing: {lesson.title}
          </h4>

          {isGenerating ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
              Extracting key vocabulary...
            </div>
          ) : (
            wordsToReview.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
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

          <p className="mt-2.5 text-xs text-slate-500">
            Lock in these words to open the next stage.
          </p>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-3.5">
          {isGenerating ? (
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-amber-100">
              <div className="w-1/3 animate-pulse rounded-full bg-amber-400" />
            </div>
          ) : (
            <Link
              href={href}
              className="flex w-full items-center justify-between text-xs font-extrabold text-amber-600 transition group-hover:text-amber-700"
            >
              <span>Start Vocab Bridge</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </div>
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
  const milestoneNumber =
    boss?.milestoneIndex ?? Math.ceil(lesson.orderIndex / 3);
  const startSpoon = Math.max(1, lesson.orderIndex - 2);
  const endSpoon = lesson.orderIndex;

  const isBuilding = !boss || boss.status === "BUILDING";
  const scenario = (boss?.scenarioData ?? null) as ScenarioPreview | null;

  // Uses presigned bossStage.coverUrl, scenario.coverUrl, or falls back to the 3rd lesson's image
  const coverImage =
    boss?.coverUrl || scenario?.coverUrl || lesson.imageUrl || null;

  const scenarioTitle =
    scenario?.title || scenario?.setting || "AI Conversation";
  const scenarioDesc =
    scenario?.description ||
    scenario?.objective ||
    "Prove your fluency! Have a live conversation with AI using the patterns and vocabulary from your last 3 lessons.";

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-fuchsia-200/90 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-2 ring-fuchsia-500/15 transition-all hover:shadow-[0_8px_30px_rgb(217,70,239,0.12)]">
      {/* Top Media Banner — matches Spoon 4 height so cards align cleanly */}
      <div className="relative aspect-[16/8] w-full shrink-0 overflow-hidden bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-700">
        {coverImage ? (
          <img
            src={coverImage}
            alt={scenarioTitle}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Swords className="h-12 w-12 text-white/25" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/15 to-transparent" />

        <div className="absolute top-3.5 right-3.5 left-3.5 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/95 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase shadow-sm backdrop-blur-md">
            <Sparkles className="h-3 w-3" />
            Milestone {milestoneNumber}
          </span>
          <span className="rounded-full bg-slate-900/65 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
            Spoons {startSpoon}–{endSpoon}
          </span>
        </div>

        <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5 text-xs font-bold text-white/95">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
          {scenario?.aiRole
            ? `Partner: ${scenario.aiRole}`
            : "Live AI Checkpoint"}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h4 className="text-lg font-black text-slate-900">{scenarioTitle}</h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
            {scenarioDesc}
          </p>

          {/* Completed Spoon Pills feeding into this Boss Stage */}
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            {[startSpoon, startSpoon + 1, endSpoon].map((num) => (
              <span
                key={num}
                className="inline-flex items-center gap-1 rounded-lg bg-fuchsia-50 px-2 py-0.5 text-[10px] font-bold text-fuchsia-700"
              >
                <CheckCircle2 className="h-3 w-3 text-fuchsia-500" />
                Spoon {num}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-3.5">
          {isBuilding ? (
            <div className="inline-flex w-full items-center gap-2 text-xs font-bold text-fuchsia-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Building Scenario...
            </div>
          ) : (
            <Link
              href={getHref(boss.id)}
              className="flex w-full items-center justify-between text-xs font-extrabold text-fuchsia-600 transition group-hover:text-fuchsia-700"
            >
              <span className="inline-flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5" />
                Enter Boss Arena
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
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

  const coverImage =
    type === "BOSS"
      ? lesson.bossStage?.coverUrl || lesson.imageUrl
      : lesson.imageUrl;

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
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white/75 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <div className="relative aspect-[16/8] w-full shrink-0 overflow-hidden bg-slate-200">
        {coverImage ? (
          <img
            src={coverImage}
            alt={lesson.imageAlt ?? ""}
            className="h-full w-full object-cover opacity-80 contrast-95 saturate-[0.25]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <Lock className="h-10 w-10 text-slate-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-slate-900/15 to-transparent" />

        <div className="absolute top-3.5 right-3.5 left-3.5 flex items-center justify-between">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-slate-600 uppercase backdrop-blur-md">
            Up Next
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase backdrop-blur-md">
            <Lock className="h-3 w-3" /> Locked
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h4 className="text-lg font-black text-slate-500">{getTitle()}</h4>
          <p className="mt-0.5 text-sm font-bold text-slate-400">
            {getSubtitle()}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Unlocks automatically as soon as you pass your active focus step.
          </p>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Lock className="h-3.5 w-3.5 shrink-0 text-slate-300" />
            Finish current focus to unlock
          </p>
        </div>
      </div>
    </div>
  );
}