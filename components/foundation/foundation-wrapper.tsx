"use client";

import React, { useState } from "react";
import { Check, Flag, Image as ImageIcon, BookOpen, Mic, Headphones, PenTool, Target, Award, Languages } from "lucide-react";

// Update these imports to match exactly how you named your two datasets!
import { MOCK_FOUNDATION_DATA_EN_FR, MOCK_FOUNDATION_DATA_EN_ES } from "@/lib/config/mock-foundation";

import { LangStep } from "./lang-step";
import { IntroStep } from "./intro-step";
import { VisualStep } from "./visual-step";
import { GrammarStep } from "./grammar-step";
import { PronunciationStep } from "./pronunciation-step";
import { ListeningStep } from "./listening-step";
import { QuizStep } from "./quiz-step";
import { FreestyleStep } from "./freestyle-step";
import { OutroStep } from "./outro-step";

const STEPS_CONFIG = [
  { id: 0, title: "Language Setup", icon: Languages }, // NEW LANG STEP
  { id: 1, title: "Mission Briefing", icon: Flag },
  { id: 2, title: "Scene Context", icon: ImageIcon },
  { id: 3, title: "Grammar & Meaning", icon: BookOpen },
  { id: 4, title: "Pronunciation Lab", icon: Mic },
  { id: 5, title: "Listening Focus", icon: Headphones },
  { id: 6, title: "Knowledge Check", icon: PenTool },
  { id: 7, title: "Final Mission", icon: Target },
  { id: 8, title: "Mission Debrief", icon: Award },
];

export function FoundationWrapper() {
  const [step, setStep] = useState(0); 
  
  // Default to French just so the sidebar has data to read on initial load.
  // We'll swap it dynamically when they click a card on Step 0.
  const [data, setData] = useState(MOCK_FOUNDATION_DATA_EN_FR);

  const handleLanguageSelect = (lang: "FR" | "ES") => {
    setData(lang === "FR" ? MOCK_FOUNDATION_DATA_EN_FR : MOCK_FOUNDATION_DATA_EN_ES);
    setStep(1); // Move to Intro Step
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <LangStep onSelect={handleLanguageSelect} />;
      case 1: return <IntroStep data={data} onNext={() => setStep(2)} />;
      case 2: return <VisualStep data={data.visualContent} onNext={() => setStep(3)} />;
      case 3: return <GrammarStep data={data.grammarContent} onNext={() => setStep(4)} />;
      case 4: return <PronunciationStep data={data.pronunciationData} onNext={() => setStep(5)} />;
      case 5: return <ListeningStep data={data.listeningContent} onNext={() => setStep(6)} />;
      case 6: return <QuizStep data={data.quizContent} targetLang={data.targetLang} onNext={() => setStep(7)} />; // CHANGED
      case 7: return <FreestyleStep data={data} onNext={() => setStep(8)} />;
      case 8: return <OutroStep data={data} onFinish={() => alert("Course Complete! Routing to Dashboard...")} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen flex flex-col md:flex-row gap-6 md:gap-8">
      
      {/* LEFT SIDEBAR: STEPPER CARD */}
      <div className="w-full md:w-72 lg:w-80 shrink-0 bg-white rounded-4xl shadow-xs border border-gray-100 p-6 md:p-8 h-fit">
        <div className="mb-10">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            Course • Day {data.orderIndex || 1}
          </p>
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
            {step === 0 ? "Prototype Setup" : data.lessonHandoff?.theme}
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