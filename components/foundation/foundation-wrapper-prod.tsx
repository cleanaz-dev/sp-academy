"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Flag,
  Image as ImageIcon,
  BookOpen,
  Mic,
  Headphones,
  PenTool,
  Target,
  Award,
  Loader2,
} from "lucide-react";


import { IntroStep } from "./intro-step";
import { VisualStep } from "./visual-step";
import { GrammarStep } from "./grammar-step";
import { PronunciationStep } from "./pronunciation-step";
import { ListeningStep } from "./listening-step";
import { QuizStep } from "./quiz-step";
import { FreestyleStep } from "./freestyle-step";
import { OutroStep } from "./outro-step";

import { WordAudioProvider } from "@/context/word-audio-context";
import { MatrixProvider, useMatrix } from "@/context/matrix-context";
import { invokeEduBuilder } from "@/app/actions/invoke-edu-builder";
import { completeLesson } from "@/app/actions/complete-lesson";
import type { UserFoundation } from "@/app/(dashboard)/foundation/actions/get-foundation-user";

// 8 Production Steps (Language Setup removed)
const STEPS_CONFIG = [
  { id: 1, title: "Mission Briefing", icon: Flag },
  { id: 2, title: "Scene Context", icon: ImageIcon },
  { id: 3, title: "Grammar & Meaning", icon: BookOpen },
  { id: 4, title: "Pronunciation Lab", icon: Mic },
  { id: 5, title: "Listening Focus", icon: Headphones },
  { id: 6, title: "Knowledge Check", icon: PenTool },
  { id: 7, title: "Final Mission", icon: Target },
  { id: 8, title: "Mission Debrief", icon: Award },
];

interface FoundationContentProps {
  foundation: NonNullable<UserFoundation>;
}

