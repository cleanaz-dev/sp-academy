"use client";

import React from "react";

export function GrammarStep({ data, onNext }: { data: any; onNext: () => void }) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Step 2: Sentence Breakdown</h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-2xl font-bold text-blue-900 mb-1">{data.targetSentence}</p>
        <p className="text-gray-600">{data.nativeSentence}</p>
      </div>
      
      <div className="flex flex-col gap-2">
        {data.words.map((wordObj: any, idx: number) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:justify-between p-3 bg-gray-50 rounded border">
            <div>
              <span className="font-bold text-lg">{wordObj.word}</span>
              <span className="ml-2 text-gray-700">- {wordObj.gloss}</span>
            </div>
            <span className="text-sm text-gray-500 sm:self-center">{wordObj.role}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={onNext} 
        className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
      >
        Next: Pronunciation
      </button>
    </div>
  );
}