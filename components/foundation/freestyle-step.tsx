"use client";

import React, { useState } from "react";
import { Target, Mic, ShieldAlert, ArrowRight, Play, Loader2 } from "lucide-react";
import { FreestyleProvider } from "@/context/freestyle-context";
import FoundationChat from "./foundation-chat";


export function FreestyleStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { freestyle, nativeLang, targetLang } = data;
  
  const [activeSession, setActiveSession] = useState<any>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Initialize the session using the data from your JSON
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
        freestyleData: freestyle, // Passing all constraints into the session config
      };

      const res = await fetch("/api/freestyle/create", {
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
    <div className="flex flex-col h-full bg-slate-950 rounded-4xl p-8 animate-in fade-in duration-700 overflow-y-auto text-slate-50">
      
      {/* Header - Stays visible in both states */}
      <div className="text-center mb-10 shrink-0">
        <h2 className="text-3xl md:text-2xl font-extrabold text-white mb-4">
          {freestyle.topic}
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          {freestyle.openingLine}
        </p>
      </div>

      {!activeSession ? (
        <div className="flex flex-col flex-1">
          {/* STATIC Constraints & Persona Board (Pre-simulation) */}
          <div className="grid md:grid-cols-2 gap-6 mb-10 shrink-0">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3 mb-4 text-indigo-400">
                <Target size={24} />
                <h3 className="font-bold uppercase tracking-wider text-sm">Your Persona Context</h3>
              </div>
              <p className="text-slate-300 font-medium text-lg">
                You are talking to <span className="text-white font-bold">{freestyle.persona}</span>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3 mb-4 text-emerald-400">
                <ShieldAlert size={24} />
                <h3 className="font-bold uppercase tracking-wider text-sm">Required Chunks</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {freestyle.requiredChunks.map((chunk: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-emerald-300 text-sm font-medium">
                    {chunk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Start Simulation Area */}
          <div className="flex-1 min-h-[300px] mb-10 relative rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] pointer-events-none" />
            
            <div className="w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 animate-pulse">
              <Mic size={32} className="text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">AI Conversation Ready</h3>
            <p className="text-slate-400 mb-8 max-w-md">
              Tap the button below to initialize your AI Tutor and begin the voice simulation.
            </p>
            
            <button 
              onClick={handleStartSimulation}
              disabled={isStarting}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-lg shadow-lg shadow-indigo-900/50 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Connecting...
                </>
              ) : (
                <>
                  <Play size={24} fill="currentColor" />
                  Start Simulation
                </>
              )}
            </button>
          </div>

          {/* Optional skip before playing */}
          <div className="mt-auto flex justify-center">
            <button 
              onClick={onNext} 
              className="w-full sm:w-auto px-12 py-5 bg-slate-800 hover:bg-slate-700 text-slate-400 font-extrabold rounded-2xl text-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Skip Step <ArrowRight size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in zoom-in-95 duration-500">
          {/* Wraps our newly created FoundationChat with the context it needs */}
          <FreestyleProvider session={activeSession} onEnd={onNext}>
            <FoundationChat onEnd={onNext} />
          </FreestyleProvider>
        </div>
      )}
    </div>
  );
}