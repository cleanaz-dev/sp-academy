"use client";

import { useMiniAudioPlayer } from "@/hooks/use-mini-audio-player";
import React, { useState } from "react";


export function ListeningStep({ data, onNext }: { data: any; onNext: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const { play, isPlaying, currentS3Key } = useMiniAudioPlayer();

  const isThisAudioPlaying = isPlaying && currentS3Key === data.audioS3Key;

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Step 4: Listening Comprehension</h2>
      <p className="mb-4 text-gray-600">Listen to the audio and select the matching text.</p>
      
      <button 
        onClick={() => play(data.audioS3Key)}
        className={`w-full sm:w-auto px-6 py-3 font-bold rounded mb-6 flex items-center justify-center gap-2 ${
          isThisAudioPlaying ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 hover:bg-gray-300'
        }`}
      >
        <span>{isThisAudioPlaying ? "🔊 Playing..." : "🔊 Play Audio"}</span>
      </button>
      
      <div className="flex flex-col gap-3">
        {data.options.map((opt: string, idx: number) => (
          <button 
            key={idx}
            onClick={() => setSelected(idx)}
            className={`p-4 text-left border rounded transition-colors ${
              selected === idx ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className={`mt-4 p-4 rounded ${selected === data.correctIndex ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {selected === data.correctIndex ? "✅ Correct!" : "❌ Not quite, listen closely and try again."}
        </div>
      )}

      <button 
        onClick={onNext} 
        disabled={selected !== data.correctIndex}
        className={`mt-6 px-4 py-2 font-semibold rounded ${
          selected === data.correctIndex 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Next: Quiz
      </button>
    </div>
  );
}