function FoundationContent({ foundation }: FoundationContentProps) {
  // Start directly at Step 1: Mission Briefing
  const [step, setStep] = useState(1);

  const { syncCart } = useMatrix();
  const router = useRouter();

  // Extract core properties from real DB record
  const userId = foundation.userId;
  const courseId = foundation.foundationCourseId;
  const currentSpoon = foundation.orderIndex;
  const nextLessonNumber = currentSpoon + 1;

  const targetLang = foundation.course.targetLanguage || "fr-FR";
  const nativeLang = foundation.course.nativeLanguage || "en-US";

  const lessonHandoff = (foundation.lessonHandoff as any) || {};
  const wordAudio =
    lessonHandoff?.wordAudio ||
    (foundation.foundationBridge as any)?.wordAudio ||
    {};

  // Profile data payload for queuing the subsequent Spoon
  const profileData = {
    userId,
    firstName: "Learner",
    gender: "unspecified",
    nativeLanguage: nativeLang,
    targetLanguage: targetLang,
    levelBand: "beginner",
    goal: "general",
    scriptComfort: "latin",
    type: "lang",
    spoon: nextLessonNumber,
    isOnboarding: false,
  };

  // Sync matrix cart to DB before changing steps
  const handleNext = (nextStepIndex: number) => {
    syncCart(userId, targetLang);
    setStep(nextStepIndex);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <IntroStep data={foundation as any} onNext={() => handleNext(2)} />;
      case 2:
        return (
          <VisualStep
            data={foundation.visualContent as any}
            onNext={() => handleNext(3)}
          />
        );
      case 3:
        return (
          <GrammarStep
            data={foundation.grammarContent as any}
            onNext={() => handleNext(4)}
          />
        );
      case 4:
        return (
          <PronunciationStep
            data={foundation.pronunciationData as any}
            onNext={() => handleNext(5)}
          />
        );
      case 5:
        return (
          <ListeningStep
            data={foundation.listeningContent as any}
            onNext={() => handleNext(6)}
          />
        );
      case 6:
        return (
          <QuizStep
            data={foundation.quizContent as any}
            targetLang={targetLang}
            onNext={() => handleNext(7)}
          />
        );
      case 7:
        return (
          <FreestyleStep
            data={foundation as any}
            onNext={() => handleNext(8)}
          />
        );
      case 8:
        return (
          <OutroStep
            data={foundation as any}
            targetLang={targetLang}
            userId={userId}
            onFinish={async (feedback) => {
              await syncCart(userId, targetLang);

              // 1. Mark current Spoon completed
              await completeLesson({
                courseId,
                orderIndex: currentSpoon,
                feedback,
              });

              // 2. Trigger asynchronous background builder for the next Spoon
              const res = await invokeEduBuilder({
                ...profileData,
                foundationCourseId: courseId,
                previous_lessons: [{ ...lessonHandoff, feedback }],
              });

              if (!res.ok) {
                console.error("Failed to queue next spoon:", res.error);
              }

              // 3. Return user to the hub
              router.push("/home");
              router.refresh();
            }}
          />
        );
      default:
        return <div className="p-8 text-center text-slate-500">Unknown Step</div>;
    }
  };

  return (
    <WordAudioProvider wordAudio={wordAudio} targetLang={targetLang}>
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-4 md:flex-row md:gap-8 md:p-8">
        {/* LEFT SIDEBAR: STEPPER TRACKER */}
        <div className="h-fit w-full shrink-0 rounded-4xl border border-gray-100 bg-white p-6 shadow-xs md:w-72 md:p-8 lg:w-80">
          <div className="mb-10">
            <p className="mb-2 text-xs font-bold tracking-widest text-blue-600 uppercase">
              Course • Spoon {currentSpoon}
            </p>
            <h2 className="text-2xl font-extrabold leading-tight text-gray-900">
              {lessonHandoff?.theme || foundation.title || "Core Lesson"}
            </h2>
          </div>

          <div className="relative">
            <div className="absolute top-4 bottom-4 left-[19px] w-[2px] rounded-full bg-gray-100" />

            <div className="relative z-10 flex flex-col gap-6">
              {STEPS_CONFIG.map((s) => {
                const isCompleted = step > s.id;
                const isActive = step === s.id;
                const Icon = s.icon;

                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-4 transition-all duration-300"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition-colors duration-300 ${
                        isCompleted
                          ? "border-green-500 text-green-500"
                          : isActive
                            ? "border-blue-600 text-blue-600 shadow-xs ring-4 ring-blue-50"
                            : "border-gray-300 text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={18} strokeWidth={3} />
                      ) : (
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      )}
                    </div>

                    <div
                      className={`text-sm transition-colors duration-300 ${
                        isActive
                          ? "font-bold text-gray-900"
                          : isCompleted
                            ? "font-semibold text-gray-700"
                            : "font-semibold text-gray-600"
                      }`}
                    >
                      {s.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: INTERACTIVE CONTENT CARD */}
        <div className="flex min-h-[600px] flex-1 flex-col overflow-hidden rounded-4xl bg-white shadow-xs">
          {renderStep()}
        </div>
      </div>
    </WordAudioProvider>
  );
}

// Main Wrapper receiving real data from Page Server Component
export function FoundationWrapperProd({
  foundation,
}: {
  foundation: UserFoundation | null;
}) {
  if (!foundation) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Lesson not found</h2>
        <p className="text-sm text-slate-500">
          This lesson might not exist or doesn't belong to your account.
        </p>
      </div>
    );
  }

  // Handle lesson still generating in the background
  if (foundation.status === "BUILDING") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-800">
          Spoon {foundation.orderIndex} is still baking...
        </h2>
        <p className="max-w-md text-sm text-slate-500">
          Our language engine is assembling your exercises and audio cues. This
          usually takes a minute or two.
        </p>
      </div>
    );
  }

  return (
    <MatrixProvider>
      <FoundationContent foundation={foundation} />
    </MatrixProvider>
  );
}