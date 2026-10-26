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
import { ContextCard } from "./context-card"; // Adjust path if needed

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

// Splits the message into spoken text + structured JSON payload
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
    // Still streaming the JSON block, so just return spokenText until JSON finishes
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

  useEffect(() => {
    if (isLoading) return;
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
  }, [messages, isLoading, summonSprite]);

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
              <span className="text-xs font-bold text-white">Chat with {spriteName}</span>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="fixed bottom-0 right-0 left-0 md:left-auto md:right-6 md:bottom-4 z-50 flex h-[80vh] w-full md:w-[640px] max-w-full flex-col overflow-hidden rounded-t-3xl md:rounded-3xl border border-indigo-500/30 bg-slate-950/95 shadow-2xl shadow-indigo-950/80 backdrop-blur-2xl"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/70 px-6 py-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/20 bg-slate-800">
                    <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {spriteName}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400 truncate max-w-[220px]">
                      {aiBrain.currentLessonTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {turns.length > 0 && (
                    <button
                      onClick={() => setViewMode(viewMode === "stage" ? "history" : "stage")}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      {viewMode === "history" ? (
                        <>
                          <ChevronLeft className="h-3.5 w-3.5" /> Back to Stage
                        </>
                      ) : (
                        <>
                          <History className="h-3.5 w-3.5" /> View History ({turns.length})
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* BODY: EITHER HISTORY LIST OR 1-TO-1 STAGE */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                {viewMode === "history" ? (
                  /* HISTORY VIEW */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Past Interactions
                      </span>
                      {selectedTurnIndex !== null && (
                        <button
                          onClick={() => {
                            setSelectedTurnIndex(null);
                            setViewMode("stage");
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                        >
                          <RotateCcw className="h-3 w-3" /> Back to Latest
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
                          className="w-full text-left rounded-2xl border border-white/10 bg-slate-900/60 p-4 hover:border-indigo-500/50 transition"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase text-indigo-400">
                              Turn #{idx + 1}
                            </span>
                            {contextCard && (
                              <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                                Has Card: {contextCard.title}
                              </span>
                            )}
                          </div>
                          {userText && (
                            <p className="text-xs font-bold text-white truncate">You: {userText}</p>
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
                ) : !activeTurn ? (
                  /* INITIAL BRIEFING STATE (Before 1st message) */
                  <div className="flex h-full flex-col justify-between gap-6">
                    <div className="flex flex-col gap-3 rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-5 shadow-inner">
                      <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-3">
                        <Target className="h-4 w-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                          Tutor Briefing
                        </h4>
                      </div>

                      <div>
                        <span className="block text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1">
                          Current Objective
                        </span>
                        <span className="font-bold text-sm text-white">
                          {aiBrain.currentLessonTitle}
                        </span>
                      </div>

                      {(aiBrain.topWord || aiBrain.topPhrase) && (
                        <div className="mt-2">
                          <span className="block text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-2">
                            Priority Targets (Click to Practice)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {aiBrain.topWord && (
                              <button
                                onClick={() => triggerPractice(aiBrain.topWord!.word)}
                                className="group flex items-center justify-between rounded-xl bg-slate-900/60 p-3 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-950/40 transition text-left"
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
                                  <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-indigo-400" />
                                </div>
                              </button>
                            )}

                            {aiBrain.topPhrase && (
                              <button
                                onClick={() => triggerPractice(aiBrain.topPhrase!.word)}
                                className="group flex items-center justify-between rounded-xl bg-slate-900/60 p-3 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-950/40 transition text-left"
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
                                  <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-indigo-400" />
                                </div>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="my-auto flex flex-col items-center justify-center text-center opacity-60">
                      <div className="h-12 w-12 overflow-hidden rounded-full border border-slate-700 bg-slate-800 mb-3">
                        <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                      </div>
                      <p className="text-sm font-medium text-slate-300">
                        Ask {spriteName} anything or select a target above.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* 1-TO-1 ACTIVE MESSAGE STAGE */
                  <div className="flex flex-col gap-5 h-full">
                    {/* User Prompt Header */}
                    {activeTurn.userMessage && (
                      <div className="flex items-center justify-between rounded-2xl bg-indigo-600/20 border border-indigo-500/30 px-4 py-3">
                        <span className="text-sm font-semibold text-indigo-100">
                          &ldquo;{getRawText(activeTurn.userMessage)}&rdquo;
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 shrink-0 ml-3">
                          You
                        </span>
                      </div>
                    )}

                    {/* Assistant 1-to-1 Response Stage */}
                    <div className="flex-1 flex flex-col gap-5 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                      <div className="flex items-start gap-3.5">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-slate-800">
                          <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[11px] font-black uppercase tracking-wider text-teal-400 flex items-center gap-1 mb-1">
                            <Sparkles className="h-3 w-3" /> {spriteName}
                          </span>

                          {activeAssistantPayload.spokenText ? (
                            <p className="text-base font-medium text-slate-100 leading-relaxed">
                              {activeAssistantPayload.spokenText}
                            </p>
                          ) : isLoading ? (
                            <div className="flex gap-1.5 py-2">
                              <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                              <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                              <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* RENDERED COMPONENT SLOT: ContextCard */}
                      {activeAssistantPayload.contextCard && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <ContextCard
                            title={activeAssistantPayload.contextCard.title}
                            grammarRule={activeAssistantPayload.contextCard.grammarRule}
                            examples={activeAssistantPayload.contextCard.examples || []}
                          />
                        </motion.div>
                      )}

                      {/* RENDERED ACTION BADGE (When Lambda Action Fired) */}
                      {activeAssistantPayload.action && (
                        <div className="flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-950/30 px-4 py-2.5 text-xs font-bold text-teal-300">
                          <Zap className="h-4 w-4 text-teal-400" />
                          <span>
                            Action Triggered: {activeAssistantPayload.action.type}{" "}
                            {activeAssistantPayload.action.targetWord
                              ? `(${activeAssistantPayload.action.targetWord})`
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* INPUT BAR */}
              <div className="border-t border-white/10 bg-slate-900/60 p-4 shrink-0">
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 transition-colors focus-within:border-indigo-500"
                >
                  <button
                    type="button"
                    className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
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
                    className="rounded-xl bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-500 disabled:opacity-50"
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