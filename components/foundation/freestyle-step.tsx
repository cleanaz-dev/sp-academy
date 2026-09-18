"use client";

import React from "react";
import { Target, Mic, Sparkles, ShieldAlert } from "lucide-react";

export function FreestyleStep({ data, onFinish }: { data: any; onFinish: () => void }) {
  const { freestyle } = data;

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-[2rem] p-8 md:p-12 animate-in fade-in duration-700 overflow-y-auto text-slate-50">
      
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold tracking-widest uppercase mb-4">
          <Sparkles size={16} /> Live Simulation
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
          {freestyle.topic}
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          {freestyle.openingLine}
        </p>
      </div>
      
      {/* Constraints & Persona Board */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
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

      {/* PLACEHOLDER FOR YOUR AI COMPONENT */}
      <div className="flex-1 min-h-[300px] mb-10 relative rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
        
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] pointer-events-none" />
        
        <div className="w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 animate-pulse">
          <Mic size={32} className="text-indigo-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">AI Conversation Ready</h3>
        <p className="text-slate-400 mb-6 max-w-md">
          Your conversational AI component (Azure Speech / FishAudio / Deepgram) will mount exactly here.
        </p>
        
        <div className="px-6 py-3 rounded-xl bg-slate-800 text-slate-500 font-mono text-sm border border-slate-700">
          {'<AiFreestyleChat constraints={data.freestyle} />'}
        </div>
      </div>

      {/* Footer / Finish Button */}
      <div className="mt-auto flex justify-center">
        <button 
          onClick={onFinish} 
          className="w-full sm:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl text-lg shadow-xl shadow-indigo-900/50 transition-all active:scale-95"
        >
          End Simulation & Finish Lesson 🎉
        </button>
      </div>

    </div>
  );
}