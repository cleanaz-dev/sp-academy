"use client";

import React, { useState } from "react";
import { MOCK_FOUNDATION_DATA } from "@/lib/config/mock-foundation";

// Import the sub-components
import { VisualStep } from "./visual-step";
import { GrammarStep } from "./grammar-step";
import { PronunciationStep } from "./pronunciation-step";
import { ListeningStep } from "./listening-step";
import { QuizStep } from "./quiz-step";

export function FoundationWrapper() {
  const [step, setStep] = useState(0);
  const data = MOCK_FOUNDATION_DATA;

  const renderStep = () => {
    switch (step) {
      case 0:
        return <VisualStep data={data.visualContent} onNext={() => setStep(1)} />;
      case 1:
        return <GrammarStep data={data.grammarContent} onNext={() => setStep(2)} />;
      case 2:
        return <PronunciationStep data={data.pronunciationData} onNext={() => setStep(3)} />;
      case 3:
        return <ListeningStep data={data.listeningContent} onNext={() => setStep(4)} />;
      case 4:
        return <QuizStep data={data.quizContent} onNext={() => setStep(5)} />;
      case 5:
        return (
          <div className="p-4 border rounded-lg bg-purple-50 shadow-sm border-purple-200">
            <h2 className="text-xl font-bold mb-4 text-purple-900">Step 6: Freestyle Mode</h2>
            <p className="mb-2"><strong>Target Scenario:</strong> {data.freestyle.topic}</p>
            <p className="mb-4"><strong>Required Chunks:</strong> {data.freestyle.requiredChunks.join(", ")}</p>
            
            <div className="p-8 border-2 border-dashed border-purple-300 rounded bg-white text-center text-purple-500 mb-4">
              [Freestyle Chat Component Mounts Here]
            </div>

            <button 
              onClick={() => alert("Lesson Complete! Returning to Dashboard...")} 
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded w-full sm:w-auto"
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
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Header Info */}
      <div className="mb-4 flex flex-wrap gap-4 justify-between items-center text-sm text-gray-500">
        <span><strong>Course:</strong> {data.foundationCourseId}</span>
        <span><strong>Day:</strong> {data.orderIndex}</span>
        <span><strong>Progress:</strong> Step {step + 1} of 6</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2 mb-8 rounded-full overflow-hidden">
        <div 
          className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${((step + 1) / 6) * 100}%` }}
        />
      </div>

      {/* Main Content Area */}
      {renderStep()}
    </div>
  );
}