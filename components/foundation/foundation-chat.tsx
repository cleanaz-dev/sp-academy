"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Lightbulb } from "lucide-react";
import { useFoundation } from "@/context/foundation-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FoundationFreestyleControls } from "./foundation-freestyle-controls";
import {
  FoundationFreestyleChatBubble,
  type TtsStatus,
} from "./foundation-freestye-chat-bubble";
import { FoundationSuggestionBubble } from "./foudation-suggestion-bubble";

export default function FoundationChat({ onEnd }: { onEnd: () => void }) {
  const {
    session,
    messages,
    isRecording,
    transcript,
    isProcessing,
    isAiProcessing,
    isPlaying,
    isSpeechLoading,
    handleReplay,
    isSuggestionVisible,
  } = useFoundation();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Which message the learner manually replayed (null = the AI's auto-spoken reply)
  const [replayingId, setReplayingId] = useState<number | null>(null);

  // Extract the English hint we passed from the JSON
  const freestyleData = (session as any).freestyleData;
  const { nativeSentence } = freestyleData;

  // AI avatar URL from the session
  const aiAvatarUrl = (session as any).aiAvatarUrl as string | undefined;

  const isAudioBusy = isPlaying || isSpeechLoading;

  // Newest assistant message = the one auto-spoken after each AI turn
  const lastAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")?.id;

  // Show the "Thinking..." placeholder while the AI is generating
  const showThinking = isAiProcessing && !isRecording;

  const getTtsStatus = (message: any): TtsStatus => {
    if (message.role !== "assistant") return "idle";

    const isActiveMessage =
      replayingId === message.id ||
      (replayingId === null && message.id === lastAssistantId);

    if (!isActiveMessage) return "idle";
    if (isSpeechLoading) return "loading";
    if (isPlaying) return "playing";
    return "idle";
  };

  const handleReplayMessage = async (id: number, text: string) => {
    if (isAudioBusy) return;
    setReplayingId(id);
    try {
      await handleReplay(text);
    } finally {
      setReplayingId(null);
    }
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, isProcessing]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, isProcessing, isSuggestionVisible]);

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
                ttsStatus={getTtsStatus(message)}
                isBusy={isAudioBusy}
                onReplay={
                  message.role === "assistant"
                    ? (text) => handleReplayMessage(message.id, text)
                    : undefined
                }
              />
            ))}

            {/* Suggestion ghost bubble */}
            <FoundationSuggestionBubble />

            {/* Live Transcript Bubble */}
            {isRecording && transcript && (
              <div className="flex flex-col items-end animate-in slide-in-from-bottom-2">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 px-5 py-3.5 text-[15px] leading-relaxed text-white shadow-md">
                  {transcript}
                  <span className="animate-pulse ml-1">...</span>
                </div>
              </div>
            )}

            {/* AI "Thinking..." placeholder, rendered by the chat bubble */}
            {showThinking && (
              <FoundationFreestyleChatBubble
                message={{ id: "thinking", role: "assistant", text: "" }}
                aiAvatarUrl={aiAvatarUrl}
                ttsStatus="thinking"
              />
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
