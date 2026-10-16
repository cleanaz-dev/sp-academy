"use client";

import { Square, Mic, Send } from "lucide-react";
import { useBossFoundation } from "@/context/boss-context";

const iconButton =
  "flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

export function BossFoundationFreestyleControls() {
  const { isRecording, isProcessing, handleEndSession, startRecording, submitTurn } =
    useBossFoundation();

  return (
    <div className="z-10 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl md:rounded-3xl border border-slate-800 bg-slate-900 px-4 py-2">
      <div className="flex justify-start">
        <button
          onClick={() => handleEndSession()}
          className={`${iconButton} bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300`}
          title="End Session"
        >
          <Square className="h-5 w-5 fill-current" />
        </button>
      </div>

      <div className="flex justify-center">
        {isRecording ? (
          <button
            onClick={submitTurn}
            title="Send"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_24px_-4px_rgba(16,185,129,0.7)] ring-4 ring-emerald-500/20 transition-transform hover:scale-105 active:scale-95"
          >
            <Send className="ml-1 h-6 w-6" />
          </button>
        ) : (
          <button
            onClick={startRecording}
            disabled={isProcessing}
            title="Speak"
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 ${
              isProcessing
                ? "cursor-not-allowed bg-slate-800 text-slate-500"
                : "bg-indigo-600 text-white shadow-[0_0_24px_-4px_rgba(99,102,241,0.7)] hover:-translate-y-0.5 hover:bg-indigo-500"
            }`}
          >
            <Mic className="h-6 w-6" />
          </button>
        )}
      </div>

      <div />
    </div>
  );
}