"use client";

import { useState } from "react";
import { usePronunciation } from "@/context/pronunciation-context";

interface Props {
  phrases: string[];
  targetLanguage: string;
  onComplete: () => void;
}

export function FreestylePronunciationReview({ phrases, targetLanguage, onComplete }: Props) {
  const { isRecording, score, error, assessSpeech, reset } = usePronunciation();
  const [index, setIndex] = useState(0);

  if (!phrases.length) {
    return (
      <div className="text-center p-8 animate-in fade-in">
        <p className="mb-4 text-gray-600">No pronunciation practice available.</p>
        <button
          onClick={onComplete}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
        >
          Continue →
        </button>
      </div>
    );
  }

  const current = phrases[index];
  const isLast = index === phrases.length - 1;

  const handlePractice = async () => {
    reset();
    await assessSpeech(current, targetLanguage);
  };

  const handleContinue = () => {
    if (isLast) {
      onComplete();
    } else {
      setIndex((i) => i + 1);
      reset();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 text-center animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md uppercase">
          Pronunciation
        </span>
        <span className="text-sm font-bold text-gray-400">
          {index + 1} / {phrases.length}
        </span>
      </div>

      <div className="bg-blue-50 p-8 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-400 uppercase tracking-wide mb-2 font-bold">Say this phrase</p>
        <p className="text-2xl font-bold text-blue-900 leading-snug">"{current}"</p>
      </div>

      <button
        onClick={handlePractice}
        disabled={isRecording}
        className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto transition-all shadow-lg ${
          isRecording
            ? "bg-red-500 scale-110 ring-4 ring-red-200"
            : "bg-indigo-500 hover:scale-105 active:scale-95 hover:bg-indigo-600"
        }`}
      >
        {isRecording ? "🔴" : "🎙️"}
      </button>

      {isRecording && <p className="text-indigo-500 text-sm font-bold animate-pulse">Listening...</p>}
      {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded-lg">{error}</p>}

      {score && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-6xl font-black text-indigo-600">
            {score.pronunciationScore}
            <span className="text-2xl text-gray-300 font-bold">/100</span>
          </div>
          <p className="text-gray-700 font-bold text-lg">
            {score.pronunciationScore >= 80
              ? "🔥 Nailed it!"
              : score.pronunciationScore >= 60
              ? "👍 Good try!"
              : "💪 Keep practicing!"}
          </p>
          <button
            onClick={handleContinue}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-95"
          >
            {isLast ? "Complete Phase ✓" : "Next Phrase →"}
          </button>
        </div>
      )}
    </div>
  );
}