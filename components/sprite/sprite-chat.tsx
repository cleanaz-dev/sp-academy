// components/sprite/sprite-chat.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
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
} from "lucide-react";
import { useSprite } from "@/context/sprite-context";
import { ContextCard } from "./context-card"; // Adjust import path to your ContextCard

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

interface ConversationTurn {
  id: string;
  userMessage?: UIMessage;
  assistantMessage?: UIMessage;
}

// Extract plain text from AI SDK v5+ message parts
function getText(m?: UIMessage): string {
  if (!m) return "";
  return m.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("");
}

// Group flat messages into 1-to-1 Request/Response turns
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

  // Always show the latest turn unless the user clicked a specific historical turn
  const activeTurn =
    selectedTurnIndex !== null && turns[selectedTurnIndex]
      ? turns[selectedTurnIndex]
      : turns[turns.length - 1];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setSelectedTurnIndex(null); // Snap back to live turn
    setViewMode("stage");
    sendMessage({ text });
    setInput("");
  };

  const triggerPractice = (word: string) => {
    if (isLoading) return;
    setSelectedTurnIndex(null);
    setViewMode("stage");
    sendMessage({ text: `Help me practice how to use "${word}" and show me examples.` });
  };

  useEffect(() => {
    if (isLoading) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    const text = getText(lastMessage);
    if (text && lastSummonedId.current !== lastMessage.id) {
      lastSummonedId.current = lastMessage.id;
      summonSprite({
        id: lastMessage.id,
        badge: "AI Tutor",
        text,
        position: "bottom-left",
        duration: Infinity,
      });
    }
  }, [messages, isLoading, summonSprite]);

  // Helper to render dynamic tool/component parts inside the Assistant Stage
  const renderAssistantComponents = (m?: UIMessage) => {
    if (!m) return null;

    return m.parts.map((part: any, index: number) => {
      // Compatibility across AI SDK 5/6 tool part structures
      const isGrammarTool =
        part.type === "tool-showGrammarCard" ||
        (part.type === "tool-invocation" && part.toolInvocation?.toolName === "showGrammarCard");

      const isActionTool =
        part.type === "tool-triggerBackendAction" ||
        (part.type === "tool-invocation" && part.toolInvocation?.toolName === "triggerBackendAction");

      if (isGrammarTool) {
        const output = part.output ?? part.toolInvocation?.result;
        if (!output) {
          return (
            <div key={index} className="animate-pulse rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-5 text-xs text-indigo-300">
              Generating grammar card...
            </div>
          );
        }
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <ContextCard
              title={output.title}
              grammarRule={output.grammarRule}
              examples={output.examples || []}
            />
          </motion.div>
        );
      }

      if (isActionTool) {
        const output = part.output ?? part.toolInvocation?.result;
        if (!output) {
          return (
            <div key={index} className="flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-950/20 px-4 py-3 text-xs text-teal-300">
              <Zap className="h-4 w-4 animate-spin" /> Running action...
            </div>
          );
        }
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between rounded-2xl border border-teal-500/40 bg-teal-950/30 px-4 py-3 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-teal-400">
                  Action Dispatched • {output.actionType}
                </span>
                <span className="text-xs font-semibold text-white">
                  Target: &ldquo;{output.targetWord}&rdquo;
                </span>
              </div>
            </div>
            <span className="rounded-full bg-teal-500/20 px-2.5 py-1 text-[10px] font-bold text-teal-300">
              Synced
            </span>
          </motion.div>
        );
      }

      return null;
    });
  };

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
            <div className="hidden sm:flex flex-col items-end rounded-2xl border border-indigo-500/30 bg-slate-950/90 px-3.5 py-2 text-right shadow-xl backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                {aiBrain.currentLessonTitle}
              </span>
              <span className="text-xs font-bold text-white">Ask {spriteName}</span>
            </div>

            <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white/40 bg-slate-900 shadow-2xl transition-transform group-hover:scale-105">
              <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 80VH ASSISTANT DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* 80vh Drawer Container */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="fixed bottom-0 right-0 left-0 md:left-auto md:right-6 md:bottom-4 z-50 flex h-[82vh] w-full md:w-[680px] max-w-full flex-col overflow-hidden rounded-t-3xl md:rounded-3xl border border-indigo-500/30 bg-slate-950/95 shadow-2xl shadow-indigo-950/80 backdrop-blur-2xl"
            >
              {/* TOP HEADER BAR */}
              <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/70 px-6 py-4 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-indigo-400/40 bg-slate-800 shadow-md">
                    <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                    <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-teal-400 ring-2 ring-slate-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{spriteName}</h3>
                      <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-300 border border-indigo-500/30">
                        AI Assistant
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-400 truncate max-w-[260px]">
                      Objective: {aiBrain.currentLessonTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* View History Toggle Button */}
                  {turns.length > 0 && (
                    <button
                      onClick={() => setViewMode(viewMode === "stage" ? "history" : "stage")}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition border ${
                        viewMode === "history"
                          ? "bg-indigo-600 text-white border-indigo-400"
                          : "bg-slate-800/80 text-slate-300 border-white/10 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {viewMode === "history" ? (
                        <>
                          <ChevronLeft className="h-3.5 w-3.5" /> Active Stage
                        </>
                      ) : (
                        <>
                          <History className="h-3.5 w-3.5" /> History ({turns.length})
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* MAIN STAGE OR HISTORY VIEW */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                {viewMode === "history" ? (
                  /* ================= HISTORY DRAWER VIEW ================= */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Session History ({turns.length} turns)
                      </h4>
                      {selectedTurnIndex !== null && (
                        <button
                          onClick={() => {
                            setSelectedTurnIndex(null);
                            setViewMode("stage");
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                        >
                          <RotateCcw className="h-3 w-3" /> Jump to Latest
                        </button>
                      )}
                    </div>

                    {turns.map((turn, idx) => {
                      const userText = getText(turn.userMessage);
                      const assistantText = getText(turn.assistantMessage);
                      const isCurrent =
                        (selectedTurnIndex === null && idx === turns.length - 1) ||
                        selectedTurnIndex === idx;

                      return (
                        <button
                          key={turn.id}
                          onClick={() => {
                            setSelectedTurnIndex(idx);
                            setViewMode("stage");
                          }}
                          className={`w-full text-left rounded-2xl p-4 transition border ${
                            isCurrent
                              ? "border-indigo-500/60 bg-indigo-950/40"
                              : "border-white/10 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                              Turn #{idx + 1}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              Click to inspect on stage →
                            </span>
                          </div>
                          {userText && (
                            <p className="text-xs font-bold text-white truncate mb-1">
                              You: &ldquo;{userText}&rdquo;
                            </p>
                          )}
                          {assistantText && (
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {spriteName}: {assistantText}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : !activeTurn ? (
                  /* ================= ZERO STATE / BRIEFING STAGE ================= */
                  <div className="flex h-full flex-col justify-between gap-6">
                    <div className="my-auto flex flex-col items-center text-center max-w-md mx-auto">
                      <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-3xl border-2 border-indigo-500/40 bg-slate-900 shadow-2xl">
                        <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                      </div>
                      <h2 className="text-xl font-bold text-white mb-2">
                        How can I help you with {aiBrain.targetLang} today?
                      </h2>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        Ask for grammar breakdowns, pronunciation drills, or click a priority target below to launch an interactive card.
                      </p>
                    </div>

                    {/* Priority Targets Briefing */}
                    {(aiBrain.topWord || aiBrain.topPhrase) && (
                      <div className="rounded-3xl border border-indigo-500/30 bg-indigo-950/20 p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="h-4 w-4 text-indigo-400" />
                          <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                            Recommended Practice Targets
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {aiBrain.topWord && (
                            <button
                              onClick={() => triggerPractice(aiBrain.topWord!.word)}
                              className="group flex items-center justify-between rounded-2xl bg-slate-900/80 p-3.5 border border-slate-700/60 hover:border-indigo-500 hover:bg-indigo-950/40 transition text-left"
                            >
                              <div>
                                <span className="font-bold text-white text-sm block group-hover:text-indigo-300">
                                  {aiBrain.topWord.word}
                                </span>
                                <span className="text-xs text-slate-400 block mt-0.5">
                                  {aiBrain.topWord.translation || "Vocabulary word"}
                                </span>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {aiBrain.topWord.avgSpokenScore != null && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400">
                                    <Mic2 className="h-3 w-3 inline mr-1" />
                                    {aiBrain.topWord.avgSpokenScore}%
                                  </span>
                                )}
                                <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400" />
                              </div>
                            </button>
                          )}

                          {aiBrain.topPhrase && (
                            <button
                              onClick={() => triggerPractice(aiBrain.topPhrase!.word)}
                              className="group flex items-center justify-between rounded-2xl bg-slate-900/80 p-3.5 border border-slate-700/60 hover:border-indigo-500 hover:bg-indigo-950/40 transition text-left"
                            >
                              <div>
                                <span className="font-bold text-white text-sm block group-hover:text-indigo-300">
                                  {aiBrain.topPhrase.word}
                                </span>
                                <span className="text-xs text-slate-400 block mt-0.5">
                                  {aiBrain.topPhrase.translation || "Key phrase"}
                                </span>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {aiBrain.topPhrase.avgSpokenScore != null && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-400">
                                    <Mic2 className="h-3 w-3 inline mr-1" />
                                    {aiBrain.topPhrase.avgSpokenScore}%
                                  </span>
                                )}
                                <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400" />
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ================= 1-TO-1 ACTIVE TURN STAGE ================= */
                  <motion.div
                    key={activeTurn.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-6 h-full"
                  >
                    {/* Historical Turn Banner (if viewing an older turn) */}
                    {selectedTurnIndex !== null && selectedTurnIndex < turns.length - 1 && (
                      <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-xs text-amber-300">
                        <span>Viewing past interaction (Turn #{selectedTurnIndex + 1})</span>
                        <button
                          onClick={() => setSelectedTurnIndex(null)}
                          className="font-bold underline hover:text-white"
                        >
                          Return to live
                        </button>
                      </div>
                    )}

                    {/* 1. THE USER'S PROMPT PILL */}
                    {activeTurn.userMessage && (
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="rounded-lg bg-indigo-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-300">
                            You Asked
                          </span>
                          <p className="text-sm font-semibold text-white">
                            {getText(activeTurn.userMessage)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 2. THE ASSISTANT'S 1-TO-1 STAGE RESPONSE + DYNAMIC COMPONENTS */}
                    <div className="flex-1 flex flex-col gap-5 rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 shadow-inner">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-indigo-400/30 bg-slate-800 shadow-lg">
                          <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5" /> {spriteName} Response
                            </span>
                          </div>

                          {/* Spoken / Text Response */}
                          {getText(activeTurn.assistantMessage) ? (
                            <p className="text-base md:text-lg font-medium text-slate-100 leading-relaxed">
                              {getText(activeTurn.assistantMessage)}
                            </p>
                          ) : isLoading ? (
                            <div className="flex items-center gap-2 py-2">
                              <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
                              <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
                              <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
                              <span className="text-xs font-medium text-slate-400 ml-1">
                                {spriteName} is thinking...
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* 3. GENERATIVE UI SLOT (Renders ContextCard, Drills, Lambda Actions, etc.) */}
                      <div className="flex flex-col gap-4 mt-2">
                        {renderAssistantComponents(activeTurn.assistantMessage)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* BOTTOM COMMAND / INPUT BAR */}
              <div className="border-t border-white/10 bg-slate-900/80 p-4 shrink-0">
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-950 px-3 py-2 transition-colors focus-within:border-indigo-500"
                >
                  <button
                    type="button"
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask ${spriteName} for an explanation, example, or drill in ${aiBrain.targetLang}...`}
                    disabled={isLoading}
                    maxLength={1000}
                    className="w-full bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                  >
                    <span>Ask</span>
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