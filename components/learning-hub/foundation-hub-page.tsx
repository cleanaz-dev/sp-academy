"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LearningPath } from "@/app/actions/get-learning-path";
import { vocabWordCount } from "./utils";

import { DashboardHeader } from "./dashboard-header";
import { PrimaryHeroCard } from "./primary-hero-card";
import { LearningPathMiniCards } from "./learning-mini-path-cards";
import { WordMatrixCard } from "./word-matrix-card";
import { AiTutorCard } from "./ai-tutor-card";

type Props = {
  path: LearningPath | null;
  lang: { nativeLanguage: string; targetLanguage: string | null | any };
};

export default function FoundationHubPage({ path, lang }: Props) {
  const router = useRouter();
  const lessons = path?.lessons ?? [];
  const courseId = path?.courseId ?? (path as any)?.id ?? "default";
  const user = path?.user;

  // --- ENGINE STATE ---
  const currentFocus = path?.currentFocus ?? null;
  const nextLocked = path?.nextLocked ?? null;

  const vocabDue =
    currentFocus?.type === "BRIDGE" ? currentFocus.data : undefined;
  const nextLesson =
    currentFocus?.type === "SPOON" ? currentFocus.data : undefined;
  const bossDue =
    currentFocus?.type === "BOSS" ? currentFocus.data : undefined;

  // A Spoon row is created immediately in DB, so if title & imageUrl are still empty, Lambda is still baking it
  const waitingOnSpoon =
    currentFocus?.type === "SPOON" &&
    !currentFocus.data.title &&
    !currentFocus.data.imageUrl;

  const waitingOnVocab =
    currentFocus?.type === "BRIDGE"
      ? !currentFocus.data.bridge
      : lessons.some((l) => l.completedAt && !l.bridge);

  const waitingOnBoss =
    currentFocus?.type === "BOSS" &&
    (!currentFocus.data.bossStage ||
      currentFocus.data.bossStage.status === "BUILDING");

  const isGenerating = waitingOnSpoon || waitingOnVocab || waitingOnBoss;

  const completedLessonsCount = lessons.filter((l) =>
    Boolean(l.completedAt)
  ).length;

  const totalWordsLearned = lessons.reduce((acc, l) => {
    return (
      acc +
      (l.completedAt && l.bridge ? vocabWordCount(l.bridge.vocabMoment) : 0)
    );
  }, 0);

  const recentBridgeWords = lessons
    .filter((l) => l.completedAt && l.bridge?.vocabMoment)
    .flatMap(
      (l) =>
        (l.bridge?.vocabMoment as Array<{ word: string; gloss?: string }>) ?? []
    )
    .reverse();

  const getLessonHref = (lessonId: string) =>
    `/foundation/${lessonId}/${courseId}`;

  const getBossHref = (bossId: string) => `/foundation/boss/${bossId}`;

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(interval);
  }, [isGenerating, router]);

  return (
    <div className="min-h-screen bg-slate-100/80 font-sans text-slate-900 selection:bg-indigo-100">
      <DashboardHeader
        name={user?.firstName}
        lang={lang}
        completedCount={completedLessonsCount}
        streak={1}
      />

      <main className="relative z-20 mx-auto -mt-12 max-w-7xl px-6 pb-20 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* LEFT / MAIN COLUMN */}
          <div className="flex flex-col gap-7 lg:col-span-8">
            <PrimaryHeroCard
              path={path}
              vocabDue={vocabDue}
              nextLesson={nextLesson}
              bossDue={bossDue}
              waitingOnSpoon={waitingOnSpoon}
              waitingOnVocab={waitingOnVocab}
              waitingOnBoss={waitingOnBoss}
              getLessonHref={getLessonHref}
              getBossHref={getBossHref}
            />

            <LearningPathMiniCards
              courseId={courseId}
              currentFocus={currentFocus}
              nextLocked={nextLocked}
              getLessonHref={getLessonHref}
              getBossHref={getBossHref}
            />
          </div>

          {/* RIGHT PANEL */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <WordMatrixCard
              totalWordsLearned={totalWordsLearned}
              matrixStats={path?.matrixStats}
              fallbackWords={recentBridgeWords}
              isLocked={completedLessonsCount === 0}
            />
          </div>
        </div>

        {/* BOTTOM SANDBOX BAR */}
        <AiTutorCard />
      </main>
    </div>
  );
}