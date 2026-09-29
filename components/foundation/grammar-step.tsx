"use client";

import { useSpeak } from "@/hooks/use-speak";
import React, { useState } from "react";
import { Volume2, Loader2, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

export function GrammarStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { speak, isLoading } = useSpeak();
  const targetLang = "fr-FR"; 
  
  // Track which word is currently being spoken
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  // Cloze state mapping id -> user input
  const [clozeInputs, setClozeInputs] = useState<Record<string, string>>({});
  const [clozeResults, setClozeResults] = useState<Record<string, { status: "correct" | "incorrect", feedback?: string }>>({});

  const handleSpeak = async (text: string, index: number | null = null) => {
    setActiveWordIndex(index);
    await speak(text, targetLang);
    setActiveWordIndex(null);
  };

  const handleClozeCheck = (item: any) => {
    const userVal = (clozeInputs[item.id] || "").trim().toLowerCase();
    const isCorrect = item.acceptableAnswers.some((ans: string) => ans.toLowerCase() === userVal);
    
    if (isCorrect) {
      setClozeResults(prev => ({ ...prev, [item.id]: { status: "correct" } }));
    } else {
      // Check for specific wrong answer feedback
      const specificFeedback = item.wrongAnswerFeedback?.find((fb: any) => fb.wrong.toLowerCase() === userVal);
      setClozeResults(prev => ({ 
        ...prev, 
        [item.id]: { 
          status: "incorrect", 
          feedback: specificFeedback?.feedback || "Not quite, try again!" 
        } 
      }));
    }
  };

  return (
    <div className="flex flex-col h-full p-8 animate-in fade-in duration-500 overflow-y-auto">
      
      <div className="mb-10 shrink-0">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
          Grammar & Meaning
        </h2>
        <p className="text-gray-500 text-lg">
          Break down the target sentence to understand its structure.
        </p>
      </div>
      
      {/* Target Sentence Display */}
      <button 
        onClick={() => handleSpeak(data.targetSentence, -1)}
        disabled={isLoading}
        className="group w-full mb-10 p-8 bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 text-left transition-all hover:shadow-md hover:border-blue-300 relative overflow-hidden shrink-0"
      >
        <div className="absolute top-8 right-8 text-blue-300 group-hover:text-blue-500 transition-colors">
          {isLoading && activeWordIndex === -1 ? <Loader2 className="animate-spin" size={28} /> : <Volume2 size={28} />}
        </div>
        <p className="text-xs font-bold text-blue-500 mb-3 uppercase tracking-widest flex items-center gap-2">
          Click to play sentence
        </p>
        <p className="text-3xl md:text-4xl font-bold text-blue-950 mb-3">
          {data.targetSentence}
        </p>
        <p className="text-lg text-blue-800/70 font-medium mb-6">
          {data.nativeSentence}
        </p>

        {/* Highlight Group rendering correctly accommodates multi-word chunks */}
        {data.highlightGroup && data.highlightGroup.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-blue-200/50">
            <span className="text-sm font-semibold text-blue-800 flex items-center mr-2">Key Chunks:</span>
            {data.highlightGroup.map((chunk: string, idx: number) => (
              <span key={idx} className="bg-white/80 text-blue-900 px-3 py-1 rounded-md text-sm font-bold shadow-sm border border-blue-100">
                {chunk}
              </span>
            ))}
          </div>
        )}
      </button>
      
      {/* Word-by-Word Breakdown List - COMPACT & SCROLLABLE */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Word-by-Word Breakdown
        </h3>
        
        {/* Scrollable Container added here */}
       <ScrollArea className="max-h-[200px]">
  <div className="grid grid-cols-1 gap-3 pr-3 pb-2 md:grid-cols-2">
    {data.words.map((wordObj: any, idx: number) => (
      <button
        key={idx}
        onClick={() => handleSpeak(wordObj.word, idx)}
        disabled={isLoading}
        className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 text-left shadow-xs transition-all hover:border-blue-200 hover:bg-blue-50/50"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
          {isLoading && activeWordIndex === idx ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Volume2 size={14} />
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="font-bold text-gray-900 transition-colors group-hover:text-blue-700">
              {wordObj.word}
            </span>
            <span className="text-sm text-gray-400">
              = {wordObj.gloss}
            </span>
          </div>

          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            {wordObj.role}
          </span>
        </div>
      </button>
    ))}
  </div>
</ScrollArea>
      </div>

      {/* QUICK PRACTICE (COMMENTED OUT FOR NOW) */}
      {/* 
      {data.clozeItems && data.clozeItems.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Quick Practice
          </h3>
          <div className="flex flex-col gap-4">
            {data.clozeItems.map((item: any) => {
              const res = clozeResults[item.id];
              const targetWord = item.acceptableAnswers[0];
              const parts = item.hostSentence.split(new RegExp(`(${targetWord})`, 'i'));

              return (
                <div key={item.id} className={`p-5 rounded-2xl border-2 transition-colors ${res?.status === 'correct' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                  <div className="flex flex-wrap items-center gap-2 text-lg font-medium text-gray-900 leading-loose">
                    {parts.map((part: string, i: number) => {
                      if (part.toLowerCase() === targetWord.toLowerCase()) {
                        return (
                          <input
                            key={i}
                            type="text"
                            value={clozeInputs[item.id] || ""}
                            onChange={(e) => setClozeInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                            disabled={res?.status === 'correct'}
                            className={`w-32 px-3 py-1 rounded-lg border-2 text-center focus:outline-hidden ${
                              res?.status === 'correct' ? 'border-green-400 bg-green-100 text-green-900' :
                              res?.status === 'incorrect' ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-500' :
                              'border-gray-300 focus:border-blue-500 bg-gray-50'
                            }`}
                            placeholder="type here"
                          />
                        );
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex-1">
                      {res?.status === 'incorrect' && (
                        <p className="text-sm font-medium text-red-600 flex items-center gap-2">
                          <XCircle size={16} /> {res.feedback}
                        </p>
                      )}
                      {res?.status === 'correct' && (
                        <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                          <CheckCircle2 size={16} /> Perfect!
                        </p>
                      )}
                    </div>
                    {res?.status !== 'correct' && (
                      <button
                        onClick={() => handleClozeCheck(item)}
                        className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-lg transition-transform active:scale-95"
                      >
                        Check
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )} 
      */}

      <div className="mt-auto pt-6 flex justify-end shrink-0">
        <button 
          onClick={onNext} 
          className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-lg shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          Next: Pronunciation Lab <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}