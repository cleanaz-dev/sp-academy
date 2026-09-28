"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Volume2, Square, ArrowRight, Loader2 } from "lucide-react";
import { useS3Media } from "@/context/s3-context"; // <--- Use our new hook

export function IntroStep({ data, onNext }: { data: any; onNext: () => void }) {
  const handoff = data.lessonHandoff || {};
  
  // Data extraction
  const chunks = handoff.chunks || [];
  const targetSentence = handoff.targetSentence || "";
  const freestyleTopic = handoff.freestyleTopic || "";
  const introNative = handoff.introNative || "";
  const introTarget = handoff.introTarget || "";
  const introNativeAudio = handoff.introNativeAudio || "";
  const introTargetAudio = handoff.introTargetAudio || "";

  // 1. ONE LINE OF CODE TO FETCH & CACHE
  const { urls, isLoading } = useS3Media([introNativeAudio, introTargetAudio]);
  const [nativeUrl, targetUrl] = urls;

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

  const toggleAudio = (type: "native" | "target") => {
    if (activeAudio === type) {
      audioRef.current?.pause();
      setActiveAudio(null);
      return;
    }

    const resolvedUrl = type === "native" ? nativeUrl : targetUrl;
    if (!resolvedUrl) return; // Guard clause if it failed to load

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(resolvedUrl);
    audioRef.current = audio;
    audio.onended = () => setActiveAudio(null);
    
    audio.play().catch(err => {
      console.warn("Audio playback skipped (mock file not found locally):", err);
      setActiveAudio(null);
    });

    setActiveAudio(type);
  };

  const handleStart = () => {
    if (audioRef.current) audioRef.current.pause();
    onNext();
  };

  return (
    <div className="flex flex-col h-full p-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Lesson Overview
        </h1>
        <p className="text-lg text-gray-600">
          Listen to the introduction below!
        </p>
      </div>

      <div className="mb-10 flex flex-col gap-4">
        
        {/* Native Intro */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button 
            onClick={() => toggleAudio("native")} 
            disabled={isLoading || !nativeUrl}
            className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
              activeAudio === 'native' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 
             activeAudio === "native" ? <Square size={20} className="fill-current" /> : <Volume2 size={20} />}
          </button>
          <p className="text-gray-700 text-lg flex-1">
            {introNative}
          </p>
        </div>

        {/* Target Intro */}
        <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button 
            onClick={() => toggleAudio("target")} 
            disabled={isLoading || !targetUrl}
            className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${
              isLoading ? 'bg-white text-gray-400 cursor-not-allowed border border-gray-200' :
              activeAudio === 'target' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white hover:bg-gray-50 text-blue-600'
            }`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> :
             activeAudio === "target" ? <Square size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
          </button>
          <p className="text-blue-900 font-medium text-lg flex-1">
            {introTarget}
          </p>
        </div>

      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 md:p-8 mb-8 text-center">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Main Target Sentence
        </h3>
        <p className="text-2xl md:text-3xl font-medium text-gray-900 leading-snug">
          "{targetSentence}"
        </p>
      </div>

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