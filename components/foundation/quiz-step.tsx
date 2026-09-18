"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, PenTool, Check } from "lucide-react";

export function QuizStep({ data, onNext }: { data: any; onNext: () => void }) {
  const clozeItems = data.items.filter((item: any) => item.type === "cloze");
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, { status: string; message?: string }>>({});

  const handleInputChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    setResults(prev => {
      const newResults = { ...prev };
      delete newResults[id];
      return newResults;
    });
  };

  const checkAnswer = (clozeItem: any) => {
    const id = clozeItem.id;
    const userAnswer = (answers[id] || "").trim();
    
    if (clozeItem.acceptableAnswers.includes(userAnswer)) {
      setResults(prev => ({ ...prev, [id]: { status: "correct" } }));
      return;
    }

    const specificFeedback = clozeItem.wrongAnswerFeedback?.find(
      (fb: any) => fb.wrong.toLowerCase() === userAnswer.toLowerCase()
    );

    if (specificFeedback) {
      setResults(prev => ({ ...prev, [id]: { status: "incorrect", message: specificFeedback.feedback } }));
    } else {
      setResults(prev => ({ ...prev, [id]: { status: "incorrect", message: "Not quite right, try again." } }));
    }
  };

  const isAllCorrect = clozeItems.every((item: any) => results[item.cloze.id]?.status === "correct");

  return (
    <div className="flex flex-col h-full p-8 md:p-12 animate-in fade-in duration-500 overflow-y-auto">
      
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
          <PenTool size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Knowledge Check
        </h2>
        <p className="text-gray-500 text-lg">
          Complete the sentences to prove your mastery before the final mission.
        </p>
      </div>
      
      <div className="flex flex-col gap-6 mb-8">
        {clozeItems.map((item: any, idx: number) => {
          const id = item.cloze.id;
          const result = results[id];
          const isCorrect = result?.status === "correct";
          
          // Split the sentence to render a visual blank
          const sentenceParts = item.cloze.hostSentence.split("___");

          return (
            <div key={id} className={`p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 ${
              isCorrect 
                ? 'bg-green-50/50 border-green-400 shadow-sm' 
                : result?.status === "incorrect"
                ? 'bg-red-50/30 border-red-200'
                : 'bg-white border-gray-200 hover:border-blue-200 shadow-sm'
            }`}>
              
              <div className="flex items-center gap-3 mb-4">
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {isCorrect ? <Check size={14} strokeWidth={3} /> : idx + 1}
                </span>
                <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Fill in the blank</p>
              </div>

              {/* Formatted Sentence */}
              <p className="text-2xl font-medium text-gray-900 mb-6 leading-relaxed flex flex-wrap items-center gap-2">
                {sentenceParts[0]}
                <span className={`inline-block min-w-[80px] border-b-2 px-2 text-center transition-colors ${isCorrect ? 'border-green-500 text-green-700' : 'border-dashed border-gray-400 text-gray-400'}`}>
                  {isCorrect ? answers[id] : "?"}
                </span>
                {sentenceParts[1]}
              </p>
              
              {/* Input Area */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  value={answers[id] || ""}
                  onChange={(e) => handleInputChange(id, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && answers[id]) checkAnswer(item.cloze); }}
                  disabled={isCorrect}
                  placeholder="Type the missing word..." 
                  className={`flex-1 p-4 rounded-xl border-2 outline-none font-medium text-lg transition-all ${
                    isCorrect 
                      ? 'bg-green-100/50 border-transparent text-green-800' 
                      : 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10'
                  }`}
                />
                {!isCorrect && (
                  <button 
                    onClick={() => checkAnswer(item.cloze)}
                    disabled={!answers[id]}
                    className="px-8 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl disabled:opacity-30 disabled:hover:bg-gray-900 transition-all active:scale-95 whitespace-nowrap"
                  >
                    Check Answer
                  </button>
                )}
              </div>

              {/* Feedback messages */}
              {result?.status === "incorrect" && (
                <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                  <XCircle className="shrink-0 mt-0.5 text-red-600" size={20} />
                  <p className="font-medium">{result.message}</p>
                </div>
              )}
              
              {isCorrect && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                  <CheckCircle2 className="text-green-600" size={20} />
                  <p className="font-bold">Perfect!</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-6 flex justify-end border-t border-gray-100">
        <button 
          onClick={onNext} 
          disabled={!isAllCorrect}
          className={`w-full sm:w-auto px-8 py-4 font-bold rounded-xl text-lg transition-all flex items-center justify-center gap-2 ${
            isAllCorrect 
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 active:scale-95' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Enter Simulation <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}