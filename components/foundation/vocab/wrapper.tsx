"use client";

import React, { useState } from "react";
import { Check, Video, BookOpen, BrainCircuit, Mic, Award } from "lucide-react";
import { MOCK_BRIDGE_DATA } from "@/lib/config/mock-vocab"; 

import { BridgeSceneStep } from "./bridge-scene-step";
import { VocabMomentStep } from "./vocab-moment-step";
import { CooldownStep } from "./cooldown-step";
import { BridgePronunciationStep } from "./bridge-pronunciation-step";
import { BridgeOutroStep } from "./bridge-outro-step";

const BRIDGE_STEPS = [
  { id: 0, title: "Scene Context", icon: Video },
  { id: 1, title: "New Vocabulary", icon: BookOpen },
  { id: 2, title: "Cooldown Drills", icon: BrainCircuit },
  { id: 3, title: "Pronunciation Check", icon: Mic },
  { id: 4, title: "Bridge Complete", icon: Award },
];

export function VocabBridgeWrapper() {
  const [step, setStep] = useState(0); 
  const data = MOCK_BRIDGE_DATA;

  const renderStep = () => {
    switch (step) {
      case 0: return <BridgeSceneStep data={data.bridgeScene} onNext={() => setStep(1)} />;
      case 1: return <VocabMomentStep data={data.vocabMoment} onNext={() => setStep(2)} />;
      case 2: return <CooldownStep data={data.cooldown} onNext={() => setStep(3)} />;
      case 3: return <BridgePronunciationStep data={data.pronunciationCheck} onNext={() => setStep(4)} />;
      case 4: return <BridgeOutroStep data={data} onFinish={() => alert("Bridge Complete! Back to Dashboard")} />;
      default: return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen flex flex-col md:flex-row gap-6 md:gap-8">
      {/* LEFT SIDEBAR: STEPPER CARD */}
      <div className="w-full md:w-72 lg:w-80 shrink-0 bg-white rounded-4xl shadow-xs border border-gray-100 p-6 md:p-8 h-fit">
        <div className="mb-10">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">
            Vocab Bridge • Index {data.meta.bridgeIndex}
          </p>
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
            Cooldown & Review
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gray-100 rounded-full" />
          <div className="flex flex-col gap-6 relative z-10">
            {BRIDGE_STEPS.map((s, index) => {
              const isCompleted = step > index;
              const isActive = step === index;
              const Icon = s.icon;

              return (
                <div key={s.id} className={`flex items-center gap-4 transition-all duration-300 ${isActive ? "opacity-100" : "opacity-50 hover:opacity-75"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-white
                    ${isCompleted ? "border-green-500 text-green-500" : 
                      isActive ? "border-indigo-600 text-indigo-600 shadow-xs ring-4 ring-indigo-50" : 
                      "border-gray-200 text-gray-400"}
                  `}>
                    {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
                  </div>
                  <div className={`font-semibold text-sm ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                    {s.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: MAIN CONTENT "CARD" */}
      <div className="flex-1 bg-white rounded-4xl shadow-xs border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
        {renderStep()}
      </div>
    </div>
  );
}"use client";

import React, { useState } from "react";
import { Check, Video, BookOpen, BrainCircuit, Mic, Award } from "lucide-react";
import { MOCK_BRIDGE_DATA } from "@/lib/config/mock-bridge"; // Adjust path to where you saved the mock

import { BridgeSceneStep } from "./bridge-scene-step";
import { VocabMomentStep } from "./vocab-moment-step";
import { CooldownStep } from "./cooldown-step";
import { BridgePronunciationStep } from "./bridge-pronunciation-step";
import { BridgeOutroStep } from "./bridge-outro-step";

const BRIDGE_STEPS = [
  { id: 0, title: "Scene Context", icon: Video },
  { id: 1, title: "New Vocabulary", icon: BookOpen },
  { id: 2, title: "Cooldown Drills", icon: BrainCircuit },
  { id: 3, title: "Pronunciation Check", icon: Mic },
  { id: 4, title: "Bridge Complete", icon: Award },
];

export function VocabBridgeWrapper() {
  const [step, setStep] = useState(0); 
  const data = MOCK_BRIDGE_DATA;

  const renderStep = () => {
    switch (step) {
      case 0: return <BridgeSceneStep data={data.bridgeScene} onNext={() => setStep(1)} />;
      case 1: return <VocabMomentStep data={data.vocabMoment} onNext={() => setStep(2)} />;
      case 2: return <CooldownStep data={data.cooldown} onNext={() => setStep(3)} />;
      case 3: return <BridgePronunciationStep data={data.pronunciationCheck} onNext={() => setStep(4)} />;
      case 4: return <BridgeOutroStep data={data} onFinish={() => alert("Bridge Complete! Back to Dashboard")} />;
      default: return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen flex flex-col md:flex-row gap-6 md:gap-8">
      {/* LEFT SIDEBAR: STEPPER CARD */}
      <div className="w-full md:w-72 lg:w-80 shrink-0 bg-white rounded-4xl shadow-xs border border-gray-100 p-6 md:p-8 h-fit">
        <div className="mb-10">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">
            Vocab Bridge • Index {data.meta.bridgeIndex}
          </p>
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
            Cooldown & Review
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gray-100 rounded-full" />
          <div className="flex flex-col gap-6 relative z-10">
            {BRIDGE_STEPS.map((s, index) => {
              const isCompleted = step > index;
              const isActive = step === index;
              const Icon = s.icon;

              return (
                <div key={s.id} className={`flex items-center gap-4 transition-all duration-300 ${isActive ? "opacity-100" : "opacity-50 hover:opacity-75"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-white
                    ${isCompleted ? "border-green-500 text-green-500" : 
                      isActive ? "border-indigo-600 text-indigo-600 shadow-xs ring-4 ring-indigo-50" : 
                      "border-gray-200 text-gray-400"}
                  `}>
                    {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
                  </div>
                  <div className={`font-semibold text-sm ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                    {s.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: MAIN CONTENT "CARD" */}
      <div className="flex-1 bg-white rounded-4xl shadow-xs border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
        {renderStep()}
      </div>
    </div>
  );
}