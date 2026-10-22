"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { LearningPath } from "@/app/actions/get-learning-path";
import type { UserGenerationData } from "@/lib/upstash";
import { getSpriteNode } from "@/lib/sprites/get-sprite-node";
import { useSprite } from "@/context/sprite-context";
import { vocabWordCount } from "./utils";

import { DashboardHeader } from "./dashboard-header";
import { PrimaryHeroCard } from "./primary-hero-card";
import { GenerationCycleCard } from "./generation-cycle-card";
import { LearningPathMiniCards } from "./learning-mini-path-cards";
import { WordMatrixCard } from "./word-matrix-card";
import { AiTutorCard } from "./ai-tutor-card";

type Props = {
  path: LearningPath | null;
  lang: { nativeLanguage: string; targetLanguage: string | null | any };
  generationData?: UserGenerationData | null;
};

export default function FoundationHubPage({
  path,
  lang,
  generationData,
}: Props) {
  const router = useRouter();
  const { summonSprite, profile } = useSprite();
  const lastSummonedKeyRef = useRef<string | null>(null);

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

  // Poll while Lambda is generating
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(interval);
  }, [isGenerating, router]);

  // --- SPRITE TRIGGER LOGIC ---
  useEffect(() => {
    if (!profile?.sprite) return;

    // 1. Determine which orderIndex makes sense right now
    let orderIndex: number | null = null;
    let actionConfig: { label: string; href: string } | null = null;

    if (waitingOnSpoon && completedLessonsCount === 0) {
      orderIndex = 0; // Onboarding / baking first lesson
    } else if (!isGenerating && nextLesson) {
      orderIndex = completedLessonsCount === 0 ? 1 : 4; // First lesson ready vs Next lesson ready
      actionConfig = {
        label: "Start Lesson",
        href: getLessonHref(nextLesson.id),
      };
    } else if (!waitingOnVocab && vocabDue) {
      orderIndex = 2; // Vocab Bridge ready
      actionConfig = {
        label: "Unlock Bridge",
        href: getLessonHref(vocabDue.id),
      };
    } else if (!waitingOnBoss && bossDue) {
      orderIndex = 3; // Boss Stage ready
      actionConfig = {
        label: "Challenge Boss",
        href: getBossHref(bossDue.id),
      };
    }

    if (orderIndex === null) return;

    // 2. Build a unique key for this state + focus item so we don't spam on re-renders
    const focusItemId =
      nextLesson?.id ?? vocabDue?.id ?? bossDue?.id ?? "generating";
    const triggerKey = `sprite_seen_${orderIndex}_${focusItemId}`;

    if (
      lastSummonedKeyRef.current === triggerKey ||
      sessionStorage.getItem(triggerKey)
    ) {
      return;
    }

    let cancelled = false;

    async function triggerSprite(idx: number) {
      const node = await getSpriteNode(
        {
          slug: profile!.sprite.slug,
          nativeVoiceId: profile!.nativeVoiceId,
          targetVoiceId: profile!.targetVoiceId,
        },
        idx
      );

      if (cancelled || !node) return;

      lastSummonedKeyRef.current = triggerKey;
      sessionStorage.setItem(triggerKey, "1");

      summonSprite({
        id: node.nodeId,
        badge: node.header ?? undefined,
        text: node.nativeBody,
        audioUrl: node.nativeAudioUrl ?? node.targetAudioUrl,
        autoPlayAudio: true,
        duration: isGenerating ? 8000 : 10000,
        position: "bottom-right",
        action: actionConfig
          ? {
              label: node.action || actionConfig.label,
              onClick: () => router.push(actionConfig!.href),
              variant: "primary",
            }
          : undefined,
      });
    }

    triggerSprite(orderIndex);

    return () => {
      cancelled = true;
    };
  }, [
    profile,
    isGenerating,
    waitingOnSpoon,
    waitingOnVocab,
    waitingOnBoss,
    completedLessonsCount,
    nextLesson?.id,
    vocabDue?.id,
    bossDue?.id,
    courseId,
    router,
    summonSprite,
  ]);

  return (
    <div className="min-h-screen bg-slate-100/80 font-sans text-slate-900 selection:bg-indigo-100">
      <DashboardHeader
        name={user?.firstName || generationData?.firstName}
        lang={lang}
        completedCount={completedLessonsCount}
        streak={1}
      />

      <main className="relative z-20 mx-auto -mt-12 max-w-7xl px-6 pb-20 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* LEFT / MAIN COLUMN */}
          <div className="flex flex-col gap-7 lg:col-span-8">
            {waitingOnSpoon && generationData ? (
              <GenerationCycleCard data={generationData} />
            ) : (
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
            )}

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