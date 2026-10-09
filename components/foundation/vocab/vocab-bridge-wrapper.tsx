"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Video, BookOpen, BrainCircuit, Mic, Award, Loader2 } from "lucide-react";
import type { UserVocabBridge } from "@/app/actions/get-vocab-bridge";
import { completeVocabBridge } from "@/app/actions/complete-vocab-bridge"; // 👈 Import action

import { BridgeSceneStep } from "./bridge-scene-step";
import { VocabMomentStep } from "./vocab-moment-step";
import { CooldownStep } from "./cooldown-step";
import { BridgePronunciationStep } from "./bridge-pronunciation-step";
import { BridgeOutroStep } from "./bridge-outro-step";

const BRIDGE_STEPS = [
  { id: 1, title: "Scene Context", icon: Video },
  { id: 2, title: "New Vocabulary", icon: BookOpen },
  { id: 3, title: "Cooldown Drills", icon: BrainCircuit },
  { id: 4, title: "Pronunciation Check", icon: Mic },
  { id: 5, title: "Bridge Complete", icon: Award },
];

interface VocabBridgeWrapperProps {
  bridge: UserVocabBridge | null;
}

export function VocabBridgeWrapper({ bridge }: VocabBridgeWrapperProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);

  if (!bridge) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Vocab Bridge not found</h2>
        <p className="mt-1 text-sm text-slate-500">
          This bridge may not exist or does not belong to your account.
        </p>
      </div>
    );
  }

  const handleFinishBridge = async (stats?: any) => {
    if (isFinishing) return;
    setIsFinishing(true);

    try {
      // 1. Mark the bridge as passed in Prisma
      const res = await completeVocabBridge({
        bridgeId: bridge.id,
        score: typeof stats?.score === "number" ? stats.score : 1.0,
        results: stats?.results || stats || null,
      });

      if (!res.ok) {
        throw new Error(res.error);
      }

      // 2. Return to hub — Next Spoon will now be unlocked!
      router.push("/home");
      router.refresh();
    } catch (err) {
      console.error("Error finishing vocab bridge:", err);
      setIsFinishing(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <BridgeSceneStep
            data={bridge.bridgeScene as any}
            onNext={() => setStep(2)}
          />
        );
      case 2:
        return (
          <VocabMomentStep
            data={bridge.vocabMoment as any}
            onNext={() => setStep(3)}
          />
        );
      case 3:
        return (
          <CooldownStep
            data={bridge.cooldown as any}
            onNext={() => setStep(4)}
          />
        );
      case 4:
        return (
          <BridgePronunciationStep
            data={bridge.pronunciationCheck as any}
            onNext={() => setStep(5)}
          />
        );
      case 5:
        return (
          <BridgeOutroStep
            data={bridge as any}
            onFinish={handleFinishBridge}
          />
        );
      default:
        return <div className="p-8 text-center text-slate-500">Unknown Step</div>;
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-4 md:flex-row md:gap-8 md:p-8">
      {/* LEFT SIDEBAR: STEPPER CARD */}
      <div className="h-fit w-full shrink-0 rounded-4xl border border-gray-100 bg-white p-6 shadow-xs md:w-72 md:p-8 lg:w-80">
        <div className="mb-10">
          <p className="mb-2 text-xs font-bold tracking-widest text-indigo-600 uppercase">
            Vocab Bridge • Spoon {bridge.bridgeIndex || bridge.lesson?.orderIndex || 1}
          </p>
          <h2 className="text-2xl font-extrabold leading-tight text-gray-900">
            Cooldown & Review
          </h2>
        </div>

        <div className="relative">
          <div className="absolute top-4 bottom-4 left-[19px] w-[2px] rounded-full bg-gray-100" />
          <div className="relative z-10 flex flex-col gap-6">
            {BRIDGE_STEPS.map((s) => {
              const isCompleted = step > s.id;
              const isActive = step === s.id;
              const Icon = s.icon;

              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 transition-all duration-300 ${
                    isActive ? "opacity-100" : "opacity-50 hover:opacity-75"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition-colors duration-300 ${
                      isCompleted
                        ? "border-green-500 text-green-500"
                        : isActive
                        ? "border-indigo-600 text-indigo-600 shadow-xs ring-4 ring-indigo-50"
                        : "border-gray-200 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={18} strokeWidth={3} />
                    ) : (
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    )}
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      isActive ? "text-gray-900" : "text-gray-500"
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

      {/* RIGHT SIDE: MAIN CONTENT CARD */}
      <div className="relative flex min-h-[600px] flex-1 flex-col overflow-hidden rounded-4xl border border-gray-100 bg-white shadow-xs">
        {isFinishing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-3 text-sm font-bold text-slate-700">
              Saving progress & unlocking next Spoon...
            </p>
          </div>
        )}
        {renderStep()}
      </div>
    </div>
  );
}