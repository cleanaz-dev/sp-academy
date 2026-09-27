"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Volume2, Square, Frown, Meh, Smile, CheckCircle, PartyPopper } from "lucide-react";

export function OutroStep({ data, onFinish }: { data: any; onFinish: () => void }) {
  const handoff = data.lessonHandoff || {};
  
  // Audio state
  const [activeAudio, setActiveAudio] = useState<"native" | "target" | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Feedback state
  const [feedback, setFeedback] = useState<"hard" | "ok" | "easy" | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const toggleAudio = (type: "native" | "target", srcKey: string) => {
    if (activeAudio === type) {
      audioRef.current?.pause();
      setActiveAudio(null);
      return;
    }

    if (audioRef.current) audioRef.current.pause();

    const audio = new Audio(srcKey);
    audioRef.current = audio;
    audio.onended = () => setActiveAudio(null);
    
    audio.play().catch(err => {
      console.warn("Audio playback skipped (mock file not found locally):", err);
      setActiveAudio(null);
    });

    setActiveAudio(type);
  };

  const handleFinish = () => {
    if (audioRef.current) audioRef.current.pause();
    onFinish();
  };

  // Deduplicate arrays from handoff for a clean celebratory display
  const mastered = Array.from(new Set([...(handoff.taughtChunks || []), ...(handoff.blankedWords || [])]));

  return (
    <div className="flex flex-col h-full p-8 animate-in fade-in duration-500 overflow-y-auto">
      
      {/* Header */}
      <div className="mb-10 text-center flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Mission Accomplished!
        </h2>
        <p className="text-gray-500 text-lg max-w-xl">
          You've completed Day {handoff.day}. Let's review what you learned and wrap things up.
        </p>
      </div>

      {/* Outro Audio Players */}
      <div className="mb-10 flex flex-col gap-4">
        {/* Native Outro */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button 
            onClick={() => toggleAudio("native", handoff.outroNativeAudio)} 
            className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              activeAudio === 'native' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {activeAudio === "native" ? <Square size={20} className="fill-current" /> : <Volume2 size={20} />}
          </button>
          <p className="text-gray-700 text-lg flex-1">
            {handoff.outroNative}
          </p>
        </div>

        {/* Target Outro */}
        <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button 
            onClick={() => toggleAudio("target", handoff.outroTargetAudio)} 
            className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${
              activeAudio === 'target' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50 text-blue-600'
            }`}
          >
            {activeAudio === "target" ? <Square size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
          </button>
          <p className="text-blue-900 font-medium text-lg flex-1">
            {handoff.outroTarget}
          </p>
        </div>
      </div>

      {/* Celebration Summary - Full Width */}
      {mastered.length > 0 && (
        <div className="mb-12">
          <div className="p-8 bg-green-50 rounded-3xl border border-green-100 text-center sm:text-left">
            <h3 className="flex items-center justify-center sm:justify-start gap-2 font-bold text-green-800 text-xl mb-6">
              <CheckCircle size={24} /> Vocabulary Mastered Today
            </h3>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              {mastered.map((word, idx) => (
                <span key={idx} className="bg-white text-green-700 px-4 py-2 rounded-xl text-sm font-bold shadow-xs border border-green-200/50">
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Feedback */}
      <div className="mt-auto border-t border-gray-100 pt-8 pb-4 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-6">How was today's lesson?</h3>
        
        <div className="flex justify-center gap-4 sm:gap-8 mb-8">
          <button 
            onClick={() => setFeedback("hard")}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all ${
              feedback === "hard" ? "bg-red-50 text-red-600 scale-110 shadow-sm ring-2 ring-red-200" : "text-gray-400 hover:bg-gray-50 hover:text-red-500 hover:scale-105"
            }`}
          >
            <Frown size={48} />
            <span className="font-bold text-sm uppercase tracking-widest">Hard</span>
          </button>
          
          <button 
            onClick={() => setFeedback("ok")}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all ${
              feedback === "ok" ? "bg-blue-50 text-blue-600 scale-110 shadow-sm ring-2 ring-blue-200" : "text-gray-400 hover:bg-gray-50 hover:text-blue-500 hover:scale-105"
            }`}
          >
            <Meh size={48} />
            <span className="font-bold text-sm uppercase tracking-widest">OK</span>
          </button>
          
          <button 
            onClick={() => setFeedback("easy")}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all ${
              feedback === "easy" ? "bg-green-50 text-green-600 scale-110 shadow-sm ring-2 ring-green-200" : "text-gray-400 hover:bg-gray-50 hover:text-green-500 hover:scale-105"
            }`}
          >
            <Smile size={48} />
            <span className="font-bold text-sm uppercase tracking-widest">Easy</span>
          </button>
        </div>

        <button 
          onClick={handleFinish}
          disabled={!feedback}
          className={`w-full sm:w-80 mx-auto py-4 font-bold rounded-xl text-lg transition-all shadow-md active:scale-95 ${
            feedback 
              ? 'bg-gray-900 hover:bg-black text-white' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Return to Dashboard
        </button>
      </div>

    </div>
  );
}