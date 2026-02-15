// components/conversation/word-pronunciation-display.tsx
import React from "react";
import { cn } from "@/lib/utils";
import type { WordScore } from "./types";

interface Props {
  text: string;
  wordScores?: WordScore[];
}

export const WordPronunciationDisplay: React.FC<Props> = ({ text, wordScores }) => {
  if (!wordScores || wordScores.length === 0) {
    return <p className="font-medium">{text}</p>;
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 80) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    if (score >= 70) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <p className="font-medium leading-relaxed">
      {wordScores.map((wordData, idx) => {
        const scoreColor = getScoreColor(wordData.quality_score);
        
        return (
          <span
            key={idx}
            className={cn(
              "mx-0.5 inline-block rounded border px-1.5 py-0.5 transition-all hover:scale-105 cursor-help",
              scoreColor
            )}
            title={`Score: ${wordData.quality_score}/100${
              wordData.sound_most_like 
                ? `\nSounded like: ${wordData.sound_most_like}` 
                : ''
            }`}
          >
            {wordData.word}
          </span>
        );
      })}
    </p>
  );
};