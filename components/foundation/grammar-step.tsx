"use client";

import { useSpeak } from "@/hooks/use-speak";
import React from "react";


export function GrammarStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { speak, isLoading } = useSpeak();
  const targetLang = "fr-FR"; 

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Step 2: Sentence Breakdown</h2>
      
      {/* Target Sentence Display */}
      <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-100 relative group cursor-pointer" 
           onClick={() => speak(data.targetSentence, targetLang)}>
        <p className="text-sm text-blue-500 font-bold mb-1 uppercase tracking-wider">Click to hear sentence 🔊</p>
        <p className="text-2xl font-bold text-blue-900 mb-1">{data.targetSentence}</p>
        <p className="text-gray-600">{data.nativeSentence}</p>
      </div>
      
      {/* Word-by-Word Breakdown */}
      <div className="flex flex-col gap-2">
        {data.words.map((wordObj: any, idx: number) => (
          <button 
            key={idx} 
            onClick={() => speak(wordObj.word, targetLang)}
            disabled={isLoading}
            className="flex flex-col sm:flex-row sm:justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded border transition-colors text-left"
          >
            <div>
              <span className="font-bold text-lg text-gray-900">{wordObj.word}</span>
              <span className="ml-2 text-gray-700">- {wordObj.gloss}</span>
            </div>
            <span className="text-sm text-gray-500 sm:self-center bg-gray-200 px-2 py-1 rounded">
              {wordObj.role}
            </span>
          </button>
        ))}
      </div>

      <button 
        onClick={onNext} 
        className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded w-full sm:w-auto"
      >
        Next: Pronunciation
      </button>
    </div>
  );
}