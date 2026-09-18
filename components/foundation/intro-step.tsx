"use client";

import { useSpeak } from "@/hooks/use-speak";
import React, { useState, useEffect } from "react";
import { Play, Sparkles, Volume2, Square, ArrowRight, Mic } from "lucide-react";

export function IntroStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { speak, isPlaying, stop } = useSpeak();
  
  // Safely extract the handoff data
  const handoff = data.lessonHandoff || {};
  const theme = handoff.theme || "Today's Lesson";
  const day = handoff.day || 1;
  const chunks = handoff.chunks || [];
  const targetSentence = handoff.targetSentence || "";
  const freestyleTopic = handoff.freestyleTopic || "";

  // Languages (In production, pull these from your user context/props)
  const nativeLang = "en-US";
  const targetLang = "fr-FR";

  // State to track which audio is currently playing so the UI can reflect it
  const [activeAudio, setActiveAudio] = useState<"native" | "target" | null>(null);

  // Reset active audio state when the hook says it stopped playing
  useEffect(() => {
    if (!isPlaying) {
      setActiveAudio(null);
    }
  }, [isPlaying]);

  const playNativeIntro = () => {
    if (activeAudio === "native") {
      stop();
      return;
    }
    stop();
    setActiveAudio("native");
    // Conversational, friendly coach script
    const introText = `Welcome to Day ${day}. I'm so glad you're here! Today, we are focusing on ${theme}. We're going to learn some new vocabulary, practice your pronunciation, and at the end of the lesson, your final mission is ${freestyleTopic}. Whenever you're ready, click Start Lesson below!`;
    speak(introText, nativeLang, 1.0);
  };

  const playTargetSentence = () => {
    if (activeAudio === "target") {
      stop();
      return;
    }
    stop();
    setActiveAudio("target");
    speak(targetSentence, targetLang, 1.0);
  };

  // Cleanup audio if they click "Start" while it's playing
  const handleStart = () => {
    stop();
    onNext();
  };

  return (
    <div className="flex flex-col gap-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
      
      {/* HEADER SECTION */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold tracking-widest uppercase mb-2 shadow-sm">
          <Sparkles size={14} /> Lesson Briefing
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          Day {day}: {theme}
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Review your objectives before entering the simulation. Master these concepts to succeed in your final mission.
        </p>
      </div>

      {/* AUDIO ACTION ROW */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={playNativeIntro}
          className={`group flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border shadow-sm transition-all font-medium ${
            activeAudio === "native"
              ? "bg-blue-50 border-blue-300 text-blue-800 ring-4 ring-blue-500/10"
              : "bg-white border-gray-200 hover:shadow-md hover:border-gray-300 text-gray-700"
          }`}
        >
          <div className={`p-2 rounded-full transition-colors ${activeAudio === "native" ? "bg-blue-200 text-blue-700" : "bg-blue-50 group-hover:bg-blue-100 text-blue-600"}`}>
            {activeAudio === "native" ? <Square size={16} className="fill-current" /> : <Volume2 size={16} />}
          </div>
          {activeAudio === "native" ? "Stop Briefing" : "Play Briefing (English)"}
        </button>

        <button
          onClick={playTargetSentence}
          disabled={!targetSentence}
          className={`group flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border shadow-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
            activeAudio === "target"
              ? "bg-purple-50 border-purple-300 text-purple-800 ring-4 ring-purple-500/10"
              : "bg-white border-gray-200 hover:shadow-md hover:border-gray-300 text-gray-700"
          }`}
        >
          <div className={`p-2 rounded-full transition-colors ${activeAudio === "target" ? "bg-purple-200 text-purple-700" : "bg-purple-50 group-hover:bg-purple-100 text-purple-600"}`}>
            {activeAudio === "target" ? <Square size={16} className="fill-current" /> : <Play size={16} className="fill-current" />}
          </div>
          {activeAudio === "target" ? "Stop Target" : "Target Sentence (French)"}
        </button>
      </div>

      {/* CORE CONTENT GRID */}
      <div className="grid md:grid-cols-12 gap-6 mt-4">
        
        {/* Main Target Sentence */}
        <div className="md:col-span-5 p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-4">
            Main Target
          </h3>
          <p className="text-2xl md:text-3xl font-medium text-blue-950 leading-snug">
            "{targetSentence}"
          </p>
        </div>

        {/* Vocabulary & Chunks List (Pills instead of bullets) */}
        {chunks.length > 0 && (
          <div className="md:col-span-7 p-8 rounded-3xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">
              Vocabulary & Chunks to Master
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {chunks.map((chunk: string, idx: number) => (
                <span 
                  key={idx} 
                  className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-default shadow-sm"
                >
                  {chunk}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FINAL MISSION & START BUTTON (Dark Contrast Area) */}
      <div className="relative overflow-hidden mt-4 p-8 md:p-10 rounded-3xl bg-gray-900 text-white shadow-2xl">
        {/* Decorative background icon */}
        <div className="absolute -top-10 -right-4 text-gray-800 opacity-40 rotate-12 pointer-events-none">
          <Mic size={180} strokeWidth={1} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <span className="text-2xl">🎯</span>
              <h3 className="text-blue-400 font-bold tracking-widest uppercase text-xs">
                Final Mission
              </h3>
            </div>
            <p className="text-2xl font-semibold text-gray-100">
              Roleplay: {freestyleTopic}
            </p>
            <p className="text-gray-400 mt-2 text-sm max-w-md">
              At the end of this lesson, you will test your skills in a live AI simulation.
            </p>
          </div>
          
          <button
            onClick={handleStart}
            className="w-full md:w-auto whitespace-nowrap flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all text-white font-bold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 active:translate-y-0 active:scale-95"
          >
            Start Lesson <ArrowRight size={20} />
          </button>
        </div>
      </div>

    </div>
  );
}