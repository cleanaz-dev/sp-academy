"use client";

import { useSpeak } from "@/hooks/use-speak";
import React, { useState } from "react";
import { Volume2, Loader2, ArrowRight } from "lucide-react";

export function GrammarStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { speak, isLoading } = useSpeak();
  const targetLang = "fr-FR"; 
  
  // Track which word is currently being spoken for a targeted loading state
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  const handleSpeak = async (text: string, index: number | null = null) => {
    setActiveWordIndex(index);
    await speak(text, targetLang);
    setActiveWordIndex(null);
  };

  return (
    <div className="flex flex-col h-full p-8 md:p-12 animate-in fade-in duration-500 overflow-y-auto">
      
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Grammar & Meaning
        </h2>
        <p className="text-gray-500 text-lg">
          Break down the target sentence to understand its structure.
        </p>
      </div>
      
      {/* Target Sentence Display - Big, interactive card */}
      <button 
        onClick={() => handleSpeak(data.targetSentence, -1)}
        disabled={isLoading}
        className="group w-full mb-10 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 text-left transition-all hover:shadow-md hover:border-blue-300 relative overflow-hidden"
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
        <p className="text-lg text-blue-800/70 font-medium">
          {data.nativeSentence}
        </p>
      </button>
      
      {/* Word-by-Word Breakdown List */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Word-by-Word Breakdown
        </h3>
        
        {/* CHANGED HERE: Using Grid for 2-column layout on medium screens and up */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.words.map((wordObj: any, idx: number) => (
            <button 
              key={idx} 
              onClick={() => handleSpeak(wordObj.word, idx)}
              disabled={isLoading}
              className="group flex items-start gap-4 p-5 bg-white hover:bg-gray-50 rounded-2xl border border-gray-200 hover:border-blue-200 transition-all text-left shadow-sm hover:shadow"
            >
              {/* Play Icon Indicator */}
              <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 text-gray-400 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors mt-0.5">
                {isLoading && activeWordIndex === idx ? <Loader2 className="animate-spin" size={18} /> : <Volume2 size={18} />}
              </div>
              
              {/* Restructured for better vertical flow inside the half-width card */}
              <div className="flex flex-col w-full">
                <span className="font-bold text-xl text-gray-900 group-hover:text-blue-700 transition-colors">
                  {wordObj.word}
                </span>
                <span className="text-gray-500 font-medium mb-3">{wordObj.gloss}</span>
                
                {/* Role Pill moved below to ensure it fits safely */}
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wider w-fit">
                  {wordObj.role}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 flex justify-end">
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