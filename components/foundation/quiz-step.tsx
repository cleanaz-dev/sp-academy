"use client";

import React, { useState } from "react";

export function QuizStep({ data, onNext }: { data: any; onNext: () => void }) {
  const clozeItems = data.items.filter((item: any) => item.type === "cloze");
  
  // Track user inputs: { "cloze-1": "bonjour", "cloze-2": "enchanter" }
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Track feedback: { "cloze-1": { status: "correct" | "incorrect", message?: "..." } }
  const [results, setResults] = useState<Record<string, { status: string; message?: string }>>({});

  const handleInputChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    // Clear the error state as they type
    setResults(prev => {
      const newResults = { ...prev };
      delete newResults[id];
      return newResults;
    });
  };

  const checkAnswer = (clozeItem: any) => {
    const id = clozeItem.id;
    const userAnswer = (answers[id] || "").trim();
    
    // 1. Is it exactly in the acceptable answers?
    if (clozeItem.acceptableAnswers.includes(userAnswer)) {
      setResults(prev => ({ ...prev, [id]: { status: "correct" } }));
      return;
    }

    // 2. Check if there is specific feedback for their wrong answer
    const specificFeedback = clozeItem.wrongAnswerFeedback?.find(
      (fb: any) => fb.wrong.toLowerCase() === userAnswer.toLowerCase()
    );

    if (specificFeedback) {
      setResults(prev => ({ ...prev, [id]: { status: "incorrect", message: specificFeedback.feedback } }));
    } else {
      setResults(prev => ({ ...prev, [id]: { status: "incorrect", message: "Not quite right, try again." } }));
    }
  };

  // Check if all cloze items are correct to enable the Next button
  const isAllCorrect = clozeItems.every((item: any) => results[item.cloze.id]?.status === "correct");

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Step 5: Knowledge Check</h2>
      
      <div className="flex flex-col gap-6">
        {clozeItems.map((item: any, idx: number) => {
          const id = item.cloze.id;
          const result = results[id];
          const isCorrect = result?.status === "correct";

          return (
            <div key={id} className={`p-4 border rounded-md ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
              <p className="font-semibold text-gray-700 mb-2">Question {idx + 1}</p>
              <p className="text-lg mb-3">
                {/* Replace the ___ with a styled blank */}
                {item.cloze.hostSentence.replace("___", "______")}
              </p>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={answers[id] || ""}
                  onChange={(e) => handleInputChange(id, e.target.value)}
                  disabled={isCorrect}
                  placeholder="Type your answer..." 
                  className={`border p-2 rounded flex-1 outline-none ${
                    isCorrect ? 'bg-green-100 text-green-800 border-green-300' : 'focus:ring-2 focus:ring-blue-400'
                  }`}
                />
                {!isCorrect && (
                  <button 
                    onClick={() => checkAnswer(item.cloze)}
                    disabled={!answers[id]}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded disabled:opacity-50"
                  >
                    Check
                  </button>
                )}
              </div>

              {/* Show error/feedback message */}
              {result?.status === "incorrect" && (
                <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 border border-red-200 rounded">
                  ❌ {result.message}
                </p>
              )}
              {isCorrect && (
                <p className="mt-2 text-sm text-green-600 font-bold">✅ Correct!</p>
              )}
            </div>
          );
        })}
      </div>

      <button 
        onClick={onNext} 
        disabled={!isAllCorrect}
        className={`mt-6 px-6 py-2 font-semibold rounded w-full sm:w-auto ${
          isAllCorrect 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Next: Freestyle Roleplay
      </button>
    </div>
  );
}