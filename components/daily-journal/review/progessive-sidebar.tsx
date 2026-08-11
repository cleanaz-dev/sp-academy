"use client";

import { Sparkles, CheckCircle2, Info, ArrowRight } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
}

interface ProgressSidebarProps {
  steps: Step[];
  currentStepIndex: number;
  setStep: (idx: number) => void;
  onComplete: () => void;
  canFinish: boolean;
}

export default function ProgressSidebar({ 
  steps, 
  currentStepIndex, 
  setStep, 
  onComplete, 
  canFinish 
}: ProgressSidebarProps) {
  return (
    <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200 bg-white p-6 md:p-8 flex flex-col md:h-full shrink-0 overflow-y-auto">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-gray-800 truncate">Review</h2>
          <p className="text-sm font-medium text-gray-500 truncate">Practice & Perfect</p>
        </div>
      </div>

      {/* 🟢 Navigation Info Box */}
      <div className="mb-8 rounded-xl bg-indigo-50 border border-indigo-100 p-4 shadow-sm flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-900 leading-relaxed">
          Finish your current task, then <strong>click the next step</strong> below to advance.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-6 md:gap-8">
        {steps.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          // Step is clickable if it's the first step, or if the previous step is complete
          const isClickable = idx === 0 || steps[idx - 1]?.isComplete;
          const isComplete = step.isComplete;
          
          return (
            <div 
              key={step.id} 
              className={`relative flex gap-4 transition-all duration-200 ${
                isActive 
                  ? "opacity-100" 
                  : isClickable 
                    ? "opacity-70 cursor-pointer hover:opacity-100 hover:translate-x-1" 
                    : "opacity-40 pointer-events-none"
              }`}
              onClick={() => isClickable && setStep(idx)}
            >
              {/* Vertical Line Connector */}
              {idx !== steps.length - 1 && (
                <div className={`absolute left-[19px] top-12 w-0.5 h-[calc(100%+8px)] hidden md:block ${isComplete ? "bg-emerald-400" : "bg-gray-200"}`} />
              )}
              
              {/* Step Indicator Circle */}
              <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300
                ${isComplete ? "border-emerald-500 text-emerald-500 bg-emerald-50 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                : isActive ? "border-indigo-600 text-indigo-600 bg-indigo-50 shadow-[0_0_15px_rgba(79,70,229,0.2)]" 
                : "border-gray-300 text-gray-400 bg-white"}
              `}>
                {isComplete ? <CheckCircle2 className="h-6 w-6" /> : <span className="text-base font-bold">{idx + 1}</span>}
              </div>
              
              {/* Step Text */}
              <div className="flex flex-col pb-2 md:pb-6 pt-1">
                <span className={`text-base font-bold transition-colors ${isActive ? "text-indigo-950" : "text-gray-700"}`}>
                  {step.title}
                </span>
                <span className="text-sm text-gray-500 mt-0.5">{step.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🟢 Finish Button at bottom of sidebar */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <button 
          onClick={onComplete} 
          disabled={!canFinish}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold shadow-sm transition-all ${
            canFinish 
              ? "bg-gray-900 text-white hover:bg-black hover:-translate-y-1 shadow-md" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Finish Review <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}