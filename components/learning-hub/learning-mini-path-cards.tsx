"use client";

import Link from "next/link";
import {
  Lock,
  ArrowRight,
  CheckCircle2,
  Swords,
  Zap,
  Headphones,
  Loader2,
} from "lucide-react";
import type { LearningPath } from "@/app/actions/get-learning-path";

type FocusState = LearningPath["currentFocus"];
type Lesson = LearningPath["lessons"][number];

const ACTIVE_THEMES = {
  SPOON: {
    containerReady:
      "border-indigo-200/80 bg-white/90 hover:border-indigo-300 hover:bg-white hover:shadow-md hover:shadow-indigo-900/5",
    containerBuilding: "cursor-wait border-indigo-100 bg-white/75",
    badge: "bg-indigo-100 text-indigo-700",
    statusReady: "text-indigo-600",
    statusBuilding: "text-indigo-500",
    titleHover: "group-hover:text-indigo-600",
    buttonHover: "group-hover:bg-indigo-600 group-hover:text-white",
    icon: "text-indigo-300",
  },
  BRIDGE: {
    containerReady:
      "border-amber-200/80 bg-white/90 hover:border-amber-400 hover:bg-white hover:shadow-md hover:shadow-amber-900/5",
    containerBuilding: "cursor-wait border-amber-100 bg-white/75",
    badge: "bg-amber-100 text-amber-800",
    statusReady: "text-amber-600",
    statusBuilding: "text-amber-500",
    titleHover: "group-hover:text-amber-600",
    buttonHover: "group-hover:bg-amber-500 group-hover:text-white",
    icon: "text-amber-300",
  },
  BOSS: {
    containerReady:
      "border-fuchsia-200/80 bg-white/90 hover:border-fuchsia-400 hover:bg-white hover:shadow-md hover:shadow-fuchsia-900/5",
    containerBuilding: "cursor-wait border-fuchsia-100 bg-white/75",
    badge: "bg-fuchsia-100 text-fuchsia-700",
    statusReady: "text-fuchsia-600",
    statusBuilding: "text-fuchsia-500",
    titleHover: "group-hover:text-fuchsia-600",
    buttonHover: "group-hover:bg-fuchsia-600 group-hover:text-white",
    icon: "text-fuchsia-300",
  },
} as const;

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

  const headerDotColor =
    currentFocus.type === "BOSS"
      ? "bg-fuchsia-500"
      : currentFocus.type === "BRIDGE"
        ? "bg-amber-500"
        : "bg-indigo-500";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${headerDotColor}`} />
          <h3 className="text-xs font-extrabold tracking-wider text-slate-500 uppercase">
            Current Unit Progression
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Complete current step to unlock next
        </span>
      </div>

      <section className="flex flex-col gap-3">
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
      </section>
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
  const bossStage = lesson.bossStage;
  const bossData = bossStage?.scenarioData?.boss;
  const theme = ACTIVE_THEMES[type];

  const isBuilding =
    (type === "SPOON" && !lesson.title && !lesson.imageUrl) ||
    (type === "BRIDGE" && !lesson.bridge) ||
    (type === "BOSS" && (!bossStage || bossStage.status === "BUILDING"));

  const href = isBuilding
    ? "#"
    : type === "BOSS" && bossStage
      ? resolveBossHref(bossStage.id, lesson.id)
      : type === "BRIDGE" && lesson.bridge
        ? `/foundation/vocab/${lesson.bridge.id}`
        : resolveLessonHref(lesson.id);

  const thumbUrl =
    type === "BOSS"
      ? bossStage?.avatarUrl || bossStage?.coverUrl || lesson.imageUrl
      : lesson.imageUrl;

  const badgeLabel =
    type === "BOSS"
      ? `Milestone ${bossStage?.milestoneIndex ?? Math.ceil(lesson.orderIndex / 3)}`
      : type === "BRIDGE"
        ? `Vocab Bridge ${lesson.orderIndex}`
        : `Spoon ${lesson.orderIndex}`;

  const title = isBuilding
    ? `Generating ${badgeLabel}...`
    : type === "BOSS"
      ? bossData?.name || "AI Boss Checkpoint"
      : lesson.title || `Spoon ${lesson.orderIndex}`;

  const startSpoon = Math.max(1, lesson.orderIndex - 2);

  return (
    <Link
      href={href}
      onClick={(e) => {
        if (isBuilding) e.preventDefault();
      }}
      className={`group relative flex overflow-hidden rounded-2xl border shadow-sm backdrop-blur-md transition-all ${
        isBuilding ? theme.containerBuilding : theme.containerReady
      }`}
    >
      <div className="relative w-32 shrink-0 bg-slate-900 sm:w-40">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {isBuilding ? (
              <Loader2 className={`h-6 w-6 animate-spin ${theme.icon}`} />
            ) : type === "BOSS" ? (
              <Swords className={`h-6 w-6 ${theme.icon}`} />
            ) : type === "BRIDGE" ? (
              <Zap className={`h-6 w-6 ${theme.icon}`} />
            ) : (
              <Headphones className={`h-6 w-6 ${theme.icon}`} />
            )}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-4 p-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${theme.badge}`}
            >
              {badgeLabel}
            </span>
            <span
              className={`text-xs font-bold ${
                isBuilding ? theme.statusBuilding : theme.statusReady
              }`}
            >
              • {isBuilding ? "Building..." : "Active Focus"}
            </span>
          </div>

          <h4
            className={`mt-1.5 truncate text-base font-black text-slate-900 transition-colors ${theme.titleHover}`}
          >
            {title}
          </h4>

          {type === "BOSS" ? (
            <div className="mt-1.5 flex items-center gap-2">
              {[startSpoon, startSpoon + 1, lesson.orderIndex].map((num) => (
                <span
                  key={num}
                  className="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-500"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  Spoon {num}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {isBuilding
                ? "Preparing audio & visual assets..."
                : "Continue active step"}
            </p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition ${theme.buttonHover}`}
        >
          {isBuilding ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowRight className="h-5 w-5" />
          )}
        </div>
      </div>
    </Link>
  );
}

const LOCKED_THEMES = {
  SPOON: "text-indigo-500/80",
  BRIDGE: "text-amber-600/80",
  BOSS: "text-fuchsia-500/80",
} as const;

function UpNextCompactTile({
  type,
  lesson,
}: {
  type: "SPOON" | "BRIDGE" | "BOSS";
  lesson: Lesson;
}) {
  const title =
    type === "SPOON"
      ? lesson.title || `Spoon ${lesson.orderIndex}`
      : type === "BRIDGE"
        ? lesson.title
          ? `Review: ${lesson.title}`
          : `Vocab Checkpoint ${lesson.orderIndex}`
        : lesson.bossStage?.scenarioData?.boss?.name ||
          `Milestone ${Math.ceil(lesson.orderIndex / 3)} Boss`;

  const badge =
    type === "SPOON"
      ? `Spoon ${lesson.orderIndex}`
      : type === "BRIDGE"
        ? `Vocab Bridge ${lesson.orderIndex}`
        : `Boss Checkpoint`;

  const thumbUrl =
    type === "BOSS"
      ? lesson.bossStage?.avatarUrl ||
        lesson.bossStage?.coverUrl ||
        lesson.imageUrl
      : lesson.imageUrl;

  return (
    <div className="flex overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200/45">
      <div className="relative w-24 shrink-0 bg-slate-200 sm:w-28">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={lesson.imageAlt ?? ""}
            className="absolute inset-0 h-full w-full object-cover opacity-60 saturate-[0.2]"
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/35">
          <Lock className="h-5 w-5 text-white/90" />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider ${LOCKED_THEMES[type]}`}
            >
              Locked • {badge}
            </span>
          </div>
          <h4 className="mt-0.5 truncate text-sm font-bold text-slate-600">
            {title}
          </h4>
          <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
            Unlocks automatically after current step
          </p>
        </div>
      </div>
    </div>
  );
}