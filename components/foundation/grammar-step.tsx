"use client";

import React from "react";
import { Volume2, Loader2, ArrowRight } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useSpeak } from "@/hooks/use-speak";
import { useWordAudio } from "@/context/word-audio-context";

export function GrammarStep({ data, onNext }: { data: any; onNext: () => void }) {
  // Main sentence TTS
  const { speak, isLoading: isSentenceLoading } = useSpeak();

  // Word-level native audio from context
  const { playWord, activeWord, isPlaying: isWordPlaying, targetLang } = useWordAudio();

  const handlePlaySentence = async () => {
    await speak(data.targetSentence, targetLang);
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
      
      {/* Target Sentence Display (uses useSpeak + dynamic targetLang) */}
      <button 
        onClick={handlePlaySentence}
        disabled={isSentenceLoading}
        className="group w-full mb-10 p-8 bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 text-left transition-all hover:shadow-md hover:border-blue-300 relative overflow-hidden shrink-0"
      >
        <div className="absolute top-8 right-8 text-blue-300 group-hover:text-blue-500 transition-colors">
          {isSentenceLoading ? <Loader2 className="animate-spin" size={28} /> : <Volume2 size={28} />}
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

        {/* Highlight Group */}
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
      
      {/* Word-by-Word Breakdown List (uses WordAudioContext) */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Word-by-Word Breakdown
        </h3>
        
        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-1 gap-3 pr-3 pb-2 md:grid-cols-2">
            {data.words.map((wordObj: any, idx: number) => {
              const isThisWordPlaying = isWordPlaying && activeWord === wordObj.word;

              return (
                <button
                  key={idx}
                  onClick={() => playWord(wordObj.word, "m")}
                  disabled={isWordPlaying}
                  className={`group flex items-center gap-3 rounded-xl border p-3 text-left shadow-xs transition-all ${
                    isThisWordPlaying
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/50"
                  }`}
                >
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isThisWordPlaying
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                    }`}
                  >
                    {isThisWordPlaying ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <Volume2 size={14} />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span
                        className={`font-bold transition-colors ${
                          isThisWordPlaying
                            ? "text-blue-900"
                            : "text-gray-900 group-hover:text-blue-700"
                        }`}
                      >
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
              );
            })}
          </div>
        </ScrollArea>
      </div>

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