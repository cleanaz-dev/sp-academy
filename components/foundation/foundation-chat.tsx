"use client";

import { useEffect, useRef } from "react";
import { Volume2, Loader2, ArrowRight, Lightbulb } from "lucide-react";

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

  // Extract the English hint we passed from the JSON
  const freestyleData = (session as any).freestyleData;
  const { nativeSentence } = freestyleData;

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, isProcessing]);

  return (
    <div className="flex flex-col h-full gap-4">
      
      {/* 💡 THE NEW SUGGESTION HINT - Minimalist and helpful */}
      {nativeSentence && (
        <div className="shrink-0 flex items-center gap-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Lightbulb size={20} className="text-indigo-400" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">
              Mission Hint
            </h4>
            <p className="text-slate-200 font-medium text-sm md:text-base">
              Try saying: <span className="text-white font-bold">"{nativeSentence}"</span>
            </p>
          </div>
        </div>
      )}

      {/* CHAT AREA - Now takes up maximum height! */}
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-inner min-h-[300px]">
        <div className="flex-1 space-y-6 overflow-y-auto p-6 sm:p-8 scroll-smooth">
          
          {messages.length === 0 && !isProcessing && !isRecording && (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
              <p className="text-sm font-medium text-slate-400">
                Tap the microphone below and speak your hint to begin...
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
      </div>

      {/* NEW BOTTOM ACTION BAR: Controls & End Button Side-by-Side */}
      <div className="shrink-0 flex flex-col md:flex-row gap-4 h-auto md:h-[72px]">
        
        {/* We wrap the existing white controls in a full-width container so it matches the aesthetic */}
        <div className="flex-1 bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-xl flex items-center justify-center">
          <FreestyleControls />
        </div>
        
        {/* The End Button sits perfectly flush next to it on desktop */}
        <button 
          onClick={onEnd} 
          className="w-full md:w-auto h-[72px] px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl md:rounded-3xl text-lg shadow-xl shadow-indigo-900/50 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
        >
          End Simulation <ArrowRight size={20} />
        </button>
      </div>

    </div>
  );
}