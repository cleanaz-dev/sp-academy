"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Volume2, Square, ArrowRight } from "lucide-react";

export function IntroStep({ data, onNext }: { data: any; onNext: () => void }) {
  const handoff = data.lessonHandoff || {};
  
  // Data extraction using the new richer lessonHandoff fields
  const chunks = handoff.chunks || [];
  const targetSentence = handoff.targetSentence || "";
  const freestyleTopic = handoff.freestyleTopic || "";
  const introNative = handoff.introNative || "";
  const introTarget = handoff.introTarget || "";
  const introNativeAudio = handoff.introNativeAudio || "";
  const introTargetAudio = handoff.introTargetAudio || "";

  // We no longer need `useSpeak`. We'll manage standard HTML Audio element state.
  const [activeAudio, setActiveAudio] = useState<"native" | "target" | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio if the component unmounts while playing
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const toggleAudio = (type: "native" | "target", srcKey: string) => {
    // If clicking the currently playing audio, stop it
    if (activeAudio === type) {
      audioRef.current?.pause();
      setActiveAudio(null);
      return;
    }

    // Stop anything currently playing
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // In a production app, you might prepend a CloudFront domain or fetch a pre-signed URL here.
    // E.g. const url = `https://d12345.cloudfront.net/${srcKey}`
    const audioUrl = srcKey; 
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => setActiveAudio(null);
    
    // Catch handles the error gracefully when running locally without the actual mp3 files
    audio.play().catch(err => {
      console.warn("Audio playback skipped (mock file not found locally):", err);
      setActiveAudio(null);
    });

    setActiveAudio(type);
  };

  const handleStart = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onNext();
  };

  return (
    <div className="flex flex-col h-full p-8 md:p-12 animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      {/* NEW: Intro Header Text at the top */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Lesson Overview
        </h1>
        <p className="text-lg text-gray-600">
          Listen to the introduction below!
        </p>
      </div>

      {/* Intro Copy & Audio Players */}
      <div className="mb-10 flex flex-col gap-4">
        
        {/* Native Intro */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button 
            onClick={() => toggleAudio("native", introNativeAudio)} 
            className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              activeAudio === 'native' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {activeAudio === "native" ? <Square size={20} className="fill-current" /> : <Volume2 size={20} />}
          </button>
          <p className="text-gray-700 text-lg flex-1">
            {introNative}
          </p>
        </div>

        {/* Target Intro */}
        <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button 
            onClick={() => toggleAudio("target", introTargetAudio)} 
            className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${
              activeAudio === 'target' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white hover:bg-gray-50 text-blue-600'
            }`}
          >
            {activeAudio === "target" ? <Square size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
          </button>
          <p className="text-blue-900 font-medium text-lg flex-1">
            {introTarget}
          </p>
        </div>

      </div>

      {/* Target Sentence Area */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 md:p-8 mb-8 text-center">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Main Target Sentence
        </h3>
        <p className="text-2xl md:text-3xl font-medium text-gray-900 leading-snug">
          "{targetSentence}"
        </p>
      </div>

      {/* Vocabulary Pills */}
      {chunks.length > 0 && (
        <div className="mb-auto">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Vocabulary & Chunks to Master
          </h3>
          <div className="flex flex-wrap gap-2">
            {chunks.map((chunk: string, idx: number) => (
              <span key={idx} className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-600 text-sm font-medium">
                {chunk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer / Start Action */}
      <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="text-center sm:text-left">
          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Final Mission</h3>
          <p className="text-gray-900 font-medium">Roleplay: {freestyleTopic}</p>
        </div>
        
        <button
          onClick={handleStart}
          className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-lg shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          Begin Step 1 <ArrowRight size={20} />
        </button>
      </div>

    </div>
  );
}