"use client";

import { useEffect, useRef } from "react";
import { Volume2, Loader2, Target, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

import { useFreestyle } from "@/context/freestyle-context";
import { FreestyleChatBubble } from "../freestyle/freestye-chat-bubble";
import { FreestyleControls } from "../freestyle/freestyle-controls";


export default function FoundationChat({ onEnd }: { onEnd: () => void }) {
  const {
    session,
    messages,
    isRecording,
    transcript,
    isProcessing,
    isPlaying,
    isSpeechLoading,
    handleReplay,
  } = useFreestyle();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extract the Foundation constraints we mapped earlier
  const freestyleData = (session as any).freestyleData;
  const { persona, requiredChunks } = freestyleData;

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, isProcessing]);

  return (
    <div className="flex flex-col h-full gap-6">
      
      {/* LIVE Constraints & Persona Board - Replaces the static one from Step */}
      <div className="grid md:grid-cols-2 gap-6 shrink-0">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <Target size={18} />
            <h3 className="font-bold uppercase tracking-wider text-xs">Your Persona Context</h3>
          </div>
          <p className="text-slate-300 font-medium text-sm">
            Talking to: <span className="text-white font-bold">{persona}</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
          <div className="flex items-center gap-2 mb-3 text-emerald-400">
            <ShieldAlert size={18} />
            <h3 className="font-bold uppercase tracking-wider text-xs">Required Chunks</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {requiredChunks?.map((chunk: string) => {
              // Automatically mark off required chunks when the user speaks them!
              const isUsed = messages
                .filter((m) => m.role === "user")
                .some((m) => m.content.toLowerCase().includes(chunk.toLowerCase()));

              return (
                <span
                  key={chunk}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-semibold border transition-all duration-500 ${
                    isUsed
                      ? "bg-emerald-950/50 text-emerald-400 border-emerald-800/50 shadow-sm shadow-emerald-900/20"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {isUsed && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {chunk}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* CHAT AREA - Custom Dark Mode Base Style */}
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl shadow-black/20 ring-1 ring-white/5 transition-all min-h-[400px]">
        
        {/* Messages Area */}
        <div className="flex-1 space-y-6 overflow-y-auto bg-transparent p-6 sm:p-8 scroll-smooth">
          
          {messages.length === 0 && !isProcessing && !isRecording && (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
              <p className="text-sm font-medium text-slate-400">
                Tap the microphone below and start speaking to begin...
              </p>
            </div>
          )}

          {messages.map((message) => (
            <FreestyleChatBubble
              key={message.id}
              message={message}
              onReplay={message.role === "assistant" ? handleReplay : undefined}
            />
          ))}

          {/* Live Transcript Bubble */}
          {isRecording && transcript && (
            <div className="flex flex-col items-end animate-in slide-in-from-bottom-2">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 px-5 py-3.5 text-[15px] leading-relaxed text-white shadow-md">
                {transcript}
                <span className="animate-pulse ml-1">...</span>
              </div>
            </div>
          )}

          {/* AI / TTS Loading Indicator */}
          {isProcessing && !isRecording && (
            <div className="flex items-start gap-2 duration-300 animate-in fade-in zoom-in">
              <div className="flex items-center gap-3 rounded-2xl rounded-bl-sm border border-slate-700 bg-slate-800 px-5 py-3.5 shadow-xs">
                {isPlaying || isSpeechLoading ? (
                  <>
                    <Volume2 className="h-5 w-5 animate-pulse text-indigo-400" />
                    <span className="text-sm font-semibold text-slate-300">Speaking...</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                    <span className="text-sm font-semibold text-slate-300">Thinking...</span>
                  </>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Controls - Dark Mode styled wrapper for your base controls */}
        <div className="z-10 bg-slate-900/90 backdrop-blur-md border-t border-slate-800">
          <FreestyleControls />
        </div>
      </div>

      {/* Footer / Finish Button */}
      <div className="mt-auto flex justify-center shrink-0">
        <button 
          onClick={onEnd} 
          className="w-full sm:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl text-lg shadow-xl shadow-indigo-900/50 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          End Simulation & View Debrief <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}