// components/sprite/sprite-chat-session-tab.tsx
"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Languages,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowRight,
  Moon,
} from "lucide-react";
import { useSprite, type ChatViewMode } from "@/context/sprite-context";
import {
  cleanDisplayString,
  getRawText,
  parseMessagePayload,
  type ChatContextData,
  type ParsedPayload,
  type UIMessageTurn,
} from "./sprite-chat-utils";
import type { ChalkboardData } from "@/lib/schema/sprite-schema";
import {
  SpriteChatChalkboard,
  normalizeBoardData,
} from "./sprite-chat-chalkboard";

interface SpriteChatSessionTabProps {
  viewMode: ChatViewMode;
  spriteName: string;
  avatarSrc: string;
  aiBrain: ChatContextData;
  turns: UIMessageTurn[];
  currentTurnIdx: number;
  activeTurn?: UIMessageTurn;
  activeAssistantPayload: ParsedPayload;
  isLoading: boolean;
  isSnoozing?: boolean;
  error?: Error;
  input: string;
  onInputChange: (val: string) => void;
  onSubmit: (e: FormEvent) => void;
  onSelectTurnIndex: (idx: number) => void;
  onQuickPrompt: (prompt: string) => void;
}

export function SpriteChatSessionTab({
  viewMode,
  spriteName,
  avatarSrc,
  aiBrain,
  turns,
  currentTurnIdx,
  activeTurn,
  activeAssistantPayload,
  isLoading,
  isSnoozing = false,
  error,
  input,
  onInputChange,
  onSubmit,
  onSelectTurnIndex,
  onQuickPrompt,
}: SpriteChatSessionTabProps) {
  const router = useRouter();
  const { closeChat } = useSprite();

  const [multiBoardOverride, setMultiBoardOverride] =
    useState<ChalkboardData | null>(null);
  const [isMultiBoardOpen, setIsMultiBoardOpen] = useState(false);

  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewMode === "multi") {
      threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [viewMode, turns.length, activeAssistantPayload.spokenText, isLoading]);

  const handleNavigateToLesson = (href: string) => {
    closeChat();
    router.push(href);
  };

  const getTurnPayload = (
    turn: UIMessageTurn,
    isLastTurn: boolean
  ): ParsedPayload => {
    if (isLastTurn && turn.id === activeTurn?.id) {
      return activeAssistantPayload;
    }
    return parseMessagePayload(turn.assistantMessage);
  };

  const resolvedChalkboard = (() => {
    let latestFullBoard: ChalkboardData | null = null;
    for (let i = 0; i <= currentTurnIdx; i++) {
      const p =
        i === currentTurnIdx && turns[i]?.id === activeTurn?.id
          ? activeAssistantPayload
          : parseMessagePayload(turns[i]?.assistantMessage);

      const norm = normalizeBoardData(
        p.chalkboard,
        p.contextCard,
        aiBrain.currentLessonTitle,
        latestFullBoard
      );
      if (norm) {
        latestFullBoard = norm;
      }
    }
    return latestFullBoard
      ? {
          board: latestFullBoard,
          isPinned: !activeAssistantPayload.chalkboard,
        }
      : null;
  })();

  /* ================= 1. EMPTY: NEW SESSION STAGE ================= */
  if (turns.length === 0 || !activeTurn) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto py-6">
        <div className="relative mb-5">
          <div
            className={`absolute -inset-2 rounded-3xl blur-lg ${
              isSnoozing
                ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30"
                : "bg-gradient-to-r from-teal-500/30 to-indigo-500/30"
            }`}
          />
          <div
            className={`relative h-20 w-20 overflow-hidden rounded-3xl border-2 bg-slate-900 shadow-2xl ${
              isSnoozing ? "border-indigo-400/50 opacity-85" : "border-teal-400/50"
            }`}
          >
            <img
              src={avatarSrc}
              alt={spriteName}
              className="h-full w-full object-cover object-top"
            />
          </div>
          {isSnoozing && (
            <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-xs ring-2 ring-slate-950 shadow-lg">
              💤
            </span>
          )}
        </div>

        {isSnoozing ? (
          <>
            <h3 className="text-lg font-extrabold text-white mb-1.5">
              {spriteName} is recharging! 💤
            </h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              You already completed your chalkboard session for{" "}
              <span className="text-white font-semibold">
                {aiBrain.currentLessonTitle}
              </span>
              . Complete your active Spoon &amp; Vocab Bridge to wake{" "}
              {spriteName} back up!
            </p>

            {aiBrain.activeStepHref && (
              <button
                type="button"
                onClick={() => handleNavigateToLesson(aiBrain.activeStepHref!)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 to-indigo-400 px-5 py-3 text-xs font-black text-slate-950 shadow-xl hover:brightness-110 transition"
              >
                <span>{aiBrain.activeStepLabel || "Continue Lesson"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </>
        ) : (
          <>
            <h3 className="text-lg font-extrabold text-white mb-1.5">
              Ready to practice, {aiBrain.userName}?
            </h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Click a guided activity below to launch your interactive
              chalkboard for{" "}
              <span className="text-white font-semibold">
                {aiBrain.currentLessonTitle}
              </span>
              .
            </p>

            <div className="flex flex-wrap justify-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  onQuickPrompt(
                    `Give me a grammar breakdown for ${aiBrain.currentLessonTitle}`
                  )
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
          </>
        )}
      </div>
    );
  }

  /* ================= 2. MULTI MODE: THREAD + BOARD DRAWER ================= */
  if (viewMode === "multi") {
    const activeMultiBoard = multiBoardOverride || resolvedChalkboard?.board;
    const activeStepCount =
      activeMultiBoard?.steps?.length || activeMultiBoard?.items?.length || 0;

    return (
      <div className="flex-1 flex flex-col gap-5">
        {activeMultiBoard && (
          <div className="sticky top-0 z-20 -mx-2">
            <div className="overflow-hidden rounded-2xl border border-slate-600/80 bg-[#111827]/95 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="rounded-md bg-teal-400 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-950 shrink-0">
                    📋 Board
                  </span>
                  <span className="text-sm font-extrabold text-white truncate">
                    {cleanDisplayString(activeMultiBoard.title)}
                  </span>
                  <span className="text-xs font-bold text-slate-300 shrink-0">
                    · Step {(activeMultiBoard.currentStepIndex ?? 0) + 1} of{" "}
                    {Math.max(1, activeStepCount)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMultiBoardOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-800 border border-slate-600 px-3 py-1 text-xs font-extrabold text-white hover:bg-slate-700 transition shrink-0"
                >
                  <span>
                    {isMultiBoardOpen ? "Close Board" : "View Board"}
                  </span>
                  {isMultiBoardOpen ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <AnimatePresence>
                {isMultiBoardOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-slate-600/60 overflow-hidden"
                  >
                    <SpriteChatChalkboard
                      board={activeMultiBoard}
                      hideHeader
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {turns.map((turn, idx) => {
          const isLastTurn = idx === turns.length - 1;
          const payload = getTurnPayload(turn, isLastTurn);
          const turnBoard = normalizeBoardData(
            payload.chalkboard,
            payload.contextCard,
            aiBrain.currentLessonTitle,
            resolvedChalkboard?.board
          );
          const previewTarget =
            turnBoard?.steps?.[turnBoard.currentStepIndex ?? 0]?.targetPhrase ||
            turnBoard?.steps?.[0]?.targetPhrase ||
            turnBoard?.items?.[0]?.target ||
            null;

          const userText = turn.userMessage
            ? cleanDisplayString(getRawText(turn.userMessage))
            : "";

          return (
            <div key={turn.id} className="space-y-3.5">
              {userText && (
                <div className="flex justify-end">
                  <div className="max-w-[82%] rounded-2xl rounded-tr-sm border border-indigo-400/35 bg-indigo-600/30 px-4 py-2.5 text-sm font-bold text-white shadow-md">
                    {userText}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-teal-400/50 bg-slate-800 shadow-md">
                  <img
                    src={avatarSrc}
                    alt={spriteName}
                    className="h-full w-full object-cover object-top"
                  />
                </div>

                <div className="flex-1 max-w-[88%] space-y-3 rounded-2xl rounded-tl-sm border border-slate-600/60 bg-[#182234] p-4 shadow-lg">
                  <span className="text-xs font-extrabold tracking-wide text-teal-300 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> {spriteName}
                  </span>

                  {payload.spokenText ? (
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      {payload.spokenText}
                    </p>
                  ) : isLastTurn && isLoading ? (
                    <div className="flex items-center gap-2 py-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400" />
                      <span className="text-xs font-medium text-slate-300 ml-1">
                        {spriteName} is thinking...
                      </span>
                    </div>
                  ) : isLastTurn && error ? (
                    <p className="text-xs font-medium text-rose-300">
                      {spriteName} couldn&apos;t respond right now. Please try
                      asking again.
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-slate-200">
                      Could you rephrase that? Let&apos;s keep practicing{" "}
                      {aiBrain.currentLessonTitle}.
                    </p>
                  )}

                  {payload.translation && (
                    <div className="flex items-start gap-2 rounded-xl border border-indigo-400/30 bg-indigo-950/50 px-3.5 py-2.5">
                      <Languages className="h-3.5 w-3.5 text-indigo-300 shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-indigo-100 leading-relaxed">
                        {payload.translation}
                      </p>
                    </div>
                  )}

                  {turnBoard && (
                    <button
                      type="button"
                      onClick={() => {
                        setMultiBoardOverride(turnBoard);
                        setIsMultiBoardOpen(true);
                      }}
                      className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-500/50 bg-[#24324B] px-3.5 py-2.5 text-left hover:border-teal-300 transition group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <BookOpen className="h-4 w-4 text-teal-300 shrink-0" />
                        <span className="text-xs font-extrabold text-white truncate">
                          {cleanDisplayString(turnBoard.title)}
                        </span>
                        {previewTarget && (
                          <span className="hidden sm:inline-block rounded-md bg-slate-900/80 px-2 py-0.5 text-[11px] font-bold text-teal-300 truncate max-w-[160px]">
                            {cleanDisplayString(previewTarget)}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-teal-300 group-hover:underline shrink-0">
                        View Step ↗
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Snooze Banner at the bottom of Multi Mode */}
        {isSnoozing && (
          <div className="mt-2 rounded-2xl border border-indigo-400/35 bg-gradient-to-r from-indigo-950 via-[#111827] to-slate-900 p-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/40 bg-indigo-500/20 text-base">
                  <Moon className="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <h5 className="text-xs font-black uppercase tracking-wider text-indigo-300">
                    {spriteName} is napping until your next lesson!
                  </h5>
                  <p className="text-xs font-semibold text-slate-300 mt-0.5">
                    Complete your active Spoon &amp; Vocab Bridge to wake{" "}
                    {spriteName} up.
                  </p>
                </div>
              </div>

              {aiBrain.activeStepHref && (
                <button
                  type="button"
                  onClick={() => handleNavigateToLesson(aiBrain.activeStepHref!)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-indigo-400 px-4 py-2 text-xs font-black text-slate-950 shadow-lg hover:brightness-110 transition shrink-0"
                >
                  <span>{aiBrain.activeStepLabel || "Continue Lesson"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={threadEndRef} />
      </div>
    );
  }

  /* ================= 3. SINGLE MODE: UNIFIED FULL-BLEED CHALKBOARD STAGE ================= */
  return (
    <SpriteChatChalkboard
      fullStage
      board={resolvedChalkboard?.board}
      contextCard={activeAssistantPayload.contextCard}
      tutorHeader={{
        spriteName,
        avatarSrc,
        spokenText: activeAssistantPayload.spokenText,
        translation: activeAssistantPayload.translation,
        userPrompt: activeTurn.userMessage
          ? cleanDisplayString(getRawText(activeTurn.userMessage))
          : undefined,
        isLoading,
        error,
        currentTurnIdx,
        totalTurns: turns.length,
        onSelectTurnIndex,
      }}
      snoozeState={{
        isSnoozing,
        lessonTitle: aiBrain.currentLessonTitle,
        actionHref: aiBrain.activeStepHref,
        actionLabel: aiBrain.activeStepLabel,
        onNavigate: handleNavigateToLesson,
      }}
      interactiveInput={{
        value: input,
        isLoading,
        spriteName,
        targetLang: aiBrain.targetLang,
        onChange: onInputChange,
        onSubmit,
        onQuickAction: onQuickPrompt,
      }}
    />
  );
}