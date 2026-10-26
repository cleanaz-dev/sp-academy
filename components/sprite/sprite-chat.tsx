// components/sprite/sprite-chat.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Mic,
  Target,
  Mic2,
  ArrowRight,
  History,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
  Grid,
  Dumbbell,
  FileBarChart,
  Plus,
  MessageSquare,
  Layers,
} from "lucide-react";
import { useSprite } from "@/context/sprite-context";
import { ContextCard } from "./context-card";
import type {
  SpriteSessionData,
  SpriteTurn,
  ContextCardData,
  SpriteAction,
} from "@/lib/schema/sprite-schema";

export interface ChatContextData {
  userName: string;
  nativeLang: string;
  targetLang: string;
  currentLessonTitle: string;
  topWord?: { word: string; translation?: string | null; avgSpokenScore?: number | null } | null;
  topPhrase?: { word: string; translation?: string | null; avgSpokenScore?: number | null } | null;
  recentWords?: { word: string; translation?: string | null; status: string }[] | null;
  avgPronunciation: number;
}

interface SpriteChatProps {
  userId: string;
  initialContext?: ChatContextData;
}

interface ParsedPayload {
  spokenText: string;
  contextCard?: ContextCardData | null;
  action?: SpriteAction | null;
}

function getRawText(m?: UIMessage): string {
  if (!m) return "";
  return m.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function parseMessagePayload(m?: UIMessage): ParsedPayload {
  const raw = getRawText(m);
  if (!raw) return { spokenText: "" };

  const [spokenPart, jsonPart] = raw.split("---JSON---");
  const spokenText = spokenPart.trim();

  if (!jsonPart) {
    return { spokenText };
  }

  try {
    const parsed = JSON.parse(jsonPart.trim());
    return {
      spokenText,
      contextCard: parsed.contextCard || null,
      action: parsed.action || null,
    };
  } catch {
    return { spokenText };
  }
}

function turnsToUIMessages(turns: SpriteTurn[]): UIMessage[] {
  const msgs: UIMessage[] = [];
  for (const t of turns) {
    msgs.push({
      id: `${t.id}-user`,
      role: "user",
      parts: [{ type: "text", text: t.userPrompt }],
    });

    const hasJson = t.contextCard || t.action;
    const rawAssistantText = hasJson
      ? `${t.assistantReply}\n---JSON---\n${JSON.stringify({
          contextCard: t.contextCard,
          action: t.action,
        })}`
      : t.assistantReply;

    msgs.push({
      id: `${t.id}-assistant`,
      role: "assistant",
      parts: [{ type: "text", text: rawAssistantText }],
    });
  }
  return msgs;
}

function groupUIMessagesIntoTurns(messages: UIMessage[]) {
  const turns: { id: string; userMessage?: UIMessage; assistantMessage?: UIMessage }[] = [];
  for (const msg of messages) {
    if (msg.role === "user") {
      turns.push({ id: msg.id, userMessage: msg });
    } else if (msg.role === "assistant") {
      const lastTurn = turns[turns.length - 1];
      if (lastTurn && !lastTurn.assistantMessage) {
        lastTurn.assistantMessage = msg;
      } else {
        turns.push({ id: msg.id, assistantMessage: msg });
      }
    }
  }
  return turns;
}

export function SpriteChat({ userId, initialContext }: SpriteChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"stage" | "briefing" | "sessions">("briefing");

  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
  const [sessionsList, setSessionsList] = useState<SpriteSessionData[]>([]);
  const [selectedTurnIndex, setSelectedTurnIndex] = useState<number | null>(null);
  const [input, setInput] = useState("");

  const { summonSprite, profile } = useSprite();
  const lastSummonedId = useRef<string | null>(null);

  const isVivi = profile?.sprite?.slug === "vivi";
  const spriteName = profile?.sprite?.name ?? (isVivi ? "Vivi" : "Vox");
  const avatarSrc = profile?.sprite?.avatarUrl || (isVivi ? "/sprite-f.png" : "/sprite-m.png");

  const aiBrain: ChatContextData = initialContext || {
    userName: "Student",
    nativeLang: "English",
    targetLang: profile?.targetLanguage || "French",
    currentLessonTitle: "Active Lesson",
    avgPronunciation: 0,
  };

  const apiDossier = {
    ...aiBrain,
    topWord: aiBrain.topWord?.word || "",
    recentWords: aiBrain.recentWords?.map((w) => w.word).join(", ") || "",
  };

  const bodyRef = useRef({ sessionId, spriteName, dossier: apiDossier });
  bodyRef.current = { sessionId, spriteName, dossier: apiDossier };

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/users/${userId}/sprite/chat`,
        body: () => bodyRef.current,
      }),
    [userId]
  );

  const { messages, setMessages, sendMessage, status } = useChat({ transport });
  const isLoading = status === "submitted" || status === "streaming";

  const turns = useMemo(() => groupUIMessagesIntoTurns(messages), [messages]);

  const currentTurnIdx =
    selectedTurnIndex !== null && turns[selectedTurnIndex]
      ? selectedTurnIndex
      : Math.max(0, turns.length - 1);

  const activeTurn = turns[currentTurnIdx];

  const activeAssistantPayload = useMemo(
    () => parseMessagePayload(activeTurn?.assistantMessage),
    [activeTurn?.assistantMessage]
  );

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${userId}/sprite/sessions`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.sessions)) {
        setSessionsList(data.sessions);
      }
    } catch (e) {
      console.error("Failed to fetch sprite sessions:", e);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen, fetchSessions]);

  useEffect(() => {
    if (!isLoading && messages.length > 0 && isOpen) {
      fetchSessions();
    }
  }, [isLoading, messages.length, isOpen, fetchSessions]);

  const startNewSession = () => {
    setSessionId(crypto.randomUUID());
    setMessages([]);
    setSelectedTurnIndex(null);
    setViewMode("briefing");
  };

  const selectSession = (session: SpriteSessionData) => {
    setSessionId(session.id);
    const loadedMessages = turnsToUIMessages(session.turns || []);
    setMessages(loadedMessages);
    setSelectedTurnIndex(null);
    setViewMode("stage");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setSelectedTurnIndex(null);
    setViewMode("stage");
    sendMessage({ text });
    setInput("");
  };

  const triggerPractice = (word: string) => {
    if (isLoading) return;
    setSelectedTurnIndex(null);
    setViewMode("stage");
    sendMessage({ text: `Help me practice how to use "${word}"` });
  };

  useEffect(() => {
    if (isLoading || isOpen) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    const { spokenText } = parseMessagePayload(lastMessage);
    if (spokenText && lastSummonedId.current !== lastMessage.id) {
      lastSummonedId.current = lastMessage.id;
      summonSprite({
        id: lastMessage.id,
        badge: "AI Tutor",
        text: spokenText,
        position: "bottom-left",
        duration: Infinity,
      });
    }
  }, [messages, isLoading, isOpen, summonSprite]);

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3 cursor-pointer group"
            onClick={() => setIsOpen(true)}
          >
            <div className="hidden sm:flex flex-col items-end rounded-2xl border border-teal-500/30 bg-slate-950/90 px-4 py-2.5 text-right shadow-xl backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                {aiBrain.currentLessonTitle}
              </span>
              <span className="text-xs font-bold text-white">Open {spriteName} Assistant</span>
            </div>

            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-teal-400/50 bg-slate-900 shadow-2xl transition-transform group-hover:scale-105">
              <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 94VH TALL DOCKED ASSISTANT DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, x: 40, y: 40 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 40, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 right-0 z-50 flex h-[94vh] w-full sm:w-[580px] md:w-[660px] flex-col overflow-hidden rounded-tl-[36px] border-t border-l border-teal-500/30 bg-[#080C16] shadow-[-24px_-24px_80px_rgba(0,0,0,0.8)]"
            >
              {/* BACKGROUND VECTOR SHAPES & COLOR MESH INSIDE THE WINDOW */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
                viewBox="0 0 660 900"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="spoonGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.35" />
                    <stop offset="50%" stopColor="#6366F1" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="spoonRing" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#818CF8" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                {/* Flowing Organic Wave Ribbon */}
                <path
                  d="M-80 180 C 160 80, 420 280, 720 120 L 720 0 L -80 0 Z"
                  fill="url(#spoonGrad1)"
                />
                {/* Geometric Orbital Rings */}
                <circle cx="580" cy="140" r="180" stroke="url(#spoonRing)" strokeWidth="1.5" strokeDasharray="6 6" />
                <circle cx="580" cy="140" r="120" stroke="url(#spoonRing)" strokeWidth="1" />
                <circle cx="80" cy="760" r="220" stroke="url(#spoonRing)" strokeWidth="1" />
              </svg>

              {/* 1. CLEAN HERO HEADER (Only Avatar, Full Lesson Title, and Close Button) */}
              <div className="relative z-10 overflow-hidden border-b border-white/10 bg-gradient-to-r from-teal-950/80 via-indigo-950/80 to-slate-950/90 px-6 pt-5 pb-4 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 border-teal-400/50 bg-slate-900 shadow-lg shadow-teal-500/20">
                      <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                      <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-teal-400 ring-2 ring-slate-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-extrabold text-white tracking-tight">
                          {spriteName}
                        </h3>
                        <span className="rounded-full bg-teal-400/15 border border-teal-400/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-teal-300">
                          AI Tutor
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-indigo-200/90 mt-0.5">
                        {aiBrain.currentLessonTitle}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/15 hover:text-white transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* 2. NAVIGATION & ACTIONS BAR (Placed cleanly UNDER the header info) */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
                  {/* Left: Segmented View Switcher */}
                  <div className="flex items-center gap-1.5 rounded-2xl bg-slate-950/60 p-1 border border-white/10">
                    <button
                      onClick={() => setViewMode("stage")}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        viewMode === "stage"
                          ? "bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>Stage</span>
                    </button>

                    <button
                      onClick={() => setViewMode("briefing")}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        viewMode === "briefing"
                          ? "bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Target className="h-3.5 w-3.5" />
                      <span>Briefing</span>
                    </button>

                    <button
                      onClick={() => setViewMode("sessions")}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        viewMode === "sessions"
                          ? "bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <History className="h-3.5 w-3.5" />
                      <span>Sessions ({sessionsList.length})</span>
                    </button>
                  </div>

                  {/* Right: + New Session Button */}
                  <button
                    onClick={startNewSession}
                    className="flex items-center gap-1.5 rounded-xl border border-teal-400/40 bg-teal-500/15 px-3.5 py-2 text-xs font-extrabold text-teal-300 hover:bg-teal-500/25 transition shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Session</span>
                  </button>
                </div>

                {/* 3. ASSISTANT TOOL PILLS (Underneath navigation) */}
                <div className="mt-2.5 flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("stage");
                      sendMessage({ text: "Generate my progress report" });
                    }}
                    className="flex items-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/15 px-3.5 py-1.5 text-xs font-bold text-indigo-200 hover:bg-indigo-500/25 transition shrink-0"
                  >
                    <FileBarChart className="h-3.5 w-3.5 text-indigo-300" />
                    <span>Progress Report</span>
                  </button>

                  <Link
                    href="/matrix"
                    className="flex items-center gap-2 rounded-xl border border-teal-400/30 bg-teal-500/15 px-3.5 py-1.5 text-xs font-bold text-teal-200 hover:bg-teal-500/25 transition shrink-0"
                  >
                    <Grid className="h-3.5 w-3.5 text-teal-300" />
                    <span>Word Matrix</span>
                    <ArrowRight className="h-3 w-3 opacity-80" />
                  </Link>

                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-slate-400 opacity-75 cursor-not-allowed shrink-0"
                  >
                    <Dumbbell className="h-3.5 w-3.5 text-slate-400" />
                    <span>Sprite Exercise</span>
                    <span className="rounded-md bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-black uppercase text-amber-300">
                      Soon
                    </span>
                  </button>
                </div>
              </div>

              {/* 4. MAIN WORKSPACE STAGE (Hidden scrollbar for clean native look) */}
              <div className="relative z-10 flex-1 overflow-y-auto p-6 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {viewMode === "sessions" ? (
                  /* ================= VIEW A: SAVED SESSIONS LIST ================= */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Saved Sessions ({sessionsList.length})
                      </span>
                    </div>

                    {sessionsList.length === 0 ? (
                      <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-10 text-center my-auto">
                        <MessageSquare className="h-10 w-10 text-teal-400/60 mx-auto mb-3" />
                        <p className="text-base font-bold text-white">No saved sessions yet</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          Ask {spriteName} a question or practice a priority word to start your first session.
                        </p>
                      </div>
                    ) : (
                      sessionsList.map((sess) => {
                        const isCurrentSession = sess.id === sessionId;
                        const turnCount = Array.isArray(sess.turns) ? sess.turns.length : 0;
                        const lastTurn = turnCount > 0 ? sess.turns[turnCount - 1] : null;

                        return (
                          <button
                            key={sess.id}
                            onClick={() => selectSession(sess)}
                            className={`w-full text-left rounded-2xl border p-4 transition ${
                              isCurrentSession
                                ? "border-teal-500/60 bg-gradient-to-r from-teal-950/40 to-indigo-950/40"
                                : "border-white/10 bg-slate-900/70 hover:border-indigo-500/40 hover:bg-slate-900"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold text-white truncate max-w-[340px]">
                                  {sess.title}
                                </span>
                                {isCurrentSession && (
                                  <span className="rounded-md bg-teal-500/20 border border-teal-500/40 px-2 py-0.5 text-[9px] font-black uppercase text-teal-300">
                                    Active
                                  </span>
                                )}
                              </div>
                              <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 shrink-0">
                                {turnCount} {turnCount === 1 ? "turn" : "turns"}
                              </span>
                            </div>

                            {sess.lessonTitle && (
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                                {sess.lessonTitle}
                              </span>
                            )}

                            {lastTurn && (
                              <p className="text-xs text-slate-300 line-clamp-1">
                                {spriteName}: {lastTurn.assistantReply}
                              </p>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                ) : viewMode === "briefing" || !activeTurn ? (
                  /* ================= VIEW B: BRIEFING & TARGETS STAGE ================= */
                  <div className="flex-1 flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                      {/* Decorative Briefing Banner */}
                      <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-br from-teal-950/50 via-indigo-950/40 to-slate-900/80 p-5 shadow-lg">
                        <div className="relative z-10 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 block mb-1">
                              Active Lesson Briefing
                            </span>
                            <h2 className="text-lg font-extrabold text-white">
                              {aiBrain.currentLessonTitle}
                            </h2>
                          </div>
                          {activeTurn && (
                            <button
                              onClick={() => setViewMode("stage")}
                              className="rounded-xl bg-teal-500/20 border border-teal-400/40 px-3.5 py-2 text-xs font-bold text-teal-200 hover:bg-teal-500/30 transition"
                            >
                              View Active Turn →
                            </button>
                          )}
                        </div>
                      </div>

                      {(aiBrain.topWord || aiBrain.topPhrase) && (
                        <div className="space-y-3 pt-1">
                          <span className="block text-[11px] font-black uppercase tracking-wider text-slate-300">
                            Priority Targets (Click to Launch Drill)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {aiBrain.topWord && (
                              <button
                                onClick={() => triggerPractice(aiBrain.topWord!.word)}
                                className="group relative overflow-hidden flex items-center justify-between rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 p-4 border border-indigo-500/30 hover:border-indigo-400 transition text-left shadow-md"
                              >
                                <div>
                                  <span className="font-extrabold text-white text-base block group-hover:text-indigo-300 transition">
                                    {aiBrain.topWord.word}
                                  </span>
                                  <span className="text-xs text-slate-400 block mt-0.5">
                                    {aiBrain.topWord.translation || "Vocabulary word"}
                                  </span>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                  {aiBrain.topWord.avgSpokenScore != null && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-300">
                                      <Mic2 className="h-3 w-3 inline mr-1" />
                                      {aiBrain.topWord.avgSpokenScore}%
                                    </span>
                                  )}
                                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-indigo-300 transition" />
                                </div>
                              </button>
                            )}

                            {aiBrain.topPhrase && (
                              <button
                                onClick={() => triggerPractice(aiBrain.topPhrase!.word)}
                                className="group relative overflow-hidden flex items-center justify-between rounded-2xl bg-gradient-to-br from-slate-900 to-teal-950/40 p-4 border border-teal-500/30 hover:border-teal-400 transition text-left shadow-md"
                              >
                                <div>
                                  <span className="font-extrabold text-white text-base block group-hover:text-teal-300 transition">
                                    {aiBrain.topPhrase.word}
                                  </span>
                                  <span className="text-xs text-slate-400 block mt-0.5">
                                    {aiBrain.topPhrase.translation || "Key phrase"}
                                  </span>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                  {aiBrain.topPhrase.avgSpokenScore != null && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-teal-500/20 border border-teal-500/30 text-teal-300">
                                      <Mic2 className="h-3 w-3 inline mr-1" />
                                      {aiBrain.topPhrase.avgSpokenScore}%
                                    </span>
                                  )}
                                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-teal-300 transition" />
                                </div>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Center Interactive Launchpad */}
                    <div className="my-auto flex flex-col items-center text-center max-w-md mx-auto py-6">
                      <div className="relative mb-4">
                        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-teal-500/30 to-indigo-500/30 blur-lg" />
                        <div className="relative h-20 w-20 overflow-hidden rounded-3xl border-2 border-teal-400/50 bg-slate-900 shadow-2xl">
                          <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                        </div>
                      </div>
                      <h3 className="text-base font-extrabold text-white mb-1">
                        Ready to practice, {aiBrain.userName}?
                      </h3>
                      <p className="text-xs text-slate-300 mb-5">
                        Launch a guided grammar card or start a 1-on-1 quiz session below.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setViewMode("stage");
                            sendMessage({
                              text: `Give me a grammar breakdown for ${aiBrain.currentLessonTitle}`,
                            });
                          }}
                          className="rounded-2xl border border-indigo-400/40 bg-indigo-500/15 px-4 py-2.5 text-xs font-bold text-indigo-200 hover:bg-indigo-500/25 transition shadow-sm"
                        >
                          ✨ Explain Lesson Grammar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setViewMode("stage");
                            sendMessage({
                              text: `Quiz me on ${aiBrain.currentLessonTitle}`,
                            });
                          }}
                          className="rounded-2xl border border-teal-400/40 bg-teal-500/15 px-4 py-2.5 text-xs font-bold text-teal-200 hover:bg-teal-500/25 transition shadow-sm"
                        >
                          🎯 Start 1-on-1 Quiz
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ================= VIEW C: 1-TO-1 ACTIVE STAGE ================= */
                  <motion.div
                    key={activeTurn.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col gap-5"
                  >
                    {/* 1. User Prompt Bar + < Turn X / Y > Stepper */}
                    {activeTurn.userMessage && (
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-400/30 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-teal-950/40 px-5 py-3.5 shrink-0 shadow-md">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="rounded-lg bg-indigo-500/30 border border-indigo-400/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-200 shrink-0">
                            You
                          </span>
                          <p className="text-sm font-bold text-white truncate">
                            &ldquo;{getRawText(activeTurn.userMessage)}&rdquo;
                          </p>
                        </div>

                        {turns.length > 1 && (
                          <div className="flex items-center gap-1 rounded-xl bg-slate-950/80 border border-white/15 px-2.5 py-1 shrink-0">
                            <button
                              type="button"
                              disabled={currentTurnIdx === 0}
                              onClick={() => setSelectedTurnIndex(Math.max(0, currentTurnIdx - 1))}
                              className="p-0.5 text-slate-300 hover:text-teal-300 disabled:opacity-30"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-[11px] font-black text-teal-300 px-1.5">
                              {currentTurnIdx + 1} / {turns.length}
                            </span>
                            <button
                              type="button"
                              disabled={currentTurnIdx === turns.length - 1}
                              onClick={() =>
                                setSelectedTurnIndex(Math.min(turns.length - 1, currentTurnIdx + 1))
                              }
                              className="p-0.5 text-slate-300 hover:text-teal-300 disabled:opacity-30"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. Assistant 1-to-1 Main Stage Card */}
                    <div className="flex-1 flex flex-col justify-between rounded-3xl border border-teal-500/25 bg-gradient-to-b from-slate-900/90 via-[#0B1020]/95 to-indigo-950/30 p-6 shadow-2xl">
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border-2 border-teal-400/40 bg-slate-800 shadow-lg">
                            <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                          </div>
                          <div className="flex-1 pt-0.5">
                            <span className="text-[11px] font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5 mb-1.5">
                              <Sparkles className="h-3.5 w-3.5" /> {spriteName}
                            </span>

                            {activeAssistantPayload.spokenText ? (
                              <p className="text-lg font-semibold text-white leading-relaxed">
                                {activeAssistantPayload.spokenText}
                              </p>
                            ) : isLoading ? (
                              <div className="flex items-center gap-2 py-3">
                                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.3s]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400" />
                                <span className="text-xs font-medium text-slate-400 ml-1">
                                  Thinking...
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* ContextCard Component */}
                        {activeAssistantPayload.contextCard && (
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <ContextCard
                              title={activeAssistantPayload.contextCard.title}
                              grammarRule={activeAssistantPayload.contextCard.grammarRule}
                              examples={activeAssistantPayload.contextCard.examples || []}
                            />
                          </motion.div>
                        )}

                        {/* Action Status Pill */}
                        {activeAssistantPayload.action && (
                          <div className="flex items-center justify-between rounded-2xl border border-teal-400/40 bg-gradient-to-r from-teal-950/60 to-indigo-950/40 px-4 py-3 text-xs font-bold text-teal-200 shadow-md">
                            <div className="flex items-center gap-2.5">
                              <Zap className="h-4 w-4 text-teal-400" />
                              <span>
                                Action Triggered: {activeAssistantPayload.action.type}{" "}
                                {activeAssistantPayload.action.targetWord
                                  ? `(${activeAssistantPayload.action.targetWord})`
                                  : ""}
                              </span>
                            </div>
                            <span className="rounded-full bg-teal-400/20 border border-teal-400/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-teal-300">
                              Active
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Stage Footer */}
                      <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-6">
                        <button
                          type="button"
                          onClick={() => setViewMode("briefing")}
                          className="text-xs font-bold text-slate-300 hover:text-teal-300 transition flex items-center gap-1.5"
                        >
                          <Target className="h-3.5 w-3.5 text-teal-400" />
                          <span>Practice priority words</span>
                        </button>

                        <button
                          type="button"
                          onClick={startNewSession}
                          className="text-xs font-bold text-indigo-300 hover:text-white transition flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Start New Session
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 5. INPUT COMMAND BAR */}
              <div className="relative z-10 border-t border-white/10 bg-slate-950/90 px-6 py-4 shrink-0">
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2 rounded-2xl border border-indigo-500/30 bg-slate-900/90 px-3.5 py-2 transition-colors focus-within:border-teal-400 shadow-inner"
                >
                  <button
                    type="button"
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-teal-300"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask ${spriteName} in ${aiBrain.targetLang}...`}
                    disabled={isLoading}
                    maxLength={1000}
                    className="w-full bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 p-2.5 text-white shadow-md shadow-indigo-600/30 transition hover:opacity-95 disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}