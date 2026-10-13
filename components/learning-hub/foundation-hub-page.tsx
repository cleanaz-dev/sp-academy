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


  // --- NEW ENGINE STATE ---
  const currentFocus = path?.currentFocus ?? null;
  const nextLocked = path?.nextLocked ?? null;

  // Backwards compatibility for PrimaryHeroCard (so you don't have to rewrite it yet)
  const vocabDue = currentFocus?.type === "BRIDGE" ? currentFocus.data : undefined;
  const nextLesson = currentFocus?.type === "SPOON" ? currentFocus.data : undefined;

  // Keep your existing waiting/polling logic exactly as is!
  const waitingOnVocab = lessons.some((l) => l.completedAt && !l.bridge);
  const completedLessonsCount = lessons.filter((l) => !!l.completedAt).length;

  const totalWordsLearned = lessons.reduce((acc, l) => {
    return acc + (l.completedAt && l.bridge ? vocabWordCount(l.bridge.vocabMoment) : 0);
  }, 0);

  const getLessonHref = (lessonId: string) => `/foundation/${lessonId}/${courseId}`;

  // Polling for vocab bridge generation
  useEffect(() => {
    if (!waitingOnVocab) return;
    const interval = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(interval);
  }, [waitingOnVocab, router]);

  return (
    <div className="min-h-screen font-sans text-slate-900 selection:bg-indigo-100">
      <DashboardHeader
        name={user?.firstName}
        lang={lang}
        completedCount={completedLessonsCount}
        streak={1}
      />

      <main className="relative z-20 mx-auto -mt-12 max-w-7xl px-6 pb-24 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT / MAIN COLUMN */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            <PrimaryHeroCard
              path={path}
              vocabDue={vocabDue}
              nextLesson={nextLesson}
              waitingOnVocab={waitingOnVocab}
              getLessonHref={getLessonHref}
            />

            {/* PASS THE NEW STATE TO MINI CARDS */}
            <LearningPathMiniCards
              currentFocus={currentFocus}
              nextLocked={nextLocked}
            />
          </div>

          {/* RIGHT PANEL */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <WordMatrixCard totalWordsLearned={totalWordsLearned} />
            <AiTutorCard />
          </div>
        </div>
      </main>
    </div>
  );
}