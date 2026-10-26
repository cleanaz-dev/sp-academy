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
  Compass,
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
  const [viewMode, setViewMode] = useState<"stage" | "history">("stage");
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

  // Only summon the bottom-left sprite toast when the drawer is CLOSED
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
            <div className="hidden sm:flex flex-col items-end rounded-2xl border border-primary/40 bg-slate-950/90 px-4 py-2.5 text-right shadow-xl backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-accent">
                {aiBrain.currentLessonTitle}
              </span>
              <span className="text-xs font-bold text-white">Launch {spriteName} Assistant</span>
            </div>

            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-primary/50 bg-slate-900 shadow-2xl transition-transform group-hover:scale-105">
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
              className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, x: 40, y: 40 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 40, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 right-0 z-50 flex h-[85vh] w-full sm:w-[540px] md:w-[620px] flex-col overflow-hidden rounded-tl-[32px] border-t border-l border-primary/30 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 shadow-[-24px_-24px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
            >
              {/* AMBIENT THEME GLOWS */}
              <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="pointer-events-none absolute top-1/3 -right-24 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-tertiary/10 blur-3xl" />

              {/* 1. HEADER */}
              <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-6 py-4 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-primary/50 bg-slate-800 shadow-lg shadow-primary/20">
                    <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                    <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-slate-950" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white tracking-tight">
                        {spriteName}
                      </h3>
                      <span className="rounded-full bg-primary/20 border border-primary/40 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary">
                        AI Co-Pilot
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-300 truncate max-w-[240px]">
                      {aiBrain.currentLessonTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {turns.length > 0 && (
                    <button
                      onClick={() => setViewMode(viewMode === "stage" ? "history" : "stage")}
                      className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs font-bold text-white hover:bg-primary/20 hover:border-primary/40 transition"
                    >
                      {viewMode === "history" ? (
                        <>
                          <ChevronLeft className="h-3.5 w-3.5 text-primary" /> Active Stage
                        </>
                      ) : (
                        <>
                          <History className="h-3.5 w-3.5 text-accent" /> History ({turns.length})
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* 2. PERSISTENT ASSISTANT ACTION BAR (Word Matrix + Generate Sprite Exercise) */}
              <div className="relative z-10 grid grid-cols-2 gap-3 border-b border-white/10 bg-slate-900/60 px-6 py-3 shrink-0">
                <Link
                  href="/matrix"
                  className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/20 via-secondary/10 to-transparent p-3 transition hover:border-primary hover:from-primary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/25 text-primary border border-primary/30 shadow-inner">
                      <Grid className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold text-white group-hover:text-primary transition">
                        Word Matrix
                      </span>
                      <span className="block text-[10px] font-medium text-slate-400">
                        Open vocab network
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </Link>

                <button
                  type="button"
                  disabled
                  className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-tertiary/30 bg-gradient-to-r from-tertiary/15 via-accent/5 to-transparent p-3 text-left opacity-80 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tertiary/20 text-tertiary border border-tertiary/30">
                      <Dumbbell className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold text-white">
                        Sprite Exercise
                      </span>
                      <span className="inline-block rounded bg-accent/20 border border-accent/30 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider text-accent mt-0.5">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {/* 3. MAIN WORKSPACE STAGE */}
              <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                {viewMode === "history" ? (
                  /* HISTORY LOG VIEW */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Session History
                      </span>
                      {selectedTurnIndex !== null && (
                        <button
                          onClick={() => {
                            setSelectedTurnIndex(null);
                            setViewMode("stage");
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          <RotateCcw className="h-3 w-3" /> Return to Latest
                        </button>
                      )}
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
                          className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-primary/50 hover:bg-primary/10 transition"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                              Interaction #{idx + 1}
                            </span>
                            {contextCard && (
                              <span className="rounded-md bg-accent/20 border border-accent/30 px-2 py-0.5 text-[10px] font-bold text-accent">
                                {contextCard.title}
                              </span>
                            )}
                          </div>
                          {userText && (
                            <p className="text-xs font-bold text-white truncate">You: {userText}</p>
                          )}
                          {spokenText && (
                            <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                              {spriteName}: {spokenText}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* ACTIVE 1-TO-1 ASSISTANT STAGE */
                  <>
                    {/* ACTIVE TURN (Sized to content — NO giant empty black void!) */}
                    {activeTurn && (
                      <motion.div
                        key={activeTurn.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        {/* User Prompt Pill */}
                        {activeTurn.userMessage && (
                          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary/25 via-secondary/15 to-transparent border border-primary/40 px-4 py-3 shadow-sm">
                            <span className="text-sm font-bold text-white">
                              &ldquo;{getRawText(activeTurn.userMessage)}&rdquo;
                            </span>
                            <span className="rounded-lg bg-primary/30 border border-primary/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shrink-0 ml-3">
                              You
                            </span>
                          </div>
                        )}

                        {/* Assistant Response Card (Wraps tightly around content + components) */}
                        <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-5 shadow-xl space-y-4">
                          <div className="flex items-start gap-3.5">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-accent/40 bg-slate-800 shadow-md">
                              <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                            </div>
                            <div className="flex-1">
                              <span className="text-[11px] font-black uppercase tracking-wider text-accent flex items-center gap-1 mb-1">
                                <Sparkles className="h-3 w-3" /> {spriteName}
                              </span>

                              {activeAssistantPayload.spokenText ? (
                                <p className="text-base font-medium text-white leading-relaxed">
                                  {activeAssistantPayload.spokenText}
                                </p>
                              ) : isLoading ? (
                                <div className="flex gap-1.5 py-2">
                                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                                  <span className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:-0.15s]" />
                                  <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {/* Dynamic Component Slot: ContextCard */}
                          {activeAssistantPayload.contextCard && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="pt-1"
                            >
                              <ContextCard
                                title={activeAssistantPayload.contextCard.title}
                                grammarRule={activeAssistantPayload.contextCard.grammarRule}
                                examples={activeAssistantPayload.contextCard.examples || []}
                              />
                            </motion.div>
                          )}

                          {/* Dynamic Action Triggered Pill */}
                          {activeAssistantPayload.action && (
                            <div className="flex items-center justify-between rounded-2xl border border-accent/40 bg-accent/15 px-4 py-3 text-xs font-bold text-accent">
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                <span>
                                  Action Triggered: {activeAssistantPayload.action.type}{" "}
                                  {activeAssistantPayload.action.targetWord
                                    ? `(${activeAssistantPayload.action.targetWord})`
                                    : ""}
                                </span>
                              </div>
                              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] uppercase">
                                Active
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* TUTOR BRIEFING & PRIORITY TARGETS (Stays accessible below the active response so the stage never looks empty!) */}
                    <div className="rounded-3xl border border-secondary/30 bg-gradient-to-br from-secondary/15 via-primary/10 to-transparent p-5 shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-secondary" />
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            Tutor Briefing & Targets
                          </h4>
                        </div>
                        <span className="rounded-full bg-secondary/20 border border-secondary/40 px-2.5 py-0.5 text-[10px] font-bold text-secondary">
                          Click to Drill
                        </span>
                      </div>

                      {(aiBrain.topWord || aiBrain.topPhrase) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {aiBrain.topWord && (
                            <button
                              onClick={() => triggerPractice(aiBrain.topWord!.word)}
                              className="group flex items-center justify-between rounded-2xl bg-slate-900/70 p-3.5 border border-white/10 hover:border-primary hover:bg-primary/15 transition text-left shadow-sm"
                            >
                              <div>
                                <span className="font-extrabold text-white text-sm block group-hover:text-primary transition">
                                  {aiBrain.topWord.word}
                                </span>
                                <span className="text-xs text-slate-300 block mt-0.5">
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
                                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-primary transition" />
                              </div>
                            </button>
                          )}

                          {aiBrain.topPhrase && (
                            <button
                              onClick={() => triggerPractice(aiBrain.topPhrase!.word)}
                              className="group flex items-center justify-between rounded-2xl bg-slate-900/70 p-3.5 border border-white/10 hover:border-accent hover:bg-accent/15 transition text-left shadow-sm"
                            >
                              <div>
                                <span className="font-extrabold text-white text-sm block group-hover:text-accent transition">
                                  {aiBrain.topPhrase.word}
                                </span>
                                <span className="text-xs text-slate-300 block mt-0.5">
                                  {aiBrain.topPhrase.translation || "Key phrase"}
                                </span>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                {aiBrain.topPhrase.avgSpokenScore != null && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-accent/20 border border-accent/30 text-accent">
                                    <Mic2 className="h-3 w-3 inline mr-1" />
                                    {aiBrain.topPhrase.avgSpokenScore}%
                                  </span>
                                )}
                                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-accent transition" />
                              </div>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Quick Suggested Assistant Prompts */}
                      <div className="pt-1">
                        <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                          Quick Assistant Actions
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              sendMessage({
                                text: `Give me a quick grammar breakdown for ${aiBrain.currentLessonTitle}`,
                              })
                            }
                            className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/25 transition"
                          >
                            <Compass className="h-3.5 w-3.5 text-primary" /> Explain Lesson Grammar
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              sendMessage({
                                text: `Quiz me on one phrase from ${aiBrain.currentLessonTitle}`,
                              })
                            }
                            className="flex items-center gap-1.5 rounded-xl border border-tertiary/30 bg-tertiary/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-tertiary/25 transition"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-tertiary" /> Quick 1-Question Quiz
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 4. INPUT COMMAND BAR */}
              <div className="relative z-10 border-t border-white/10 bg-slate-900/90 px-6 py-4 shrink-0">
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/90 px-3 py-2 shadow-inner transition-colors focus-within:border-primary"
                >
                  <button
                    type="button"
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-accent"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask ${spriteName} or command an action in ${aiBrain.targetLang}...`}
                    disabled={isLoading}
                    maxLength={1000}
                    className="w-full bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-primary/30 transition hover:opacity-90 disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
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