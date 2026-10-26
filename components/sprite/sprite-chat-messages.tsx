// components/sprite/sprite-chat-messages.tsx
"use client";

import { motion } from "framer-motion";
import {
  Mic2,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
  MessageSquare,
  Languages,
} from "lucide-react";
import { ContextCard } from "./context-card";
import {
  cleanDisplayString,
  getRawText,
  type ActiveTab,
  type ChatContextData,
  type ParsedPayload,
  type UIMessageTurn,
} from "./sprite-chat-utils";
import type { SpriteSessionData } from "@/lib/schema/sprite-schema";

interface SpriteChatMessagesProps {
  effectiveTab: ActiveTab;
  spriteName: string;
  avatarSrc: string;
  aiBrain: ChatContextData;
  sessionId: string;
  sessionsList: SpriteSessionData[];
  turns: UIMessageTurn[];
  currentTurnIdx: number;
  activeTurn?: UIMessageTurn;
  activeAssistantPayload: ParsedPayload;
  isLoading: boolean;
  error?: Error;
  onSelectSession: (session: SpriteSessionData) => void;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectTurnIndex: (idx: number) => void;
  onTriggerPractice: (word: string) => void;
  onQuickPrompt: (prompt: string) => void;
}

export function SpriteChatMessages({
  effectiveTab,
  spriteName,
  avatarSrc,
  aiBrain,
  sessionId,
  sessionsList,
  turns,
  currentTurnIdx,
  activeTurn,
  activeAssistantPayload,
  isLoading,
  error,
  onSelectSession,
  onSelectTab,
  onSelectTurnIndex,
  onTriggerPractice,
  onQuickPrompt,
}: SpriteChatMessagesProps) {
  const hasActiveTurns = turns.length > 0;

  return (
    <div className="relative z-10 flex-1 overflow-y-auto p-6 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {effectiveTab === "sessions" ? (
        /* ================= VIEW A: SAVED SESSIONS LIST ================= */
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Saved Sessions ({sessionsList.length})
            </span>
          </div>

          {sessionsList.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center my-auto backdrop-blur-md">
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
                  onClick={() => onSelectSession(sess)}
                  className={`w-full text-left rounded-2xl border p-4 transition backdrop-blur-md ${
                    isCurrentSession
                      ? "border-teal-500/60 bg-gradient-to-r from-teal-950/50 to-indigo-950/50"
                      : "border-white/10 bg-slate-900/70 hover:border-indigo-500/40 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white truncate max-w-[340px]">
                        {cleanDisplayString(sess.title)}
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
                      Current: {sess.lessonTitle}
                    </span>
                  )}

                  {lastTurn && (
                    <p className="text-xs text-slate-300 line-clamp-1">
                      {spriteName}: {cleanDisplayString(lastTurn.assistantReply)}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      ) : effectiveTab === "briefing" || !activeTurn ? (
        /* ================= VIEW B: BRIEFING & TARGETS STAGE ================= */
        <div className="flex-1 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-br from-teal-950/60 via-indigo-950/50 to-slate-900/80 p-5 shadow-lg backdrop-blur-md">
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 block mb-1">
                    Active Lesson Briefing
                  </span>
                  <h2 className="text-lg font-extrabold text-white">
                    {aiBrain.currentLessonTitle}
                  </h2>
                </div>
                {hasActiveTurns && (
                  <button
                    onClick={() => onSelectTab("stage")}
                    className="rounded-xl bg-teal-500/20 border border-teal-400/40 px-3.5 py-2 text-xs font-bold text-teal-200 hover:bg-teal-500/30 transition"
                  >
                    Return to Stage →
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
                      onClick={() => onTriggerPractice(aiBrain.topWord!.word)}
                      className="group relative overflow-hidden flex items-center justify-between rounded-2xl bg-gradient-to-br from-slate-900/90 to-indigo-950/50 p-4 border border-indigo-500/30 hover:border-indigo-400 transition text-left shadow-md backdrop-blur-md"
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
                      onClick={() => onTriggerPractice(aiBrain.topPhrase!.word)}
                      className="group relative overflow-hidden flex items-center justify-between rounded-2xl bg-gradient-to-br from-slate-900/90 to-teal-950/50 p-4 border border-teal-500/30 hover:border-teal-400 transition text-left shadow-md backdrop-blur-md"
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

          <div className="my-auto flex flex-col items-center text-center max-w-md mx-auto py-6">
            <div className="relative mb-4">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-teal-500/30 to-indigo-500/30 blur-lg" />
              <div className="relative h-20 w-20 overflow-hidden rounded-3xl border-2 border-teal-400/50 bg-slate-900 shadow-2xl">
                <img
                  src={avatarSrc}
                  alt={spriteName}
                  className="h-full w-full object-cover object-top"
                />
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
                onClick={() =>
                  onQuickPrompt(`Give me a grammar breakdown for ${aiBrain.currentLessonTitle}`)
                }
                className="rounded-2xl border border-indigo-400/40 bg-indigo-500/15 px-4 py-2.5 text-xs font-bold text-indigo-200 hover:bg-indigo-500/25 transition shadow-sm"
              >
                ✨ Explain Lesson Grammar
              </button>
              <button
                type="button"
                onClick={() =>
                  onQuickPrompt(`Quiz me on ${aiBrain.currentLessonTitle}`)
                }
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
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-400/30 bg-gradient-to-r from-indigo-950/70 via-slate-900/85 to-teal-950/50 px-5 py-3.5 shrink-0 shadow-md backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <span className="rounded-lg bg-indigo-500/30 border border-indigo-400/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-200 shrink-0">
                  You
                </span>
                <p className="text-sm font-bold text-white truncate">
                  &ldquo;{cleanDisplayString(getRawText(activeTurn.userMessage))}&rdquo;
                </p>
              </div>

              {turns.length > 1 && (
                <div className="flex items-center gap-1 rounded-xl bg-slate-950/80 border border-white/15 px-2.5 py-1 shrink-0">
                  <button
                    type="button"
                    disabled={currentTurnIdx === 0}
                    onClick={() => onSelectTurnIndex(Math.max(0, currentTurnIdx - 1))}
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
                      onSelectTurnIndex(Math.min(turns.length - 1, currentTurnIdx + 1))
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
          <div className="flex-1 flex flex-col rounded-3xl border border-teal-500/30 bg-gradient-to-b from-slate-900/80 via-[#0B1020]/85 to-indigo-950/40 p-6 shadow-2xl backdrop-blur-md">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border-2 border-teal-400/50 bg-slate-800 shadow-lg">
                  <img
                    src={avatarSrc}
                    alt={spriteName}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="flex-1 pt-0.5 space-y-3">
                  <span className="text-xs font-extrabold tracking-wide text-teal-400 flex items-center gap-1.5">
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
                        {spriteName} is thinking...
                      </span>
                    </div>
                  ) : error ? (
                    <p className="text-sm font-medium text-rose-400">
                      {spriteName} couldn&apos;t respond right now. Please try asking again.
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-slate-300">
                      Could you rephrase that? Let&apos;s keep practicing {aiBrain.currentLessonTitle}.
                    </p>
                  )}

                  {/* English Translation Box */}
                  {activeAssistantPayload.translation && (
                    <div className="flex items-start gap-2.5 rounded-2xl border border-indigo-400/25 bg-indigo-950/35 px-4 py-3">
                      <Languages className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-indigo-200 leading-relaxed">
                        {activeAssistantPayload.translation}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ContextCard Component */}
              {activeAssistantPayload.contextCard && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ContextCard
                    title={cleanDisplayString(activeAssistantPayload.contextCard.title)}
                    grammarRule={cleanDisplayString(activeAssistantPayload.contextCard.grammarRule)}
                    examples={(activeAssistantPayload.contextCard.examples || []).map((ex) => ({
                      french: cleanDisplayString(ex.french),
                      english: cleanDisplayString(ex.english),
                    }))}
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
                        ? `(${cleanDisplayString(activeAssistantPayload.action.targetWord)})`
                        : ""}
                    </span>
                  </div>
                  <span className="rounded-full bg-teal-400/20 border border-teal-400/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-teal-300">
                    Active
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}