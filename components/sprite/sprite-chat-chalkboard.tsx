// components/sprite/sprite-chat-chalkboard.tsx
"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import {
  Sparkles,
  Eye,
  EyeOff,
  CornerDownLeft,
  Loader2,
  PenTool,
  ChevronLeft,
  ChevronRight,
  Languages,
  ArrowRight,
  CheckCircle2,
  Mic2,
  Trophy,
  ImageIcon,
} from "lucide-react";
import { useSprite } from "@/context/sprite-context";
import type {
  ChalkboardData,
  ContextCardData,
  BoardStep,
} from "@/lib/schema/sprite-schema";
import { cleanDisplayString } from "./sprite-chat-utils";

export interface SpriteChatChalkboardProps {
  board?: ChalkboardData | null;
  contextCard?: ContextCardData | null;
  hideHeader?: boolean;
  isPinnedFromEarlier?: boolean;
  tutorHeader?: {
    spriteName: string;
    avatarSrc: string;
    spokenText: string;
    translation?: string | null;
    userPrompt?: string;
    isLoading: boolean;
    error?: Error;
    currentTurnIdx: number;
    totalTurns: number;
    onSelectTurnIndex: (idx: number) => void;
  };
  fullStage?: boolean;
  snoozeState?: {
    isSnoozing: boolean;
    lessonTitle: string;
    actionHref?: string;
    actionLabel?: string;
    onNavigate?: (href: string) => void;
  };
  interactiveInput?: {
    value: string;
    isLoading: boolean;
    spriteName: string;
    targetLang: string;
    onChange: (val: string) => void;
    onSubmit: (e: FormEvent) => void;
    onQuickAction?: (text: string) => void;
  };
}

const ACCENT_KEYS = ["é", "è", "ê", "à", "ù", "ç", "œ", "’"];

export function normalizeBoardData(
  board?: ChalkboardData | null,
  contextCard?: ContextCardData | null,
  fallbackTitle = "Lesson Board",
  previousBoard?: ChalkboardData | null
): ChalkboardData | null {
  if (board && board.title === "__STEP_UPDATE__" && previousBoard) {
    const delta = board.currentStepIndex || 0;
    const total = previousBoard.steps.length;
    const nextIdx = Math.min(
      Math.max(0, total - 1),
      previousBoard.currentStepIndex + delta
    );
    const isCompleted =
      board.status === "COMPLETED" ||
      (delta > 0 && previousBoard.currentStepIndex + delta >= total);

    return {
      ...previousBoard,
      status: isCompleted ? "COMPLETED" : "IN_PROGRESS",
      currentStepIndex: nextIdx,
      lastFeedback: board.lastFeedback ?? null,
    };
  }

  if (board && Array.isArray(board.steps) && board.steps.length > 0) {
    return board;
  }

  if (board && Array.isArray(board.items) && board.items.length > 0) {
    const convertedSteps: BoardStep[] = board.items.map((item, idx) => ({
      id: `legacy-${idx}`,
      type: "teach_concept",
      badge: item.label || `Step ${idx + 1}`,
      prompt: item.detail || board.title,
      targetPhrase: item.target,
      translation: null,
      formula: item.detail?.includes(" + ") ? item.detail : null,
      grammarTip: board.takeaway ?? null,
      hint: null,
      options: null,
      correctAnswer: null,
      imagePrompt: null,
      imageUrl: null,
      userAttempts: [],
      struggled: false,
      correctionGiven: null,
      completedAt: null,
    }));

    return {
      title: board.title || fallbackTitle,
      status: "IN_PROGRESS",
      currentStepIndex: 0,
      steps: convertedSteps,
      takeaway: board.takeaway ?? null,
      lastFeedback: null,
    };
  }

  if (contextCard) {
    const convertedSteps: BoardStep[] = (contextCard.examples || []).map(
      (ex, idx) => ({
        id: `ctx-${idx}`,
        type: "teach_concept",
        badge: `Example ${idx + 1}`,
        prompt: contextCard.grammarRule,
        targetPhrase: ex.french,
        translation: ex.english,
        formula: null,
        grammarTip: null,
        hint: null,
        options: null,
        correctAnswer: null,
        imagePrompt: null,
        imageUrl: null,
        userAttempts: [],
        struggled: false,
        correctionGiven: null,
        completedAt: null,
      })
    );

    return {
      title: contextCard.title || fallbackTitle,
      status: "IN_PROGRESS",
      currentStepIndex: 0,
      steps: convertedSteps,
      takeaway: contextCard.grammarRule,
      lastFeedback: null,
    };
  }

  return null;
}

