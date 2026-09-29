"use client";

import React, { useState } from "react";
import { Mic, ArrowRight, Play, Loader2 } from "lucide-react";
import FoundationChat from "./foundation-chat";
import { FoundationProvider } from "@/context/foundation-context";

export function FreestyleStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { freestyle, nativeLang, targetLang, grammarContent, visualContent } = data;
  
  const [activeSession, setActiveSession] = useState<any>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSimulation = async () => {
    setIsStarting(true);
    try {
      const seed = Math.random().toString(36).substring(7);
      const aiAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&style=circle&top=longHair`;

      const config = {
        mode: freestyle.mode,
        level: freestyle.level,
        topic: freestyle.topic,
        nativeLanguage: nativeLang,
        targetLanguage: targetLang,
        voiceGender: "female",
        // We pass the exact sentences we need into the chat component
        freestyleData: {
          ...freestyle,
          nativeSentence: grammarContent?.nativeSentence,
          npcLine: visualContent?.npcLine
        }, 
      };

      const res = await fetch("/api/foundation/freestyle/create", {
        method: "POST",
        body: JSON.stringify({ ...config, aiAvatarUrl })
      });
      const resData = await res.json();

      setActiveSession({
        id: resData.sessionId,
        ...config,
        aiAvatarUrl,
      });
    } catch (error) {
      console.error("Failed to start session:", error);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-4xl p-8 animate-in fade-in duration-700 overflow-hidden text-slate-50">
      
      {/* Header - Stays visible in both states */}
      <div className="text-center mb-8 shrink-0">
        <h2 className="text-3xl md:text-2xl font-extrabold text-white mb-3">
          {freestyle.topic}
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          {freestyle.openingLine}
        </p>
      </div>

      {!activeSession ? (
        <div className="flex flex-col flex-1 overflow-y-auto">
          
          {/* Start Simulation Area - Now has way more room to breathe */}
          <div className="flex-1 min-h-[350px] mb-8 relative rounded-3xl border-2 border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] pointer-events-none" />
            
            <div className="w-24 h-24 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-8 animate-pulse">
              <Mic size={40} className="text-indigo-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3">AI Conversation Ready</h3>
            <p className="text-slate-400 mb-10 max-w-md text-lg">
              Tap the button below to initialize your AI Tutor and begin the voice simulation.
            </p>
            
            <button 
              onClick={handleStartSimulation}
              disabled={isStarting}
              className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl text-xl shadow-lg shadow-indigo-900/50 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  Connecting...
                </>
              ) : (
                <>
                  <Play size={28} fill="currentColor" />
                  Start Simulation
                </>
              )}
            </button>
          </div>

          <div className="mt-auto flex justify-center shrink-0">
            <button 
              onClick={onNext} 
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Skip Step <ArrowRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in zoom-in-95 duration-500">
          <FoundationProvider session={activeSession} onEnd={onNext}>
            <FoundationChat onEnd={onNext} />
          </FoundationProvider>
        </div>
      )}
    </div>
  );
}