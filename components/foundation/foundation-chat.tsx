// foundation-chat.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useDataChannel,
  TrackToggle,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import {
  ArrowRight,
  Lightbulb,
  Timer,
  Mic,
  CheckCircle2,
  Target,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FoundationFreestyleChatBubble } from "./foundation-freestye-chat-bubble";
import { useMatrix } from "@/context/matrix-context";
import { toast } from "sonner";

// Helper to normalize accents/case when matching spoken transcript against requiredChunks
const normalizeText = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

function LiveKitChatInner({
  session,
  onEnd,
}: {
  session: any;
  onEnd: () => void;
}) {
  const { state: agentState } = useVoiceAssistant();
  const { trackInteraction } = useMatrix();

  const [messages, setMessages] = useState<any[]>([]);
  const [completedChunks, setCompletedChunks] = useState<Set<string>>(
    new Set()
  );
  const [activeReaction, setActiveReaction] = useState<{
    id: number;
    emoji: string;
    mood: string;
    label?: string;
  } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(300); // 5-minute sprint
  const [isEnding, setIsEnding] = useState(false);

  const sessionStartRef = useRef(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const freestyleData = session?.freestyleData || {};
  const nativeSentence = freestyleData?.nativeSentence;
  const starterHintTarget = freestyleData?.starterHintTarget;
  const requiredChunks: string[] =
    freestyleData?.requiredChunks || freestyleData?.targetPhrases || [];
  const aiAvatarUrl = session?.aiAvatarUrl;

  const allChunksCompleted =
    requiredChunks.length > 0 &&
    completedChunks.size === requiredChunks.length;

  // 1. 5-Minute Sprint Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Receive Azure Pronunciation Scores, Agent Text & Emoji Reactions over "spoon-meta"
  useDataChannel("spoon-meta", (msg) => {
    try {
      const payload = JSON.parse(new TextDecoder().decode(msg.payload));

      // A. Visual Reaction Tool from src/tools.py
      if (payload.type === "AI_REACTION") {
        setActiveReaction({
          id: Date.now(),
          emoji: payload.emoji,
          mood: payload.mood,
          label: payload.label,
        });
        setTimeout(() => setActiveReaction(null), 4000);
        return;
      }

      // B. Assistant Turn Text from @session.on("conversation_item_added")
      if (payload.type === "AGENT_TURN") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            role: "assistant",
            text: payload.text,
            translation: payload.translation,
          },
        ]);
        return;
      }

      // C. User Turn + Azure Pronunciation Scores from src/azure_pronunciation.py
      if (payload.type === "TURN_META" && payload.role === "user") {
        const spokenText = payload.originalText || "";
        const pron = payload.pronunciation;

        // Check if the user hit any of the Mission's requiredChunks!
        const normSpoken = normalizeText(spokenText);
        if (normSpoken && requiredChunks.length > 0) {
          requiredChunks.forEach((chunk) => {
            const normChunk = normalizeText(chunk);
            if (normChunk && normSpoken.includes(normChunk)) {
              setCompletedChunks((prev) => {
                if (prev.has(chunk)) return prev;
                const next = new Set(prev);
                next.add(chunk);
                return next;
              });
            }
          });
        }

        // Feed per-word accuracy directly into WordMatrix!
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
            id: Date.now() + Math.random(),
            role: "user",
            text: spokenText,
            isAnalyzingPronunciation: false,
            pronunciationScore: pron
              ? {
                  accuracyScore: pron.accuracyScore,
                  fluencyScore: pron.fluencyScore,
                  score: pron.pronScore ?? pron.accuracyScore,
                  words: pron.words ?? [],
                }
              : undefined,
          },
        ]);
      }
    } catch (err) {
      console.warn("Failed to parse spoon-meta packet:", err);
    }
  });

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentState, activeReaction]);

  const handleFinishSession = async () => {
    if (isEnding) return;
    setIsEnding(true);

    const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
    const toastId = toast.loading("Saving session...", {
      description: "Logging your spoken progress.",
    });

    try {
      await fetch("/api/foundation/freestyle/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...session,
          sessionId: session.id,
          messages,
          mistakes: [],
          duration,
        }),
      });

      toast.success("Session Complete!", { id: toastId });
    } catch (e) {
      toast.dismiss(toastId);
    } finally {
      onEnd();
    }
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="flex flex-col gap-3.5">
      <RoomAudioRenderer />

      {/* 1. TOP BAR: Mission Hint + 5-Min Sprint Timer */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
        {nativeSentence || starterHintTarget ? (
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Lightbulb size={20} className="text-indigo-400" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">
                Mission Hint
              </h4>
              <p className="text-slate-200 font-medium text-sm md:text-base">
                Try saying:{" "}
                <span className="text-white font-bold">
                  "{starterHintTarget || nativeSentence}"
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-sm font-bold text-indigo-300">
            Speak naturally in {session?.targetLanguage}
          </div>
        )}

        <div className="flex items-center gap-2 self-end sm:self-center rounded-full bg-slate-900 border border-slate-700 px-3.5 py-1.5 text-xs font-extrabold text-teal-400">
          <Timer size={14} />
          <span>
            {mins}:{secs}
          </span>
        </div>
      </div>

      {/* 2. MISSION TARGET CHUNKS CHECKLIST */}
      {requiredChunks.length > 0 && (
        <div className="shrink-0 flex flex-wrap items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mr-1">
            Target Phrases ({completedChunks.size}/{requiredChunks.length}):
          </span>
          {requiredChunks.map((chunk) => {
            const hit = completedChunks.has(chunk);
            return (
              <span
                key={chunk}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold transition-all duration-300 ${
                  hit
                    ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300 scale-105 shadow-sm shadow-emerald-950"
                    : "bg-slate-800 border-slate-700 text-slate-300"
                }`}
              >
                {hit ? (
                  <CheckCircle2 size={13} className="text-emerald-400" />
                ) : (
                  <Target size={13} className="text-indigo-400" />
                )}
                <span>{chunk}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* 3. CHAT AREA */}
      <div className="relative h-[440px] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-inner">
        {/* FLOATING AI EMOJI REACTION POPUP */}
        {activeReaction && (
          <div
            key={activeReaction.id}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 animate-in zoom-in-75 fade-in slide-in-from-top-4 duration-300 flex items-center gap-2.5 rounded-full border border-indigo-400/40 bg-indigo-950/95 px-5 py-2 shadow-2xl backdrop-blur-md"
          >
            <span className="text-2xl animate-bounce">
              {activeReaction.emoji}
            </span>
            <span className="text-xs font-black tracking-wider text-indigo-200 uppercase">
              {activeReaction.label || activeReaction.mood}
            </span>
          </div>
        )}

        <ScrollArea className="h-full">
          <div className="space-y-6 p-6 sm:p-8">
            {messages.length === 0 && (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center opacity-70">
                <p className="text-sm font-medium text-slate-300">
                  {agentState === "connecting"
                    ? "Connecting to live voice channel..."
                    : "Microphone is live! Just start speaking naturally."}
                </p>
              </div>
            )}

            {messages.map((message) => (
              <FoundationFreestyleChatBubble
                key={message.id}
                message={message}
                aiAvatarUrl={aiAvatarUrl}
                ttsStatus="idle"
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

      {/* 4. BOTTOM LIVE STATUS & ACTION BAR */}
      <div className="shrink-0 flex flex-col md:flex-row gap-4 h-auto md:h-[72px]">
        <div className="flex min-w-0 flex-1 items-center justify-between rounded-2xl md:rounded-3xl bg-slate-900 border border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className={`h-3.5 w-3.5 rounded-full ${
                agentState === "listening"
                  ? "bg-emerald-400 animate-ping"
                  : agentState === "speaking"
                    ? "bg-indigo-400 animate-pulse"
                    : "bg-amber-400"
              }`}
            />
            <span className="text-sm font-extrabold text-white">
              {agentState === "listening"
                ? "Listening (Speak anytime)..."
                : agentState === "speaking"
                  ? "AI Speaking..."
                  : "Connecting voice..."}
            </span>
          </div>

          <TrackToggle
            source={Track.Source.Microphone}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
          >
            <Mic size={14} />
            Toggle Mic
          </TrackToggle>
        </div>

        <button
          onClick={handleFinishSession}
          disabled={isEnding}
          className={`w-full md:w-auto h-[72px] px-8 font-extrabold rounded-2xl md:rounded-3xl text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 ${
            allChunksCompleted
              ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50"
          }`}
        >
          {isEnding
            ? "Saving..."
            : allChunksCompleted
              ? "Mission Complete!"
              : "End Simulation"}{" "}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default function FoundationChat({
  session,
  onEnd,
}: {
  session: any;
  onEnd: () => void;
}) {
  return (
    <LiveKitRoom
      serverUrl={session.livekitUrl}
      token={session.livekitToken}
      connect={true}
      audio={true}
      video={false}
    >
      <LiveKitChatInner session={session} onEnd={onEnd} />
    </LiveKitRoom>
  );
}