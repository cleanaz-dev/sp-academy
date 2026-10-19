import Link from "next/link";
import {
  Lock,
  ArrowRight,
  CheckCircle2,
  Swords,
  Zap,
  Headphones,
} from "lucide-react";
import type { LearningPath } from "@/app/actions/get-learning-path";
import { resolveAssetUrl } from "./primary-hero-card";

type FocusState = LearningPath["currentFocus"];
type Lesson = LearningPath["lessons"][number];

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
      : `/foundation/boss/${bossId}`;

  return (
    <div className="space-y-3">
      {/* Subtle Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          <h3 className="text-xs font-extrabold tracking-wider text-slate-500 uppercase">
            Unit Progression Path
          </h3>
        </div>
        <span className="text-xs font-medium text-slate-400">
          Complete current step to unlock next
        </span>
      </div>

      {/* Sleek Horizontal Strip instead of Tall Heavy Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ActiveStepTile
          focus={currentFocus}
          resolveLessonHref={resolveLessonHref}
          resolveBossHref={resolveBossHref}
        />

        {nextLocked && (
          <UpNextCompactTile
            type={nextLocked.type}
            lesson={nextLocked.data}
          />
        )}
      </div>
    </div>
  );
}

function ActiveStepTile({
  focus,
  resolveLessonHref,
  resolveBossHref,
}: {
  focus: NonNullable<FocusState>;
  resolveLessonHref: (id: string) => string;
  resolveBossHref: (bossId: string, lessonId: string) => string;
}) {
  const { type, data: lesson } = focus;

  // Extract Boss info if it's a boss stage
  const bossStage = lesson.bossStage;
  const bossData = (bossStage?.scenarioData as any)?.boss;
  const bossAvatar = resolveAssetUrl(bossData?.avatar?.default);
  const bossCover =
    resolveAssetUrl(bossStage?.coverUrl) ||
    resolveAssetUrl(bossData?.coverUrl) ||
    lesson.imageUrl;

  const href =
    type === "BOSS" && bossStage
      ? resolveBossHref(bossStage.id, lesson.id)
      : type === "BRIDGE" && lesson.bridge
        ? `/foundation/vocab/${lesson.bridge.id}`
        : resolveLessonHref(lesson.id);

  const thumbUrl = type === "BOSS" ? bossAvatar || bossCover : lesson.imageUrl;

  const badgeLabel =
    type === "BOSS"
      ? `Milestone ${bossStage?.milestoneIndex ?? Math.ceil(lesson.orderIndex / 3)}`
      : type === "BRIDGE"
        ? `Vocab Bridge ${lesson.orderIndex}`
        : `Spoon ${lesson.orderIndex}`;

  const title =
    type === "BOSS"
      ? bossData?.name || "AI Boss Checkpoint"
      : lesson.title || `Spoon ${lesson.orderIndex}`;

  const startSpoon = Math.max(1, lesson.orderIndex - 2);

  return (
    <Link
      href={href}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-indigo-200/70 bg-white/85 p-3.5 shadow-xs backdrop-blur-md transition-all hover:border-indigo-300 hover:bg-white hover:shadow-md"
    >
      {/* Thumbnail / Boss Avatar */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-900">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {type === "BOSS" ? (
              <Swords className="h-6 w-6 text-fuchsia-300" />
            ) : type === "BRIDGE" ? (
              <Zap className="h-6 w-6 text-amber-300" />
            ) : (
              <Headphones className="h-6 w-6 text-indigo-300" />
            )}
          </div>
        )}
      </div>

      {/* Compact Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
              type === "BOSS"
                ? "bg-fuchsia-100 text-fuchsia-700"
                : type === "BRIDGE"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-indigo-100 text-indigo-700"
            }`}
          >
            {badgeLabel}
          </span>
          <span className="text-[11px] font-bold text-emerald-600">
            • Active Now
          </span>
        </div>

        <h4 className="mt-1 truncate text-sm font-black text-slate-900 group-hover:text-indigo-600">
          {title}
        </h4>

        {type === "BOSS" ? (
          <div className="mt-1.5 flex items-center gap-1.5">
            {[startSpoon, startSpoon + 1, lesson.orderIndex].map((num) => (
              <span
                key={num}
                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />S{num}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-0.5 truncate text-xs text-slate-500">
            Click to continue your current step
          </p>
        )}
      </div>

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-indigo-600 group-hover:text-white">
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

function UpNextCompactTile({
  type,
  lesson,
}: {
  type: "SPOON" | "BRIDGE" | "BOSS";
  lesson: Lesson;
}) {
  const title =
    type === "SPOON"
      ? lesson.title
      : type === "BRIDGE"
        ? `Review: ${lesson.title}`
        : `Milestone ${Math.ceil(lesson.orderIndex / 3)} Boss`;

  const badge =
    type === "SPOON"
      ? `Spoon ${lesson.orderIndex}`
      : type === "BRIDGE"
        ? `Vocab Bridge ${lesson.orderIndex}`
        : `Boss Checkpoint`;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-200/40 p-3.5">
      {/* Muted Thumbnail */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-200">
        {lesson.imageUrl ? (
          <img
            src={lesson.imageUrl}
            alt={lesson.imageAlt ?? ""}
            className="h-full w-full object-cover opacity-60 saturate-[0.2]"
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/35">
          <Lock className="h-5 w-5 text-white/90" />
        </div>
      </div>

      {/* Locked Metadata */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-200/90 px-2 py-0.5 text-[10px] font-extrabold text-slate-600 uppercase">
            Up Next • {badge}
          </span>
        </div>
        <h4 className="mt-1 truncate text-sm font-bold text-slate-600">
          {title}
        </h4>
        <p className="mt-0.5 truncate text-xs text-slate-400">
          Unlocks after current step
        </p>
      </div>
    </div>
  );
}