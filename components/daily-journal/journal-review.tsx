"use client";

import React from "react";

interface WordItem {
  word: string;
  accuracyScore: number;
  errorType: "None" | "Omission" | "Insertion" | "Mispronunciation";
}

interface ReviewData {
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  wordAnalysis: WordItem[];
  summaryFeedback?: string;
}

export default function JournalReview({ review }: { review: ReviewData }) {
  const getWordColor = (word: WordItem) => {
    if (word.errorType === "Mispronunciation" || word.errorType === "Omission") return "bg-red-100 text-red-700 border-red-300";
    if (word.accuracyScore >= 80) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (word.accuracyScore >= 60) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-red-100 text-red-700 border-red-300";
  };

  return (
    <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800">📊 Speech Analysis Review</h3>

      {/* Score Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ScoreCard label="Overall Score" score={review.overallScore} highlight />
        <ScoreCard label="Accuracy" score={review.accuracyScore} />
        <ScoreCard label="Fluency" score={review.fluencyScore} />
        <ScoreCard label="Completeness" score={review.completenessScore} />
      </div>

      {/* Word-by-Word Pronunciation Breakdown */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-gray-700">Pronunciation Breakdown:</h4>
        <div className="flex flex-wrap gap-2 rounded-xl bg-gray-50 p-4 border border-gray-200">
          {review.wordAnalysis.map((item, idx) => (
            <span
              key={idx}
              title={`Accuracy: ${item.accuracyScore}% (${item.errorType})`}
              className={`cursor-pointer rounded-md border px-2.5 py-1 text-sm font-medium transition hover:scale-105 ${getWordColor(item)}`}
            >
              {item.word}
            </span>
          ))}
        </div>
      </div>

      {/* AI Summary Feedback */}
      {review.summaryFeedback && (
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200 text-sm text-blue-900">
          💡 <strong>Tips for Improvement:</strong> {review.summaryFeedback}
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, score, highlight }: { label: string; score: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-4 text-center ${highlight ? "bg-emerald-500 text-white" : "bg-gray-50 text-gray-800 border border-gray-100"}`}>
      <p className={`text-xs ${highlight ? "text-emerald-100" : "text-gray-500"}`}>{label}</p>
      <p className="text-2xl font-black mt-1">{Math.round(score)}%</p>
    </div>
  );
}