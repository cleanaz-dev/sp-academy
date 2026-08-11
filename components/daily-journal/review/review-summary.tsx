"use client";

import { Activity } from "lucide-react";

interface ReviewSummaryProps {
  summaryFeedback: string;
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
}

export default function ReviewSummary({ summaryFeedback, overallScore, accuracyScore, fluencyScore }: ReviewSummaryProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start mb-6">
      <div className="flex-1 space-y-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" /> AI Feedback
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {summaryFeedback || "You did a great job! Review the suggestions below to sound more like a native speaker."}
        </p>
      </div>
      
      <div className="flex gap-3 shrink-0 flex-wrap sm:flex-nowrap">
        <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${getScoreColor(overallScore)} min-w-[80px] flex-1 sm:flex-none`}>
          <span className="text-2xl font-black">{overallScore}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Overall</span>
        </div>
        <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${getScoreColor(accuracyScore)} min-w-[80px] flex-1 sm:flex-none`}>
          <span className="text-2xl font-black">{accuracyScore}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Accuracy</span>
        </div>
        <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${getScoreColor(fluencyScore)} min-w-[80px] flex-1 sm:flex-none`}>
          <span className="text-2xl font-black">{fluencyScore}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Fluency</span>
        </div>
      </div>
    </div>
  );
}