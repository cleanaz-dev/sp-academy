"use client";

import { useEffect, useRef } from "react";
import { Volume2, Loader2, ArrowRight, Lightbulb } from "lucide-react";
import { useFoundation } from "@/context/foundation-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FoundationFreestyleControls } from "./foundation-freestyle-controls";
import { FoundationFreestyleChatBubble } from "./foundation-freestye-chat-bubble";

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
  } = useFoundation();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extract the English hint we passed from the JSON
  const freestyleData = (session as any).freestyleData;
  const { nativeSentence } = freestyleData;

  // AI avatar URL from the session (this line was missing)
  const aiAvatarUrl = (session as any).aiAvatarUrl as string | undefined;

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, isProcessing]);

  return (
    <div className="flex flex-col gap-4">
      {/* 💡 SUGGESTION HINT */}
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
              Try saying:{" "}
              <span className="text-white font-bold">"{nativeSentence}"</span>
            </p>
          </div>
        </div>
      )}

      {/* CHAT AREA - FIXED HEIGHT: change h-[500px] to whatever you want */}
      <div className="relative h-[500px] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-inner">
        <ScrollArea className="h-full">
          <div className="space-y-6 p-6 sm:p-8">
            {messages.length === 0 && !isProcessing && !isRecording && (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center opacity-60">
                <p className="text-sm font-medium text-slate-400">
                  Tap the microphone below and speak your hint to begin...
                </p>
              </div>
            )}
{messages.map((message) => (
  <FoundationFreestyleChatBubble
    key={message.id}
    message={message}
    aiAvatarUrl={aiAvatarUrl}
    isPlaying={isPlaying}
    isSpeechLoading={isSpeechLoading}
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
                      <span className="text-sm font-semibold text-slate-300">
                        Speaking...
                      </span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                      <span className="text-sm font-semibold text-slate-300">
                        Thinking...
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </ScrollArea>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="shrink-0 flex flex-col md:flex-row gap-4 h-auto md:h-[72px]">
        {/* No background here: the controls draw their own dark bar and stretch to fill this slot */}
        <div className="flex min-w-0 flex-1">
          <FoundationFreestyleControls />
        </div>

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