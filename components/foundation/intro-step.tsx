"use client";

import { useSpeak } from "@/hooks/use-speak";
import React, { useState, useEffect } from "react";
import { Play, Volume2, Square, ArrowRight } from "lucide-react";

export function IntroStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { speak, isPlaying, stop } = useSpeak();
  
  const handoff = data.lessonHandoff || {};
  const theme = handoff.theme || "Today's Lesson";
  const day = handoff.day || 1;
  const chunks = handoff.chunks || [];
  const targetSentence = handoff.targetSentence || "";
  const freestyleTopic = handoff.freestyleTopic || "";

  const [activeAudio, setActiveAudio] = useState<"native" | "target" | null>(null);

  useEffect(() => {
    if (!isPlaying) setActiveAudio(null);
  }, [isPlaying]);

  const playNativeIntro = () => {
    if (activeAudio === "native") return stop();
    stop();
    setActiveAudio("native");
    speak(`Welcome to Day ${day}...`, "en-US", 1.0);
  };

  const playTargetSentence = () => {
    if (activeAudio === "target") return stop();
    stop();
    setActiveAudio("target");
    speak(targetSentence, "fr-FR", 1.0);
  };

  const handleStart = () => {
    stop();
    onNext();
  };

  return (
    <div className="flex flex-col h-full p-8 md:p-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Prepare for Deployment
        </h1>
        <p className="text-gray-500 text-lg max-w-xl">
          Review today's target phrase and essential vocabulary before entering the simulation.
        </p>
      </div>

      {/* Target Sentence Area */}
      <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 md:p-8 mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Main Target Sentence
        </h3>
        <p className="text-2xl md:text-3xl font-medium text-gray-900 leading-snug mb-6">
          "{targetSentence}"
        </p>
        
        {/* Audio Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={playNativeIntro} className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 border transition-all ${activeAudio === "native" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"}`}>
            {activeAudio === "native" ? <Square size={18} className="fill-current" /> : <Volume2 size={18} />}
            {activeAudio === "native" ? "Stop Briefing" : "Play Briefing (EN)"}
          </button>

          <button onClick={playTargetSentence} className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 border transition-all ${activeAudio === "target" ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"}`}>
            {activeAudio === "target" ? <Square size={18} className="fill-current" /> : <Play size={18} className="fill-current" />}
            {activeAudio === "target" ? "Stop Target" : "Target Sentence (FR)"}
          </button>
        </div>
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
        <div>
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