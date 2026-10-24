// components/freestyle/freestyle-chat.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useDataChannel,
  TrackToggle,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Volume2, Loader2, Mic, ArrowRight } from "lucide-react";
import { FreestyleChatBubble } from "./freestye-chat-bubble";
import { FreestyleSuggestionsPanel } from "./freestyle-suggestions-panel";
import { FreestyleTimer } from "./freestyle-timer";
import { useMatrix } from "@/context/matrix-context";
import { toast } from "sonner";

interface FreestyleChatProps {
  session: any;
  livekitToken: string;
  livekitUrl: string;
  onEnd: () => void;
}

function LiveFreestyleChatInner({
  session,
  onEnd,
}: {
  session: any;
  onEnd: () => void;
}) {
  const { state: agentState } = useVoiceAssistant();
  const { trackInteraction } = useMatrix();

  const [messages, setMessages] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isEnding, setIsEnding] = useState(false);

  const sessionStartTime = useRef(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentState]);

  // Listen to "spoon-meta" data channel from Python Agent (Azure Pronunciation + Sidecar Suggestions)
  useDataChannel("spoon-meta", (msg) => {
    try {
      const payload = JSON.parse(new TextDecoder().decode(msg.payload));

      // 1. Assistant message arrived
      if (payload.type === "AGENT_TURN") {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: "assistant",
            text: payload.text,
            translation: payload.translation,
          },
        ]);

        if (payload.suggestedTarget || payload.suggestedNative) {
          setSuggestions({
            starter: payload.suggestedTarget,
            translation: payload.suggestedNative,
          });
        }
      }

      // 2. User spoke -> Azure Pronunciation + Banked Words
      if (payload.type === "TURN_META" && payload.role === "user") {
        const text = payload.originalText || "";
        const pron = payload.pronunciation;

        if (pron?.words?.length) {
          pron.words.forEach((w: any) => {
            if (!w.word) return;
            trackInteraction(w.word, {
              spokenAttempt: true,
              spokenScore: w.accuracyScore,
              tappedCorrect: w.accuracyScore >= 70 ? 1 : 0,
              tappedWrong: w.accuracyScore < 70 ? 1 : 0,
            });
          });
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `user-${Date.now()}`,
            role: "user",
            text,
            pronunciationScore: pron,
          },
        ]);
      }
    } catch (e) {
      console.warn("spoon-meta error:", e);
    }
  });

  const handleEndSession = async () => {
    if (isEnding) return;
    setIsEnding(true);

    const duration = Math.round((Date.now() - sessionStartTime.current) / 1000);
    const toastId = toast.loading("Saving session...", {
      description: "Generating your AI review.",
    });

    try {
      const res = await fetch("/api/freestyle/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          userId: session.userId,
          messages,
          mistakes: [],
          duration,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");
      toast.success("Session Complete!", { id: toastId });
    } catch (err) {
      console.error("Failed to submit session for review:", err);
      toast.dismiss(toastId);
    } finally {
      onEnd();
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full gap-4 md:gap-6 p-6 sm:p-10">
      <RoomAudioRenderer />

      {/* MAIN CHAT AREA */}
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl shadow-xl shadow-black/5 ring-1 ring-black/5 transition-all">
        {/* Header with glassmorphism + Live 5:00 Timer */}
        <div className="z-10 flex items-center justify-between border-b border-gray-200/50 bg-white/50 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-gray-50 shadow-xs">
              <Image
                src={
                  session?.aiAvatarUrl ||
                  "https://res.cloudinary.com/dmllgn0t7/image/upload/v1788189464/ai-avatar.png"
                }
                alt="AI Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-bold capitalize text-gray-900 tracking-tight">
                {session?.topic || "Conversation Practice"}
              </h3>
              <p className="text-sm font-medium capitalize text-gray-500">
                {session?.targetLanguage} • Live Voice Room
              </p>
            </div>
          </div>

          <FreestyleTimer initialTime={300} onTimeUp={handleEndSession} />
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 space-y-6 overflow-y-auto bg-transparent p-6 sm:p-8 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-70">
              <p className="text-sm font-medium text-gray-500">
                {agentState === "connecting"
                  ? "Connecting to Live Voice AI..."
                  : "Room is live! Start speaking naturally."}
              </p>
            </div>
          )}

          {messages.map((message) => (
            <FreestyleChatBubble key={message.id} message={message} />
          ))}

          {/* AI Speaking Indicator */}
          {agentState === "speaking" && (
            <div className="flex items-start gap-2 duration-300 animate-in fade-in zoom-in">
              <div className="flex items-center gap-3 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-5 py-3.5 shadow-xs ring-1 ring-black/5">
                <Volume2 className="h-5 w-5 animate-pulse text-indigo-500" />
                <span className="text-sm font-semibold text-gray-600">
                  AI Speaking...
                </span>
              </div>
            </div>
          )}

          {agentState === "thinking" && (
            <div className="flex items-start gap-2 duration-300 animate-in fade-in zoom-in">
              <div className="flex items-center gap-3 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-5 py-3.5 shadow-xs ring-1 ring-black/5">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                <span className="text-sm font-semibold text-gray-600">
                  Thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Bottom Bar: Live Mic Status + End Button */}
        <div className="z-10 bg-white/90 backdrop-blur-md p-4 border-t border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${
                agentState === "listening"
                  ? "bg-emerald-500 animate-ping"
                  : agentState === "speaking"
                    ? "bg-indigo-500 animate-pulse"
                    : "bg-amber-400"
              }`}
            />
            <span className="text-sm font-bold text-gray-700">
              {agentState === "listening"
                ? "Listening (Speak anytime)..."
                : agentState === "speaking"
                  ? "AI Speaking (Interrupt anytime)"
                  : "Connecting voice..."}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <TrackToggle
              source={Track.Source.Microphone}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
            >
              <Mic size={14} className="inline mr-1" />
              Toggle Mic
            </TrackToggle>

            <button
              onClick={handleEndSession}
              disabled={isEnding}
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-black shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {isEnding ? "Saving..." : "End Session"}
            </button>
          </div>
        </div>
      </div>

      {/* SUGGESTIONS PANEL */}
      <FreestyleSuggestionsPanel
        suggestions={suggestions}
        isLoading={false}
      />
    </div>
  );
}

export default function FreestyleChat({
  session,
  livekitToken,
  livekitUrl,
  onEnd,
}: FreestyleChatProps) {
  return (
    <LiveKitRoom
      serverUrl={livekitUrl}
      token={livekitToken}
      connect={true}
      audio={true}
      video={false}
      className="h-full w-full"
    >
      <LiveFreestyleChatInner session={session} onEnd={onEnd} />
    </LiveKitRoom>
  );
}