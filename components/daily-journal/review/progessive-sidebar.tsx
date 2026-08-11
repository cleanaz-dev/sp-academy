"use client";

import { Sparkles, CheckCircle2 } from "lucide-react";

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
}

export default function ProgressSidebar({ steps, currentStepIndex, setStep }: ProgressSidebarProps) {
  return (
    <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200 bg-white p-6 md:p-8 flex flex-col md:h-full shrink-0 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8 md:mb-12">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-gray-800 truncate">Review</h2>
          <p className="text-sm font-medium text-gray-500 truncate">Practice & Perfect</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 md:gap-8">
        {steps.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isPast = idx < currentStepIndex;
          const isComplete = step.isComplete;
          
          return (
            <div 
              key={step.id} 
              className={`relative flex gap-4 ${isActive ? "opacity-100" : isPast ? "opacity-70 cursor-pointer hover:opacity-100" : "opacity-40 pointer-events-none"}`}
              onClick={() => isPast && setStep(idx)}
            >
              {/* Vertical Line Connector */}
              {idx !== steps.length - 1 && (
                <div className={`absolute left-[19px] top-12 w-0.5 h-[calc(100%+8px)] hidden md:block ${isComplete ? "bg-emerald-400" : "bg-gray-200"}`} />
              )}
              
              {/* Step Indicator Circle */}
              <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors
                ${isComplete ? "border-emerald-500 text-emerald-500 bg-emerald-50" : isActive ? "border-indigo-600 text-indigo-600 bg-indigo-50" : "border-gray-300 text-gray-400"}
              `}>
                {isComplete ? <CheckCircle2 className="h-6 w-6" /> : <span className="text-base font-bold">{idx + 1}</span>}
              </div>
              
              {/* Step Text */}
              <div className="flex flex-col pb-2 md:pb-6 pt-1">
                <span className={`text-base font-bold ${isActive ? "text-indigo-950" : "text-gray-700"}`}>{step.title}</span>
                <span className="text-sm text-gray-500 mt-0.5">{step.description}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}