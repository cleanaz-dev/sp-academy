"use client";

import { useSpeak } from "@/hooks/use-speak";
import React, { useState, useEffect } from "react";


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
    stop();
    setActiveAudio("native");
    // Conversational, friendly coach script
    const introText = `Welcome to Day ${day}. I'm so glad you're here! Today, we are focusing on ${theme}. We're going to learn some new vocabulary, practice your pronunciation, and at the end of the lesson, your final mission is ${freestyleTopic}. Whenever you're ready, click Start Lesson below!`;
    speak(introText, nativeLang, 1.0);
  };

  const playTargetSentence = () => {
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
    <div className="p-6 md:p-8 border rounded-2xl bg-white shadow-sm max-w-2xl mx-auto">
      {/* HEADER */}
      <div className="text-center mb-8">
        <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">
          Lesson Briefing
        </p>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Day {day}: {theme}
        </h1>
        <p className="text-gray-500">
          Review your objectives before entering the simulation.
        </p>
      </div>

      {/* AUDIO CONTROLS */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={playNativeIntro}
          className={`flex-1 py-3 px-4 rounded-xl font-bold flex justify-center items-center gap-2 border transition-colors ${
            activeAudio === "native"
              ? "bg-blue-100 text-blue-800 border-blue-300"
              : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          <span>{activeAudio === "native" ? "🔊 Playing Briefing..." : "🔊 Play Briefing (English)"}</span>
        </button>

        <button
          onClick={playTargetSentence}
          disabled={!targetSentence}
          className={`flex-1 py-3 px-4 rounded-xl font-bold flex justify-center items-center gap-2 border transition-colors ${
            activeAudio === "target"
              ? "bg-purple-100 text-purple-800 border-purple-300"
              : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          <span>{activeAudio === "target" ? "🔊 Playing Target..." : "🔊 Target Sentence (French)"}</span>
        </button>
      </div>

      {/* LESSON HANDOFF DATA DISPLAY */}
      <div className="space-y-6 mb-10 text-left">
        
        {/* Core Target */}
        <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
          <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-2">
            Main Target Sentence
          </h3>
          <p className="text-xl font-bold text-blue-950">{targetSentence}</p>
        </div>

        {/* Vocabulary/Chunks List */}
        {chunks.length > 0 && (
          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
              Vocabulary & Chunks to Master
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {chunks.map((chunk: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-gray-800 font-medium">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{chunk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Final Mission / Freestyle Topic */}
        <div className="p-5 bg-purple-50 rounded-xl border border-purple-100 flex flex-col md:flex-row gap-4 items-center">
          <div className="text-4xl">🎯</div>
          <div>
            <h3 className="text-sm font-bold text-purple-800 uppercase tracking-wide mb-1">
              Final Mission
            </h3>
            <p className="text-purple-950 font-medium">
              At the end of this lesson, you will roleplay: <strong>{freestyleTopic}</strong>.
            </p>
          </div>
        </div>

      </div>

      {/* START BUTTON */}
      <button
        onClick={handleStart}
        className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-lg shadow-lg transition-transform active:scale-95"
      >
        Start Lesson
      </button>
    </div>
  );
}