"use client";
import React from "react";
import { CheckCircle, PartyPopper } from "lucide-react";

export function BridgeOutroStep({ data, onFinish }: { data: any; onFinish: () => void }) {
  const meta = data.meta || {};
  const handoff = data.handoffFragment || {};
  const lexicon = handoff.bridgeLexicon || [];

  return (
    <div className="flex flex-col h-full p-8 md:p-12 animate-in fade-in duration-500 overflow-y-auto">
      <div className="mb-10 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6 shadow-xs border border-yellow-200">
          <PartyPopper size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Awesome work, {meta.firstName || "there"}!
        </h2>
        <p className="text-gray-500 text-lg max-w-xl">
          You've successfully completed the Bridge cooldown. You are ready for the next level.
        </p>
      </div>

      {lexicon.length > 0 && (
        <div className="mb-12 max-w-2xl mx-auto w-full">
          <div className="p-8 bg-indigo-50 rounded-3xl border border-indigo-100 text-center">
            <h3 className="flex items-center justify-center gap-2 font-bold text-indigo-800 text-xl mb-6">
              <CheckCircle size={24} /> New Vocabulary Added
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {lexicon.map((word: string, idx: number) => (
                <span key={idx} className="bg-white text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold shadow-xs border border-indigo-200/50">
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-gray-100 pt-8 flex justify-center">
        <button onClick={onFinish} className="w-full sm:w-80 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-lg transition-all shadow-md active:scale-95">
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}