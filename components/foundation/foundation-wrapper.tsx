"use client";

import React, { useState } from "react";
import { Check, Circle, Flag, Image as ImageIcon, BookOpen, Mic, Headphones, PenTool, Target } from "lucide-react";
import { MOCK_FOUNDATION_DATA } from "@/lib/config/mock-foundation";

import { IntroStep } from "./intro-step";
import { VisualStep } from "./visual-step";
import { GrammarStep } from "./grammar-step";
import { PronunciationStep } from "./pronunciation-step";
import { ListeningStep } from "./listening-step";
import { QuizStep } from "./quiz-step";
import { FreestyleStep } from "./freestyle-step";

const STEPS_CONFIG = [
  { id: 0, title: "Mission Briefing", icon: Flag },
  { id: 1, title: "Scene Context", icon: ImageIcon },
  { id: 2, title: "Grammar & Meaning", icon: BookOpen },
  { id: 3, title: "Pronunciation Lab", icon: Mic },
  { id: 4, title: "Listening Focus", icon: Headphones },
  { id: 5, title: "Knowledge Check", icon: PenTool },
  { id: 6, title: "Final Mission", icon: Target },
];

export function FoundationWrapper() {
  const [step, setStep] = useState(0); 
  const data = MOCK_FOUNDATION_DATA;

  const renderStep = () => {
    switch (step) {
      case 0: return <IntroStep data={data} onNext={() => setStep(1)} />;
      case 1: return <VisualStep data={data.visualContent} onNext={() => setStep(2)} />;
      case 2: return <GrammarStep data={data.grammarContent} onNext={() => setStep(3)} />;
      case 3: return <PronunciationStep data={data.pronunciationData} onNext={() => setStep(4)} />;
      case 4: return <ListeningStep data={data.listeningContent} onNext={() => setStep(5)} />;
      case 5: return <QuizStep data={data.quizContent} onNext={() => setStep(6)} />;
      case 6: return <FreestyleStep data={data} onFinish={() => alert("Lesson Complete!")} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen flex flex-col md:flex-row gap-6 md:gap-8">
      
      {/* LEFT SIDEBAR: STEPPER CARD */}
      {/* Added bg-white, padding, rounding, and h-fit so it looks like a matching left-hand card */}
      <div className="w-full md:w-72 lg:w-80 shrink-0 bg-white rounded-4xl shadow-xs border border-gray-100 p-6 md:p-8 h-fit">
        <div className="mb-10">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            Course • Day {data.orderIndex}
          </p>
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
            {data.lessonHandoff.theme}
          </h2>
        </div>

        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gray-100 rounded-full" />
          
          <div className="flex flex-col gap-6 relative z-10">
            {STEPS_CONFIG.map((s, index) => {
              const isCompleted = step > index;
              const isActive = step === index;
              const Icon = s.icon;

              return (
                <div key={s.id} className={`flex items-center gap-4 transition-all duration-300 ${isActive ? "opacity-100" : "opacity-50 hover:opacity-75"}`}>
                  {/* Step Icon / Status */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-white
                    ${isCompleted ? "border-green-500 text-green-500" : 
                      isActive ? "border-blue-600 text-blue-600 shadow-xs ring-4 ring-blue-50" : 
                      "border-gray-200 text-gray-400"}
                  `}>
                    {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
                  </div>
                  
                  {/* Step Title */}
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