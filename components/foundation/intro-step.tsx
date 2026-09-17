"use client";

import { useSpeak } from "@/hooks/use-speak";
import React, { useState, useEffect } from "react";
import { 
  Volume2, 
  Square, 
  Target, 
  MessageSquare, 
  BookOpen, 
  Flag, 
  Play,
  Globe
} from "lucide-react";

export function IntroStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { speak, isPlaying, stop } = useSpeak();

  const handoff = data.lessonHandoff || {};
  const theme = handoff.theme || "Today's Lesson";
  const day = handoff.day || 1;
  const chunks = handoff.chunks || [];
  const targetSentence = handoff.targetSentence || "";
  const npcLine = handoff.npcLine || "";
  const freestyleTopic = handoff.freestyleTopic || "";

  const nativeLang = "en-US";
  const targetLang = "fr-FR";

  // State for active audio and which language tab the Intro is showing
  const [activeAudio, setActiveAudio] = useState<"introNative" | "introTarget" | "target" | "npc" | null>(null);
  const [introLang, setIntroLang] = useState<"native" | "target">("native");

  useEffect(() => {
    if (!isPlaying) setActiveAudio(null);
  }, [isPlaying]);

  // English Intro
  const introTextNative = `Welcome to Day ${day}. I'm so glad you're here! Today, we are focusing on ${theme}. We're going to learn some new vocabulary, practice your pronunciation, and at the end of the lesson, your final mission is: ${freestyleTopic}. Whenever you're ready, click Start Lesson below!`;
  
  // French Intro (In a real app, pass this in your JSON handoff from the backend!)
  const introTextTarget = `Bienvenue au Jour ${day}. Je suis si heureux que vous soyez là ! Aujourd'hui, nous nous concentrons sur les salutations. Nous allons apprendre du nouveau vocabulaire, pratiquer votre prononciation, et à la fin de la leçon, votre mission finale sera : saluer un voisin. Quand vous serez prêt, cliquez sur Commencer la leçon ci-dessous !`;

  const toggleAudio = (id: typeof activeAudio, text: string, lang: string) => {
    if (activeAudio === id && isPlaying) {
      stop();
      setActiveAudio(null);
    } else {
      stop();
      setActiveAudio(id);
      speak(text, lang, 1.0);
    }
  };

  const handleStart = () => {
    stop();
    onNext();
  };

  return (
    <div className="p-6 md:p-8 border border-slate-200 rounded-3xl bg-white shadow-sm max-w-3xl mx-auto text-slate-800">
      
      {/* HEADER */}
      <div className="text-center mb-10">
        <div className="inline-block px-3 py-1 mb-3 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-widest">
          Mission Briefing
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
          Day {day}: {theme}
        </h1>
        <p className="text-slate-500">
          Review your objectives before entering the simulation.
        </p>
      </div>

      <div className="space-y-6 mb-10">
        
        {/* DUAL-LANGUAGE BRIEFING TEXT */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 relative group transition-all hover:border-slate-300">
          
          {/* Language Toggle */}
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Flag size={14} /> Lesson Overview
            </h3>
            <div className="flex bg-slate-200/50 p-1 rounded-lg">
              <button
                onClick={() => setIntroLang("native")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  introLang === "native" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setIntroLang("target")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  introLang === "target" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Français
              </button>
            </div>
          </div>

          {/* Text & Audio Button */}
          <div className="flex justify-between items-start gap-4">
            <p className="text-slate-700 leading-relaxed font-medium">
              {introLang === "native" ? introTextNative : introTextTarget}
            </p>
            
            <button
              onClick={() => {
                if (introLang === "native") {
                  toggleAudio("introNative", introTextNative, nativeLang);
                } else {
                  toggleAudio("introTarget", introTextTarget, targetLang);
                }
              }}
              className={`shrink-0 p-3 rounded-full transition-colors ${
                (activeAudio === "introNative" && introLang === "native") || 
                (activeAudio === "introTarget" && introLang === "target")
                  ? "bg-slate-800 text-white" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
              title={`Play Briefing in ${introLang === "native" ? "English" : "French"}`}
            >
              {((activeAudio === "introNative" && introLang === "native") || 
                (activeAudio === "introTarget" && introLang === "target")) 
                ? <Square size={20} fill="currentColor" /> 
                : <Volume2 size={20} />}
            </button>
          </div>
        </div>

        {/* --- TARGET SENTENCE & NPC --- (Same as previous code) */}
        {/* ... */}
        
      </div>
      
      {/* START BUTTON */}
      <button
        onClick={handleStart}
        className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl text-lg shadow-xl shadow-slate-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <span>Start Lesson Simulation</span>
        <Play size={20} fill="currentColor" className="opacity-80" />
      </button>
    </div>
  );
}