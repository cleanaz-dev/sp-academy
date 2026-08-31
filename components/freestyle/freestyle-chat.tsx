"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Volume2, Loader2 } from "lucide-react";

import { useFreestyle } from "@/context/freestyle-context";
import { FreestyleChatBubble } from "./freestye-chat-bubble";
import { FreestyleSuggestionsPanel } from "./freestyle-suggestions-panel";
import { FreestyleControls } from "./freestyle-controls";
import { FreestyleTimer } from "./freestyle-timer";

const MOCK_SUGGESTIONS = [
  "Could you repeat that a bit more slowly?",
  "What does that mean in English?",
  "I'm not sure how to say it, but...",
  "Can we talk about a different topic?",
  "Let me think about that for a second.",
];

export default function FreestyleChat() {
  const {
    session,
    messages,
    isRecording,
    transcript,
    isProcessing,
    isPlaying,
    isSpeechLoading,
    handleReplay
  } = useFreestyle();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, isProcessing]);

  return (
    <div className="flex h-full max-h-[85vh] w-full gap-6">
      {/* MAIN CHAT AREA */}
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        
        {/* Header */}
        <div className="z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
              <Image
                src={session.aiAvatarUrl}
                alt="AI Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold capitalize text-gray-900">
                {session.mode.toLowerCase()} Mode
              </h3>
              <p className="text-xs font-medium capitalize text-gray-500">
                {session.voiceGender} Tutor
              </p>
            </div>
          </div>
          <FreestyleTimer initialTime={300} />
        </div>

        {/* Messages Area */}
        <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/30 p-6">
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
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 p-3 px-5 text-[15px] text-white shadow-sm">
                {transcript}
                <span className="animate-pulse">...</span>
              </div>
            </div>
          )}

          {/* AI / TTS Loading Indicator */}
          {isProcessing && !isRecording && (
            <div className="flex items-start gap-2 duration-300 animate-in fade-in zoom-in">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-gray-100 bg-white p-3 px-4 shadow-sm">
                {isPlaying ? (
                  <>
                    <Volume2 className="h-4 w-4 animate-pulse text-indigo-500" />
                    <span className="text-sm font-medium text-gray-600">Speaking...</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Thinking...</span>
                  </>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Unified Controls Component */}
        <FreestyleControls />
      </div>

      {/* SUGGESTIONS PANEL */}
      <FreestyleSuggestionsPanel suggestions={MOCK_SUGGESTIONS} />
    </div>
  );
}