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
    // Changed to `h-full min-h-0` so it perfectly fills the parent without breaking flexbox
    <div className="flex h-full min-h-0 w-full gap-4 md:gap-6 p-2">
      
      {/* MAIN CHAT AREA */}
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-black/5 ring-1 ring-black/5 transition-all">
        
        {/* Header - Added glassmorphism and larger avatar */}
        <div className="z-10 flex items-center justify-between border-b border-gray-100 bg-white/90 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-gray-50 shadow-sm">
              <Image
                src="https://res.cloudinary.com/dmllgn0t7/image/upload/v1788189464/ai-avatar.png"
                alt="AI Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-bold capitalize text-gray-900 tracking-tight">
                {session.mode.toLowerCase()} Mode
              </h3>
              <p className="text-sm font-medium capitalize text-gray-500">
                {session.voiceGender} Tutor
              </p>
            </div>
          </div>
          <FreestyleTimer initialTime={300} />
        </div>

        {/* Messages Area - Improved padding and background */}
        <div className="flex-1 space-y-6 overflow-y-auto bg-[#FAFAFA] p-6 sm:p-8 scroll-smooth">
          
          {/* Subtle empty state if no messages yet (prevents awkward blank screen) */}
          {messages.length === 0 && !isProcessing && !isRecording && (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
              <p className="text-sm font-medium text-gray-500">
                Start speaking to begin the conversation...
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
              <div className="flex items-center gap-3 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-5 py-3.5 shadow-sm ring-1 ring-black/5">
                {isPlaying ? (
                  <>
                    <Volume2 className="h-5 w-5 animate-pulse text-indigo-500" />
                    <span className="text-sm font-semibold text-gray-600">Speaking...</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="text-sm font-semibold text-gray-600">Thinking...</span>
                  </>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Controls - Wrapped in a slightly blurred background so messages slide cleanly behind it */}
        <div className="z-10 bg-white/90 backdrop-blur-md">
          <FreestyleControls />
        </div>
      </div>

      {/* SUGGESTIONS PANEL */}
      <FreestyleSuggestionsPanel suggestions={MOCK_SUGGESTIONS} />
    </div>
  );
}