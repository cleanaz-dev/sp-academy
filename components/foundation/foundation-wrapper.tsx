"use client";

import React, { useState } from "react";
import { MOCK_FOUNDATION_DATA } from "@/lib/config/mock-foundation";

// Import all sub-components
import { IntroStep } from "./intro-step";
import { VisualStep } from "./visual-step";
import { GrammarStep } from "./grammar-step";
import { PronunciationStep } from "./pronunciation-step";
import { ListeningStep } from "./listening-step";
import { QuizStep } from "./quiz-step";

export function FoundationWrapper() {
  // step 0 = Intro, 1 = Visual, 2 = Grammar, 3 = Pronunciation, 4 = Listening, 5 = Quiz, 6 = Freestyle
  const [step, setStep] = useState(0); 
  const data = MOCK_FOUNDATION_DATA;
  const TOTAL_STEPS = 7;

  const renderStep = () => {
    switch (step) {
      case 0:
        return <IntroStep data={data} onNext={() => setStep(1)} />;
      case 1:
        return <VisualStep data={data.visualContent} onNext={() => setStep(2)} />;
      case 2:
        return <GrammarStep data={data.grammarContent} onNext={() => setStep(3)} />;
      case 3:
        return <PronunciationStep data={data.pronunciationData} onNext={() => setStep(4)} />;
      case 4:
        return <ListeningStep data={data.listeningContent} onNext={() => setStep(5)} />;
      case 5:
        return <QuizStep data={data.quizContent} onNext={() => setStep(6)} />;
      case 6:
        return (
          <div className="p-8 border rounded-2xl bg-purple-50 shadow-sm border-purple-200 text-center">
            <h2 className="text-2xl font-bold mb-4 text-purple-900">Final Mission: Freestyle</h2>
            <p className="mb-2"><strong>Target Scenario:</strong> {data.freestyle.topic}</p>
            <p className="mb-6"><strong>Required Chunks:</strong> {data.freestyle.requiredChunks.join(", ")}</p>
            
            {/* When you are ready, your Freestyle component goes here */}
            <div className="p-12 border-2 border-dashed border-purple-300 rounded-xl bg-white text-purple-400 mb-8">
              [Freestyle Chat Component Mounts Here]
            </div>

            <button 
              onClick={() => alert("Lesson Complete! Returning to Dashboard...")} 
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl w-full sm:w-auto shadow-md"
            >
              Finish Lesson 🎉
            </button>
          </div>
        );
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Header Info (Only show if we are past the Intro step) */}
      {step > 0 && (
        <div className="mb-4 flex flex-wrap gap-4 justify-between items-center text-sm text-gray-500 font-medium">
          <span>Course: {data.foundationCourseId}</span>
          <span>Day {data.orderIndex}</span>
          <span>Step {step} of {TOTAL_STEPS - 1}</span>
        </div>
      )}
      
      {/* Progress Bar (Hidden on Intro Step for a cleaner look) */}
      {step > 0 && (
        <div className="w-full bg-gray-200 h-2 mb-8 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${(step / (TOTAL_STEPS - 1)) * 100}%` }}
          />
        </div>
      )}

      {/* Main Content Area */}
      {renderStep()}
    </div>
  );
}