function renderFormulaTiles(formula: string) {
  const cleaned = cleanDisplayString(formula);
  const colonIdx = cleaned.indexOf(":");
  const prefix =
    colonIdx !== -1 ? cleaned.slice(0, colonIdx + 1).trim() : null;
  const formulaPart =
    colonIdx !== -1 ? cleaned.slice(colonIdx + 1).trim() : cleaned;
  const tokens = formulaPart.split(/\s*\+\s*/).filter(Boolean);

  if (tokens.length < 2) {
    return <p className="text-sm font-semibold text-slate-200">{cleaned}</p>;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-2">
      {prefix && (
        <span className="text-xs font-bold text-slate-300 mr-1">{prefix}</span>
      )}
      {tokens.map((tok, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="rounded-xl bg-white px-3.5 py-1.5 text-sm font-black text-slate-950 shadow-md">
            {tok}
          </span>
          {idx < tokens.length - 1 && (
            <span className="text-base font-black text-teal-300">+</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function SpriteChatChalkboard({
  board,
  contextCard,
  hideHeader = false,
  tutorHeader,
  fullStage = false,
  snoozeState,
  interactiveInput,
}: SpriteChatChalkboardProps) {
  const { profile } = useSprite();
  const userId = profile?.userId;

  const activeBoard = normalizeBoardData(board, contextCard);

  const [viewingStepIdx, setViewingStepIdx] = useState<number>(
    activeBoard?.currentStepIndex ?? 0
  );
  const [hintRevealed, setHintRevealed] = useState(false);

  // Cache generated prunaai/p-image URLs per step so navigating back/forth never re-generates
  const imageCacheRef = useRef<Record<string, string>>({});
  const [stepImageUrl, setStepImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeBoard) {
      setViewingStepIdx(activeBoard.currentStepIndex);
      setHintRevealed(false);
    }
  }, [activeBoard?.boardId, activeBoard?.currentStepIndex]);

  const totalSteps = activeBoard?.steps.length ?? 0;
  const safeStepIdx = Math.min(
    Math.max(0, viewingStepIdx),
    Math.max(0, totalSteps - 1)
  );
  const currentStep: BoardStep | null =
    activeBoard && totalSteps > 0 ? activeBoard.steps[safeStepIdx] : null;

  // Automatically generate or load cached image when a step has `imagePrompt` or `imageUrl`
  useEffect(() => {
    if (!currentStep) {
      setStepImageUrl(null);
      setIsGeneratingImage(false);
      return;
    }

    const cacheKey =
      currentStep.id || `${activeBoard?.boardId || "board"}-${safeStepIdx}`;

    if (currentStep.imageUrl) {
      imageCacheRef.current[cacheKey] = currentStep.imageUrl;
      setStepImageUrl(currentStep.imageUrl);
      setIsGeneratingImage(false);
      return;
    }

    if (imageCacheRef.current[cacheKey]) {
      setStepImageUrl(imageCacheRef.current[cacheKey]);
      setIsGeneratingImage(false);
      return;
    }

    const prompt = currentStep.imagePrompt?.trim();
    if (!prompt || !userId) {
      setStepImageUrl(null);
      setIsGeneratingImage(false);
      return;
    }

    let cancelled = false;
    setStepImageUrl(null);
    setIsGeneratingImage(true);

    fetch(`/api/users/${userId}/sprite/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.imageUrl) {
          imageCacheRef.current[cacheKey] = data.imageUrl;
          setStepImageUrl(data.imageUrl);
        }
      })
      .catch((err) => {
        console.warn("[Chalkboard Image] Failed to generate:", err);
      })
      .finally(() => {
        if (!cancelled) setIsGeneratingImage(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    currentStep?.id,
    currentStep?.imageUrl,
    currentStep?.imagePrompt,
    safeStepIdx,
    activeBoard?.boardId,
    userId,
  ]);

  const insertAccent = (char: string) => {
    if (!interactiveInput) return;
    const el = inputRef.current;
    if (!el) {
      interactiveInput.onChange(interactiveInput.value + char);
      return;
    }
    const start = el.selectionStart ?? interactiveInput.value.length;
    const end = el.selectionEnd ?? interactiveInput.value.length;
    const nextVal =
      interactiveInput.value.slice(0, start) +
      char +
      interactiveInput.value.slice(end);
    interactiveInput.onChange(nextVal);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    });
  };

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden bg-[#182234] ${
        fullStage
          ? "flex-1 rounded-none border-t-2 border-teal-400/50"
          : "rounded-b-2xl"
      }`}
    >
      {/* Chalkboard Grid Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* ================= 1. TOP TUTOR HEADER ================= */}
      {tutorHeader && (
        <div className="relative z-10 border-b border-slate-600/70 bg-[#111827] px-6 py-3.5 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between gap-2">
            {tutorHeader.userPrompt ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="rounded-md bg-indigo-500/30 border border-indigo-400/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-200 shrink-0">
                  You
                </span>
                <span className="text-xs font-bold text-slate-200 truncate">
                  &ldquo;{tutorHeader.userPrompt}&rdquo;
                </span>
              </div>
            ) : (
              <span className="text-[11px] font-bold text-slate-400">
                1-on-1 Session
              </span>
            )}

            {tutorHeader.totalTurns > 1 && (
              <div className="flex items-center gap-1 rounded-lg bg-slate-800 border border-slate-600 px-2 py-0.5 shrink-0">
                <button
                  type="button"
                  disabled={tutorHeader.currentTurnIdx === 0}
                  onClick={() =>
                    tutorHeader.onSelectTurnIndex(
                      Math.max(0, tutorHeader.currentTurnIdx - 1)
                    )
                  }
                  className="p-0.5 text-slate-200 hover:text-teal-300 disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] font-black text-teal-300 px-1.5">
                  Turn {tutorHeader.currentTurnIdx + 1}/{tutorHeader.totalTurns}
                </span>
                <button
                  type="button"
                  disabled={
                    tutorHeader.currentTurnIdx === tutorHeader.totalTurns - 1
                  }
                  onClick={() =>
                    tutorHeader.onSelectTurnIndex(
                      Math.min(
                        tutorHeader.totalTurns - 1,
                        tutorHeader.currentTurnIdx + 1
                      )
                    )
                  }
                  className="p-0.5 text-slate-200 hover:text-teal-300 disabled:opacity-30"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border-2 border-teal-400/60 bg-slate-800 shadow-md">
              <img
                src={tutorHeader.avatarSrc}
                alt={tutorHeader.spriteName}
                className="h-full w-full object-cover object-top"
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <span className="text-[11px] font-extrabold tracking-wide text-teal-300 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> {tutorHeader.spriteName}
              </span>

              {tutorHeader.spokenText ? (
                <p className="text-sm font-bold text-white leading-snug">
                  {tutorHeader.spokenText}
                </p>
              ) : tutorHeader.isLoading ? (
                <div className="flex items-center gap-2 py-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400" />
                  <span className="text-xs font-medium text-slate-300 ml-1">
                    {tutorHeader.spriteName} is updating the step...
                  </span>
                </div>
              ) : null}

              {tutorHeader.translation && (
                <div className="flex items-start gap-2 rounded-lg bg-indigo-950/60 border border-indigo-400/30 px-2.5 py-1">
                  <Languages className="h-3 w-3 text-indigo-300 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-indigo-100 leading-snug">
                    {tutorHeader.translation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. SINGLE-STEP STAGE SURFACE ================= */}
      <div className="relative z-10 flex-1 flex flex-col justify-between overflow-y-auto px-6 py-5">
        {activeBoard && currentStep ? (
          <>
            {!hideHeader && (
              <div className="space-y-2.5 pb-4 border-b border-slate-600/60 shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="rounded-md bg-teal-300 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-950 shrink-0">
                      {cleanDisplayString(currentStep.badge || "Step")}
                    </span>
                    <h4 className="text-sm font-black text-white truncate">
                      {cleanDisplayString(activeBoard.title)}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={safeStepIdx === 0}
                      onClick={() =>
                        setViewingStepIdx((i) => Math.max(0, i - 1))
                      }
                      className="rounded-md bg-slate-800 border border-slate-600 p-1 text-slate-200 hover:text-teal-300 disabled:opacity-30"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-black text-teal-300 px-1">
                      Step {safeStepIdx + 1} of {totalSteps}
                    </span>
                    <button
                      type="button"
                      disabled={safeStepIdx === totalSteps - 1}
                      onClick={() =>
                        setViewingStepIdx((i) =>
                          Math.min(totalSteps - 1, i + 1)
                        )
                      }
                      className="rounded-md bg-slate-800 border border-slate-600 p-1 text-slate-200 hover:text-teal-300 disabled:opacity-30"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Segmented Progress Bar */}
                <div className="flex items-center gap-1.5">
                  {activeBoard.steps.map((s, idx) => (
                    <button
                      key={s.id || idx}
                      type="button"
                      onClick={() => setViewingStepIdx(idx)}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        idx < activeBoard.currentStepIndex ||
                        activeBoard.status === "COMPLETED"
                          ? "bg-teal-400"
                          : idx === safeStepIdx
                            ? "bg-amber-300"
                            : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inline Correction / Feedback Banner */}
            {activeBoard.lastFeedback &&
              (activeBoard.lastFeedback.correctionTo ||
                activeBoard.lastFeedback.note) && (
                <div className="mt-3 rounded-xl border border-amber-300/40 bg-amber-400/15 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    {activeBoard.lastFeedback.correctionFrom && (
                      <>
                        <span className="text-sm font-extrabold text-rose-300 line-through">
                          {cleanDisplayString(
                            activeBoard.lastFeedback.correctionFrom
                          )}
                        </span>
                        <span className="text-amber-300 font-black">➜</span>
                      </>
                    )}
                    {activeBoard.lastFeedback.correctionTo && (
                      <span className="rounded-md bg-teal-400/25 border border-teal-300 px-2 py-0.5 text-sm font-black text-white">
                        {cleanDisplayString(
                          activeBoard.lastFeedback.correctionTo
                        )}
                      </span>
                    )}
                  </div>
                  {activeBoard.lastFeedback.note && (
                    <span className="text-xs font-bold text-amber-100">
                      {cleanDisplayString(activeBoard.lastFeedback.note)}
                    </span>
                  )}
                </div>
              )}

            {/* CENTER STAGE: Dedicated Full-Screen Step Card */}
            <div className="my-auto py-4 flex flex-col items-center justify-center text-center space-y-4">
              {/* 🖼️ VISUAL FLASHCARD (prunaai/p-image) IF STEP HAS AN IMAGE PROMPT */}
              {(stepImageUrl || isGeneratingImage) && (
                <div className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-slate-500/50 bg-[#111827] shadow-xl">
                  {stepImageUrl ? (
                    <img
                      src={stepImageUrl}
                      alt={currentStep.prompt}
                      className="aspect-video w-full object-cover animate-in fade-in duration-300"
                    />
                  ) : (
                    <div className="aspect-video w-full flex flex-col items-center justify-center gap-2 bg-slate-900/80 text-slate-300">
                      <Loader2 className="h-6 w-6 animate-spin text-teal-300" />
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-teal-300" />
                        Sketching visual on the board...
                      </span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-base font-extrabold text-slate-200 max-w-md leading-relaxed">
                {cleanDisplayString(currentStep.prompt)}
              </p>

              {currentStep.targetPhrase && (
                <div className="w-full max-w-md rounded-2xl border border-slate-500/50 bg-[#24324B] px-6 py-4 shadow-lg space-y-1.5">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {cleanDisplayString(currentStep.targetPhrase)}
                  </div>
                  {currentStep.translation && (
                    <div className="text-sm font-bold text-teal-300">
                      &ldquo;{cleanDisplayString(currentStep.translation)}&rdquo;
                    </div>
                  )}
                </div>
              )}

              {currentStep.formula && renderFormulaTiles(currentStep.formula)}

              {/* STEP TYPE A: MULTIPLE CHOICE OPTIONS */}
              {currentStep.type === "multiple_choice" &&
                Array.isArray(currentStep.options) &&
                currentStep.options.length > 0 && (
                  <div className="w-full max-w-md grid grid-cols-1 gap-2.5 pt-1">
                    {currentStep.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={
                          interactiveInput?.isLoading || snoozeState?.isSnoozing
                        }
                        onClick={() =>
                          interactiveInput?.onQuickAction?.(
                            cleanDisplayString(opt)
                          )
                        }
                        className="flex items-center justify-between rounded-xl border border-slate-500/60 bg-[#24324B] hover:border-teal-300 hover:bg-teal-500/20 px-4 py-3 text-left text-sm font-extrabold text-white transition shadow-sm group disabled:opacity-50"
                      >
                        <span>{cleanDisplayString(opt)}</span>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-300 group-hover:translate-x-0.5 transition" />
                      </button>
                    ))}
                  </div>
                )}

              {/* STEP TYPE B: TEACH CONCEPT -> 1-Click "Got It, Next Step" Button */}
              {currentStep.type === "teach_concept" &&
                interactiveInput?.onQuickAction &&
                activeBoard.status !== "COMPLETED" &&
                !snoozeState?.isSnoozing && (
                  <button
                    type="button"
                    disabled={interactiveInput.isLoading}
                    onClick={() =>
                      interactiveInput.onQuickAction?.("Got it, next step!")
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-teal-300 transition shadow-lg"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Got It · Next Step</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}

              {/* STEP TYPE C: PRONUNCIATION PROMPT */}
              {currentStep.type === "pronunciation" && (
                <div className="inline-flex items-center gap-2 rounded-xl border border-teal-400/40 bg-teal-500/15 px-4 py-2 text-xs font-bold text-teal-200">
                  <Mic2 className="h-4 w-4 text-teal-300" />
                  <span>Type or speak the phrase below to check!</span>
                </div>
              )}

              {/* Optional Tap-to-Reveal Hint */}
              {currentStep.hint && (
                <div className="w-full max-w-md pt-1">
                  {!hintRevealed ? (
                    <button
                      type="button"
                      onClick={() => setHintRevealed(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300/40 bg-sky-400/15 px-3 py-1.5 text-xs font-bold text-sky-200 hover:bg-sky-400/25 transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Need a hint? Tap to peek</span>
                    </button>
                  ) : (
                    <div className="rounded-xl border border-sky-300/40 bg-slate-900/70 px-4 py-2.5 text-xs font-bold text-sky-200 flex items-center justify-between gap-2">
                      <span>💡 {cleanDisplayString(currentStep.hint)}</span>
                      <button
                        type="button"
                        onClick={() => setHintRevealed(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Grammar Tip or Deck Completion Banner */}
            {activeBoard.status === "COMPLETED" ? (
              <div className="rounded-xl border border-teal-300/50 bg-teal-400/15 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <Trophy className="h-5 w-5 text-amber-300 shrink-0" />
                  <span className="text-xs font-extrabold text-white">
                    Deck Complete!{" "}
                    {cleanDisplayString(
                      activeBoard.takeaway || "Great job mastering every step."
                    )}
                  </span>
                </div>
              </div>
            ) : currentStep.grammarTip || activeBoard.takeaway ? (
              <div className="flex items-center gap-2.5 rounded-xl bg-amber-400/15 border border-amber-300/40 px-4 py-2.5 text-xs font-bold text-amber-100 shrink-0">
                <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                <span className="leading-snug">
                  {cleanDisplayString(
                    currentStep.grammarTip || activeBoard.takeaway || ""
                  )}
                </span>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-slate-200">
            <p className="text-sm font-semibold">
              Write on the board below to start your next step with{" "}
              {tutorHeader?.spriteName || "Vox"}.
            </p>
          </div>
        )}
      </div>

      {/* ================= 3. BOTTOM DOCKED BAR: SNOOZE BANNER vs INPUT BAR ================= */}
      {snoozeState?.isSnoozing ? (
        <div className="relative z-10 mt-auto border-t border-indigo-400/35 bg-gradient-to-r from-indigo-950 via-[#111827] to-slate-900 px-6 py-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/40 bg-indigo-500/20 text-lg">
                💤
              </div>
              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-indigo-300">
                  {tutorHeader?.spriteName || "Vox"} is resting up for your
                  lesson!
                </h5>
                <p className="text-xs font-semibold text-slate-300 mt-0.5 leading-relaxed">
                  {tutorHeader?.spriteName || "Vox"} is resting their voice for
                  your lesson! Head into{" "}
                  <span className="text-white font-bold">
                    {snoozeState.actionLabel?.replace(/^Start\s+/i, "") ||
                      snoozeState.lessonTitle}
                  </span>{" "}
                  to wake them up.
                </p>
              </div>
            </div>

            {snoozeState.actionHref && (
              <button
                type="button"
                onClick={() =>
                  snoozeState.onNavigate?.(snoozeState.actionHref!)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-indigo-400 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg hover:brightness-110 transition shrink-0"
              >
                <span>{snoozeState.actionLabel || "Continue Lesson"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        interactiveInput && (
          <form
            onSubmit={interactiveInput.onSubmit}
            className="relative z-10 mt-auto border-t border-slate-600/70 bg-[#111827] px-6 py-3.5 space-y-2.5 shrink-0"
          >
            <div className="flex items-center gap-2.5 rounded-xl bg-[#1E293B] border-2 border-slate-500/60 focus-within:border-teal-400 px-4 py-2.5 transition">
              <PenTool className="h-4 w-4 text-teal-300 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={interactiveInput.value}
                onChange={(e) => interactiveInput.onChange(e.target.value)}
                disabled={interactiveInput.isLoading}
                placeholder={`Write your answer for Step ${safeStepIdx + 1}...`}
                className="flex-1 bg-transparent text-sm font-bold text-white placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={
                  interactiveInput.isLoading || !interactiveInput.value.trim()
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-400 px-4 py-1.5 text-xs font-black text-slate-950 hover:bg-teal-300 disabled:opacity-40 transition shrink-0"
              >
                {interactiveInput.isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Submit</span>
                    <CornerDownLeft className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-300 mr-1">
                  Accents:
                </span>
                {ACCENT_KEYS.map((char) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => insertAccent(char)}
                    className="h-7 min-w-7 rounded-md border border-slate-500/60 bg-[#24324B] px-2 font-mono text-xs font-bold text-white hover:border-teal-300 hover:bg-teal-400/25 transition"
                  >
                    {char}
                  </button>
                ))}
              </div>

              <div className="hidden sm:flex items-center gap-1.5">
                <span className="h-1.5 w-5 rounded-full bg-amber-300" />
                <span className="h-1.5 w-4 rounded-full bg-rose-400" />
                <span className="h-1.5 w-6 rounded-full bg-teal-300" />
              </div>
            </div>
          </form>
        )
      )}
    </div>
  );
}