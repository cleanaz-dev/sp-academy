"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Volume2, Square, Frown, Meh, Smile, CheckCircle, Loader2 } from "lucide-react";
import { useS3Media } from "@/context/s3-context"; // <--- 1. Import Hook

// Shared cap so the native and target cards truncate to the same length
const MAX_OUTRO_CHARS = 50;

function truncateToChars(text: string, maxChars: number): string {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  const sliced = text.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(" ");
  // avoid cutting mid-word unless the last space is way too early
  const clean = lastSpace > maxChars * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return `${clean.trimEnd()}…`;
}

export function OutroStep({ data, onFinish }: { data: any; onFinish: () => void }) {
  const handoff = data.lessonHandoff || {};

  // --- 2. Resolve S3 Keys via Context ---
  const { urls, isLoading } = useS3Media([handoff.outroNativeAudio, handoff.outroTargetAudio]);
  const [nativeUrl, targetUrl] = urls;

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

  // --- 3. Update toggleAudio to use the resolved URLs ---
  const toggleAudio = (type: "native" | "target") => {
    if (activeAudio === type) {
      audioRef.current?.pause();
      setActiveAudio(null);
      return;
    }

    const resolvedUrl = type === "native" ? nativeUrl : targetUrl;
    if (!resolvedUrl) return;

    if (audioRef.current) audioRef.current.pause();

    const audio = new Audio(resolvedUrl);
    audioRef.current = audio;
    audio.onended = () => setActiveAudio(null);

    audio.play().catch(err => {
      console.warn("Audio playback skipped:", err);
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

  const outroNativeText = truncateToChars(handoff.outroNative, MAX_OUTRO_CHARS);
  const outroTargetText = truncateToChars(handoff.outroTarget, MAX_OUTRO_CHARS);

  return (
    <div className="flex flex-col h-full p-8 animate-in fade-in duration-500 overflow-y-auto">

      {/* Header */}
      <div className="mb-10 text-center flex flex-col items-center">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-3">
          Mission Accomplished!
        </h2>
        <p className="text-gray-500 text-lg max-w-xl">
          You've completed Day {handoff.day || 1}. Let's review what you learned and wrap things up.
        </p>
      </div>

      {/* Outro Audio Players */}
      <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
        {/* Native Outro */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex gap-4 items-start">
          <button
            onClick={() => toggleAudio("native")}
            disabled={isLoading || !nativeUrl} // <--- Disable if loading
            className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
              activeAudio === 'native' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {/* Show spinner while loading */}
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 
             activeAudio === "native" ? <Square size={20} className="fill-current" /> : <Volume2 size={20} />}
          </button>
          <p className="text-gray-700 text-base sm:text-lg flex-1 break-words" title={handoff.outroNative}>
            {outroNativeText}
          </p>
        </div>

        {/* Target Outro */}
        <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl shadow-sm flex gap-4 items-start">
          <button
            onClick={() => toggleAudio("target")}
            disabled={isLoading || !targetUrl} // <--- Disable if loading
            className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${
              isLoading ? 'bg-white text-gray-400 cursor-not-allowed border border-gray-200' :
              activeAudio === 'target' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50 text-blue-600'
            }`}
          >
             {/* Show spinner while loading */}
             {isLoading ? <Loader2 size={20} className="animate-spin" /> :
             activeAudio === "target" ? <Square size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
          </button>
          <p className="text-blue-900 font-medium text-base sm:text-lg flex-1 break-words" title={handoff.outroTarget}>
            {outroTargetText}
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