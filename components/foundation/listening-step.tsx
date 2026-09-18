"use client";

import { useMiniAudioPlayer } from "@/hooks/use-mini-audio-player";
import React, { useState } from "react";
import { Headphones, Play, Square, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export function ListeningStep({ data, onNext }: { data: any; onNext: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const { play, isPlaying, currentS3Key } = useMiniAudioPlayer();

  const isThisAudioPlaying = isPlaying && currentS3Key === data.audioS3Key;
  const isCorrect = selected === data.correctIndex;

  return (
    <div className="flex flex-col h-full p-8 md:p-12 animate-in fade-in duration-500 overflow-y-auto">
      
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Listening Focus
        </h2>
        <p className="text-gray-500 text-lg">
          Listen carefully to the audio and select the matching text.
        </p>
      </div>
      
      {/* Big Audio Play Button */}
      <div className="flex justify-center mb-10">
        <button 
          onClick={() => play(data.audioS3Key)}
          className={`group relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isThisAudioPlaying 
              ? 'bg-blue-100 text-blue-600 ring-8 ring-blue-50' 
              : 'bg-gray-900 text-white hover:bg-black hover:scale-105'
          }`}
        >
          {isThisAudioPlaying ? <Square size={32} className="fill-current" /> : <Play size={36} className="fill-current ml-2" />}
          
          {/* Decorative ping ring when playing */}
          {isThisAudioPlaying && (
            <span className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-20"></span>
          )}
        </button>
      </div>
      
      {/* Options Grid */}
      <div className="flex flex-col gap-3 mb-8">
        {data.options.map((opt: string, idx: number) => {
          const isSelected = selected === idx;
          const isThisCorrect = isSelected && idx === data.correctIndex;
          const isThisWrong = isSelected && idx !== data.correctIndex;

          return (
            <button 
              key={idx}
              onClick={() => setSelected(idx)}
              className={`relative w-full p-5 text-left rounded-2xl border-2 transition-all font-medium text-lg ${
                isThisCorrect 
                  ? 'bg-green-50 border-green-500 text-green-900 shadow-sm' 
                  : isThisWrong
                  ? 'bg-red-50 border-red-300 text-red-900 animate-in shake'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center gap-4">
                <span>{opt}</span>
                {isThisCorrect && <CheckCircle2 className="text-green-500 shrink-0" size={24} />}
                {isThisWrong && <XCircle className="text-red-500 shrink-0" size={24} />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Feedback & Action Area */}
      <div className="mt-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100">
        
        {/* Feedback Message */}
        <div className="flex-1">
          {selected !== null && (
            <div className={`flex items-center gap-2 font-bold animate-in fade-in ${
              isCorrect ? 'text-green-600' : 'text-red-500'
            }`}>
              {isCorrect ? "✅ Excellent ear! You got it." : "❌ Not quite right. Listen closely and try again."}
            </div>
          )}
        </div>

        {/* Next Button */}
        <button 
          onClick={onNext} 
          disabled={!isCorrect}
          className={`w-full sm:w-auto px-8 py-4 font-bold rounded-xl text-lg transition-all flex items-center justify-center gap-2 ${
            isCorrect 
              ? 'bg-gray-900 hover:bg-black text-white shadow-md active:scale-95' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next: Knowledge Check <ArrowRight size={20} />
        </button>
      </div>

    </div>
  );
}