// components/sprite/sprite-chat.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
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
  Zap,
  RotateCcw,
  Grid,
  Dumbbell,
  FileBarChart,
} from "lucide-react";
import { useSprite } from "@/context/sprite-context";
import { ContextCard } from "./context-card";

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
  contextCard?: {
    title: string;
    grammarRule: string;
    examples: { french: string; english: string }[];
  } | null;
  action?: {
    type: string;
    targetWord?: string;
  } | null;
}

interface ConversationTurn {
  id: string;
  userMessage?: UIMessage;
  assistantMessage?: UIMessage;
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

function groupMessagesIntoTurns(messages: UIMessage[]): ConversationTurn[] {
  const turns: ConversationTurn[] = [];
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
  // 3 clean views: "stage" (1-to-1 message), "briefing" (targets & quick prompts), "history" (past turns)
  const [viewMode, setViewMode] = useState<"stage" | "briefing" | "history">("briefing");
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

  const bodyRef = useRef({ spriteName, dossier: apiDossier });
  bodyRef.current = { spriteName, dossier: apiDossier };

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/users/${userId}/sprite/chat`,
        body: () => bodyRef.current,
      }),
    [userId],
  );

  const { messages, sendMessage, status } = useChat({ transport });
  const isLoading = status === "submitted" || status === "streaming";

  const turns = useMemo(() => groupMessagesIntoTurns(messages), [messages]);

  const activeTurn =
    selectedTurnIndex !== null && turns[selectedTurnIndex]
      ? turns[selectedTurnIndex]
      : turns[turns.length - 1];

  const activeAssistantPayload = useMemo(
    () => parseMessagePayload(activeTurn?.assistantMessage),
    [activeTurn?.assistantMessage],
  );

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

  // Only summon bottom-left sprite toast when the drawer is CLOSED
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
            <div className="hidden sm:flex flex-col items-end rounded-2xl border border-indigo-500/30 bg-slate-950/90 px-4 py-2.5 text-right shadow-xl backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                {aiBrain.currentLessonTitle}
              </span>
              <span className="text-xs font-bold text-white">Open {spriteName} Assistant</span>
            </div>

            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-indigo-500/50 bg-slate-900 shadow-2xl transition-transform group-hover:scale-105">
              <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 85VH DOCKED ASSISTANT DRAWER (Glued to bottom-0 & right-0) */}
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
              className="fixed bottom-0 right-0 z-50 flex h-[85vh] w-full sm:w-[540px] md:w-[600px] flex-col overflow-hidden rounded-tl-[32px] border-t border-l border-indigo-500/30 bg-[#0B0F19] shadow-[-20px_-20px_60px_rgba(0,0,0,0.7)]"
            >
              {/* SUBTLE COHESIVE SPOON GLOW (Indigo & Teal only) */}
              <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-indigo-600/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />

              {/* 1. HEADER & NAVIGATION TABS */}
              <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] bg-slate-900/50 px-6 py-4 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-indigo-500/40 bg-slate-800">
                    <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                    <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-teal-400 ring-2 ring-slate-950" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{spriteName}</h3>
                      <span className="rounded-md bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-indigo-300">
                        Assistant
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-400 truncate max-w-[200px]">
                      {aiBrain.currentLessonTitle}
                    </p>
                  </div>
                </div>

                {/* View Switcher Pills (Stage / Targets / History) */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewMode(viewMode === "briefing" ? (activeTurn ? "stage" : "briefing") : "briefing")}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition border ${
                      viewMode === "briefing"
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                        : "bg-slate-800/70 text-slate-300 border-white/10 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Target className="h-3.5 w-3.5" />
                    <span>Briefing</span>
                  </button>

                  {turns.length > 0 && (
                    <button
                      onClick={() => setViewMode(viewMode === "history" ? "stage" : "history")}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition border ${
                        viewMode === "history"
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                          : "bg-slate-800/70 text-slate-300 border-white/10 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <History className="h-3.5 w-3.5" />
                      <span>{turns.length}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsOpen(false)}
                    className="ml-1 rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* 2. SLEEK ACTION TOOLBAR (Progress Report • Word Matrix • Exercise) */}
              <div className="relative z-10 flex items-center gap-2 border-b border-white/[0.06] bg-slate-900/30 px-6 py-2.5 shrink-0 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("stage");
                    sendMessage({ text: "Generate my progress report" });
                  }}
                  className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-200 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition shrink-0"
                >
                  <FileBarChart className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Progress Report</span>
                </button>

                <Link
                  href="/matrix"
                  className="flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-bold text-teal-200 hover:bg-teal-500/20 hover:border-teal-500/50 transition shrink-0"
                >
                  <Grid className="h-3.5 w-3.5 text-teal-400" />
                  <span>Word Matrix</span>
                  <ArrowRight className="h-3 w-3 opacity-70" />
                </Link>

                <button
                  type="button"
                  disabled
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-400 opacity-70 cursor-not-allowed shrink-0"
                >
                  <Dumbbell className="h-3.5 w-3.5 text-slate-500" />
                  <span>Sprite Exercise</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] font-black uppercase text-slate-300">
                    Soon
                  </span>
                </button>
              </div>

              {/* 3. FULL-HEIGHT MAIN CANVAS (100% Dedicated to the active view) */}
              <div className="relative z-10 flex-1 overflow-y-auto p-6 flex flex-col">
                {viewMode === "history" ? (
                  /* ================= VIEW A: HISTORY LIST ================= */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Conversation History ({turns.length})
                      </span>
                      <button
                        onClick={() => {
                          setSelectedTurnIndex(null);
                          setViewMode("stage");
                        }}
                        className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" /> Back to Active Stage
                      </button>
                    </div>

                    {turns.map((turn, idx) => {
                      const userText = getRawText(turn.userMessage);
                      const { spokenText, contextCard } = parseMessagePayload(turn.assistantMessage);

                      return (
                        <button
                          key={turn.id}
                          onClick={() => {
                            setSelectedTurnIndex(idx);
                            setViewMode("stage");
                          }}
                          className="w-full text-left rounded-2xl border border-white/10 bg-slate-900/70 p-4 hover:border-indigo-500/50 hover:bg-slate-900 transition"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                              Turn #{idx + 1}
                            </span>
                            {contextCard && (
                              <span className="rounded-md bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                                {contextCard.title}
                              </span>
                            )}
                          </div>
                          {userText && (
                            <p className="text-xs font-bold text-white truncate">You: &ldquo;{userText}&rdquo;</p>
                          )}
                          {spokenText && (
                            <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                              {spriteName}: {spokenText}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : viewMode === "briefing" || !activeTurn ? (
                  /* ================= VIEW B: BRIEFING & TARGETS STAGE ================= */
                  <div className="flex-1 flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 block mb-1">
                            Current Lesson Focus
                          </span>
                          <h2 className="text-lg font-extrabold text-white">
                            {aiBrain.currentLessonTitle}
                          </h2>
                        </div>
                        {activeTurn && (
                          <button
                            onClick={() => setViewMode("stage")}
                            className="flex items-center gap-1 rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/30"
                          >
                            Return to Message →
                          </button>
                        )}
                      </div>

                      {/* Priority Targets */}
                      {(aiBrain.topWord || aiBrain.topPhrase) && (
                        <div className="space-y-2.5 pt-2">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Priority Targets (Click to Launch Drill)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {aiBrain.topWord && (
                              <button
                                onClick={() => triggerPractice(aiBrain.topWord!.word)}
                                className="group flex items-center justify-between rounded-2xl bg-slate-900/90 p-4 border border-white/10 hover:border-indigo-500/60 hover:bg-indigo-950/30 transition text-left"
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
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400">
                                      <Mic2 className="h-3 w-3 inline mr-1" />
                                      {aiBrain.topWord.avgSpokenScore}%
                                    </span>
                                  )}
                                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
                                </div>
                              </button>
                            )}

                            {aiBrain.topPhrase && (
                              <button
                                onClick={() => triggerPractice(aiBrain.topPhrase!.word)}
                                className="group flex items-center justify-between rounded-2xl bg-slate-900/90 p-4 border border-white/10 hover:border-teal-500/60 hover:bg-teal-950/20 transition text-left"
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
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-400">
                                      <Mic2 className="h-3 w-3 inline mr-1" />
                                      {aiBrain.topPhrase.avgSpokenScore}%
                                    </span>
                                  )}
                                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-teal-400 transition" />
                                </div>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Center Prompt Suggestions */}
                    <div className="my-auto flex flex-col items-center text-center max-w-sm mx-auto py-6">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-900 mb-3 shadow-xl">
                        <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1">
                        Ready when you are, {aiBrain.userName}
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">
                        Select a target above or trigger a quick lesson action below.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setViewMode("stage");
                            sendMessage({
                              text: `Give me a grammar breakdown for ${aiBrain.currentLessonTitle}`,
                            });
                          }}
                          className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition"
                        >
                          Explain Lesson Grammar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setViewMode("stage");
                            sendMessage({
                              text: `Quiz me on ${aiBrain.currentLessonTitle}`,
                            });
                          }}
                          className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-3.5 py-2 text-xs font-bold text-teal-300 hover:bg-teal-500/20 transition"
                        >
                          Quick 1-Question Quiz
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ================= VIEW C: TRUE 1-TO-1 FULL STAGE ================= */
                  <motion.div
                    key={activeTurn.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col justify-between gap-6"
                  >
                    {/* 1. User Prompt Bar at Top of Stage */}
                    {activeTurn.userMessage && (
                      <div className="flex items-center justify-between rounded-2xl border border-indigo-500/30 bg-indigo-950/30 px-5 py-3.5 shrink-0">
                        <div className="flex items-center gap-3">
                          <span className="rounded-md bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-300">
                            You
                          </span>
                          <p className="text-sm font-semibold text-white">
                            &ldquo;{getRawText(activeTurn.userMessage)}&rdquo;
                          </p>
                        </div>
                        {turns.length > 1 && (
                          <span className="text-[10px] font-bold text-slate-400">
                            Turn {(selectedTurnIndex ?? turns.length - 1) + 1} of {turns.length}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 2. Assistant 1-to-1 Main Stage (Takes up the rest of the screen) */}
                    <div className="flex-1 flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-inner">
                      <div className="space-y-6">
                        {/* Vox Spoken Response */}
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-indigo-500/40 bg-slate-800 shadow-lg">
                            <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                          </div>
                          <div className="flex-1 pt-0.5">
                            <span className="text-[11px] font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5 mb-2">
                              <Sparkles className="h-3.5 w-3.5" /> {spriteName}
                            </span>

                            {activeAssistantPayload.spokenText ? (
                              <p className="text-lg font-medium text-white leading-relaxed">
                                {activeAssistantPayload.spokenText}
                              </p>
                            ) : isLoading ? (
                              <div className="flex items-center gap-2 py-3">
                                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400" />
                                <span className="text-xs font-medium text-slate-400 ml-1">
                                  Thinking...
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Rendered Component Slot (ContextCard / ReportCard) */}
                        {activeAssistantPayload.contextCard && (
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pt-2"
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
                          <div className="flex items-center justify-between rounded-2xl border border-teal-500/30 bg-teal-950/30 px-4 py-3 text-xs font-bold text-teal-300">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-teal-400" />
                              <span>
                                Action Triggered: {activeAssistantPayload.action.type}{" "}
                                {activeAssistantPayload.action.targetWord
                                  ? `(${activeAssistantPayload.action.targetWord})`
                                  : ""}
                              </span>
                            </div>
                            <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] uppercase">
                              Active
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Subtle contextual footer inside the stage */}
                      <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-6">
                        <button
                          type="button"
                          onClick={() => setViewMode("briefing")}
                          className="text-xs font-bold text-slate-400 hover:text-indigo-300 transition flex items-center gap-1.5"
                        >
                          <Target className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Practice priority words</span>
                        </button>

                        {selectedTurnIndex !== null && (
                          <button
                            type="button"
                            onClick={() => setSelectedTurnIndex(null)}
                            className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1"
                          >
                            <RotateCcw className="h-3 w-3" /> Back to latest turn
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 4. INPUT COMMAND BAR */}
              <div className="relative z-10 border-t border-white/[0.08] bg-slate-900/80 px-6 py-4 shrink-0">
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-950 px-3 py-2 transition-colors focus-within:border-indigo-500"
                >
                  <button
                    type="button"
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
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
                    className="w-full bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="flex items-center justify-center rounded-xl bg-indigo-600 p-2.5 text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-40"
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