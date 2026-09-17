"use client";

import React from "react";

export function PronunciationStep({ data, onNext }: { data: any; onNext: () => void }) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Step 3: Pronunciation Practice</h2>
      
      <div className="mb-6 text-center p-6 bg-gray-50 rounded border">
        <p className="text-2xl font-bold mb-2">{data.referenceText}</p>
      </div>
      
      <div className="mb-6">
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Focus Sounds:</p>
        <ul className="list-disc pl-5 text-gray-700">
          {data.focusSounds.map((fs: any, idx: number) => (
            <li key={idx}>{fs.sound}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Play Audio Button (Fish/Azure TTS) */}
        <button className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 font-semibold rounded flex items-center justify-center gap-2">
          <span>🔊</span> Play Reference Audio
        </button>
        
        {/* Record Button (AssemblyAI STT hook goes here) */}
        <button className="flex-1 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded flex items-center justify-center gap-2 border border-red-300">
          <span>🎤</span> Hold to Speak
        </button>
      </div>

      <button 
        onClick={onNext} 
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
      >
        Next: Listening
      </button>
    </div>
  );
}