// components/foundation/foundation-livekit-chat.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useTrackTranscription,
  useDataChannel,
  useLocalParticipant,
  TrackToggle,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { ArrowRight, Lightbulb, Mic, Loader2, Timer } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FoundationFreestyleChatBubble } from "./foundation-freestye-chat-bubble";

interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
  translation?: string;
}

function LiveFreestyleInner({
  freestyleData,
  aiAvatarUrl,
  onEnd,
}: {
  freestyleData: any;
  aiAvatarUrl?: string;
  onEnd: () => void;
}) {
  const { state: agentState, audioTrack: agentAudioTrack } = useVoiceAssistant();
  const { localParticipant, microphoneTrack } = useLocalParticipant();

  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [hint, setHint] = useState<{ target?: string; native?: string }>({
    native: freestyleData?.nativeSentence,
  });
  const [secondsLeft, setSecondsLeft] = useState(300); // 5-minute sprint timer
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. 5-Minute Sprint Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onEnd]);

  // 2. Listen for Sidecar Translations & Hints over DataChannel ("spoon-meta")
  useDataChannel("spoon-meta", (msg) => {
    try {
      const payload = JSON.parse(new TextDecoder().decode(msg.payload));
      if (payload.type === "TURN_META") {
        setTurns((prev) => {
          const exists = prev.some(
            (t) => t.text === payload.originalText && t.role === payload.role
          );
          if (exists) {
            return prev.map((t) =>
              t.text === payload.originalText && t.role === payload.role
                ? { ...t, translation: payload.translation }
                : t
            );
          }
          return [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              role: payload.role,
              text: payload.originalText,
              translation: payload.translation,
            },
          ];
        });

        if (payload.role === "assistant" && payload.suggestedNative) {
          setHint({
            target: payload.suggestedTarget,
            native: payload.suggestedNative,
          });
        }
      }
    } catch (e) {
      console.warn("Failed to parse spoon-meta:", e);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, agentState]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="flex flex-col gap-4">
      <RoomAudioRenderer />

      {/* Top Bar: Mission Hint + 5-Min Live Timer */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Lightbulb size={20} className="text-indigo-400" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">
              Live Mission Hint
            </h4>
            <p className="text-slate-200 font-medium text-sm md:text-base">
              Try saying:{" "}
              <span className="text-white font-bold">
                "{hint.native || "Greet them in your target language!"}"
              </span>
              {hint.target && (
                <span className="ml-2 text-indigo-300 text-sm italic">
                  ({hint.target})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center rounded-full bg-slate-900/90 border border-slate-700 px-3.5 py-1.5 text-xs font-extrabold text-teal-400">
          <Timer size={14} />
          <span>
            {mins}:{secs}
          </span>
        </div>
      </div>

      {/* Chat Transcript Area */}
      <div className="relative h-[500px] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-inner">
        <ScrollArea className="h-full">
          <div className="space-y-6 p-6 sm:p-8">
            {turns.length === 0 && (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center opacity-70">
                <p className="text-sm font-medium text-slate-300">
                  {agentState === "connecting"
                    ? "Connecting to live voice room..."
                    : "Room is live! Just speak naturally—no need to hold the mic."}
                </p>
              </div>
            )}

            {turns.map((turn) => (
              <FoundationFreestyleChatBubble
                key={turn.id}
                message={turn as any}
                aiAvatarUrl={aiAvatarUrl}
                ttsStatus={
                  turn.role === "assistant" && agentState === "speaking"
                    ? "playing"
                    : "idle"
                }
              />
            ))}

            {agentState === "thinking" && (
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

      {/* Bottom Live Control Bar */}
      <div className="shrink-0 flex flex-col md:flex-row gap-4 h-auto md:h-[72px]">
        <div className="flex flex-1 items-center justify-between rounded-2xl md:rounded-3xl bg-slate-900 border border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${
                agentState === "listening"
                  ? "bg-emerald-400 animate-ping"
                  : agentState === "speaking"
                    ? "bg-indigo-400 animate-pulse"
                    : "bg-amber-400"
              }`}
            />
            <span className="text-sm font-bold text-white capitalize">
              {agentState === "listening"
                ? "Listening to you..."
                : agentState === "speaking"
                  ? "AI Speaking (Interrupt anytime)"
                  : agentState}
            </span>
          </div>

          <TrackToggle
            source={Track.Source.Microphone}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
          >
            Mute / Unmute Mic
          </TrackToggle>
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