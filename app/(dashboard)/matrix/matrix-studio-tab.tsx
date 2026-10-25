// components/matrix/matrix-studio-tab.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Eye,
  Ear,
  MousePointerClick,
  Mic,
  Volume2,
  Turtle,
  Trophy,
  Sparkles,
  Play,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Flame,
  Square,
  Loader2,
} from "lucide-react";
import { EnrichedWordStat, SessionScore, WordStat } from "./matrix-types";

interface MatrixStudioTabProps {
  enrichedWords: EnrichedWordStat[];
  activeMicWordId: string | null;
  status: string;
  activeTtsKey: string | null;
  isTtsPlaying: boolean;
  isTtsLoading: boolean;
  sessionScores: Record<string, SessionScore>;
  onListen: (wordStat: WordStat, speed?: number) => void;
  onPronunciationTest: (wordStat: WordStat) => void;
  onTapQuizResult: (wordStat: WordStat, isCorrect: boolean) => void;
  onStartDojo: (customQueue: EnrichedWordStat[]) => void;
}

export function MatrixStudioTab({
  enrichedWords,
  activeMicWordId,
  status,
  activeTtsKey,
  isTtsPlaying,
  isTtsLoading,
  sessionScores,
  onListen,
  onPronunciationTest,
  onTapQuizResult,
  onStartDojo,
}: MatrixStudioTabProps) {
  // ============================================================================
  // 1. TOP 3 PODIUM LISTS (1st Champion + 2nd & 3rd Runner-Ups)
  // ============================================================================
  // Deduplicate #1 Champions across the 4 Podium Cards so all 4 cards showcase different words!
  const { mostSeenTop3, mostHeardTop3, mostTappedTop3, mostSpokenTop3 } =
    useMemo(() => {
      const usedChampions = new Set<string>();

      const pickTop3 = (
        list: EnrichedWordStat[],
        sortFn: (a: EnrichedWordStat, b: EnrichedWordStat) => number
      ) => {
        const sorted = [...list].sort(sortFn);
        if (sorted.length === 0) return [];
        // Pick highest-ranked word that hasn't already been crowned #1 on an earlier card
        const champIdx = sorted.findIndex((w) => !usedChampions.has(w.id));
        const champ = sorted[champIdx !== -1 ? champIdx : 0];
        usedChampions.add(champ.id);
        const others = sorted.filter((w) => w.id !== champ.id).slice(0, 2);
        return [champ, ...others];
      };

      const seen = pickTop3(
        enrichedWords.filter((w) => w.seenCount > 0),
        (a, b) => b.seenCount - a.seenCount
      );

      const heard = pickTop3(
        enrichedWords.filter((w) => w.heardCount > 0),
        (a, b) => b.heardCount - a.heardCount
      );

      const tapped = pickTop3(
        enrichedWords.filter((w) => w.tappedCorrect + w.tappedWrong > 0),
        (a, b) => b.tappedCorrect - a.tappedCorrect
      );

      const spoken = pickTop3(
        enrichedWords.filter((w) => w.spokenAttempts > 0),
        (a, b) =>
          (b.avgSpokenScore ?? 0) !== (a.avgSpokenScore ?? 0)
            ? (b.avgSpokenScore ?? 0) - (a.avgSpokenScore ?? 0)
            : b.spokenAttempts - a.spokenAttempts
      );

      return {
        mostSeenTop3: seen,
        mostHeardTop3: heard,
        mostTappedTop3: tapped,
        mostSpokenTop3: spoken,
      };
    }, [enrichedWords]);

  // ============================================================================
  // 2. ACTION DECK: "0 SPOKEN / LOW LISTEN" GAPS
  // ============================================================================
  const zeroSpokenHighSeen = useMemo(
    () =>
      [...enrichedWords]
        .filter((w) => w.spokenAttempts === 0 && (w.seenCount > 0 || w.tappedCorrect > 0))
        .sort(
          (a, b) =>
            b.seenCount + b.tappedCorrect * 2 - (a.seenCount + a.tappedCorrect * 2)
        )
        .slice(0, 6),
    [enrichedWords]
  );

  const lowListenWords = useMemo(
    () =>
      [...enrichedWords]
        .filter((w) => w.heardCount <= 1)
        .sort((a, b) => a.heardCount - b.heardCount || b.seenCount - a.seenCount)
        .slice(0, 6),
    [enrichedWords]
  );

  const [gapTab, setGapTab] = useState<"ZERO_SPOKEN" | "LOW_LISTEN">(
    "ZERO_SPOKEN"
  );
  const activeGapList =
    gapTab === "ZERO_SPOKEN" ? zeroSpokenHighSeen : lowListenWords;

  // ============================================================================
  // 3. MINI AUDIO QUIZ ("EAR & TAP BOOSTER")
  // ============================================================================
  const [quizTarget, setQuizTarget] = useState<EnrichedWordStat | null>(null);
  const [quizOptions, setQuizOptions] = useState<EnrichedWordStat[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [quizStreak, setQuizStreak] = useState(0);

  const generateNextQuizRound = useCallback(
    (autoPlay = false) => {
      if (enrichedWords.length < 3) return;

      // Prioritize low-heard or missed-tap words so the quiz actually helps weak spots
      const pool = [...enrichedWords].sort(
        (a, b) =>
          a.heardCount + a.tappedCorrect - (b.heardCount + b.tappedCorrect)
      );
      const candidatePool = pool.slice(0, Math.max(6, Math.floor(pool.length * 0.4)));
      const target =
        candidatePool[Math.floor(Math.random() * candidatePool.length)] ||
        enrichedWords[0];

      const distractors = enrichedWords
        .filter((w) => w.id !== target.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

      const choices = [target, ...distractors].sort(() => Math.random() - 0.5);

      setQuizTarget(target);
      setQuizOptions(choices);
      setSelectedOptionId(null);

      if (autoPlay) {
        onListen(target, 0.9);
      }
    },
    [enrichedWords, onListen]
  );

  useEffect(() => {
    if (!quizTarget && enrichedWords.length >= 3) {
      generateNextQuizRound(false);
    }
  }, [enrichedWords.length, generateNextQuizRound, quizTarget]);

  const handleQuizSelect = (option: EnrichedWordStat) => {
    if (!quizTarget || selectedOptionId) return;
    setSelectedOptionId(option.id);

    const isCorrect = option.id === quizTarget.id;
    onTapQuizResult(quizTarget, isCorrect);

    if (isCorrect) {
      setQuizStreak((s) => s + 1);
    } else {
      setQuizStreak(0);
    }
  };

  // ============================================================================
  // HELPER TO RENDER EACH OF THE 4 PODIUM CARDS
  // ============================================================================
const renderPodiumCard = (config: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    items: EnrichedWordStat[];
    headerGradient: string;
    badgeColor: string;
    micBtnColor: string; // <-- 1. Add this
    formatMetric: (w: EnrichedWordStat) => string;
  }) => {
    const champion = config.items[0];
    const runnersUp = config.items.slice(1, 3);

    return (
      <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        {/* Top Colored Banner */}
        <div className={`px-5 py-4 text-white ${config.headerGradient}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest opacity-90">
              {config.subtitle}
            </span>
            <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
              {config.icon}
            </div>
          </div>
          <h3 className="mt-1 text-lg font-black tracking-tight">
            {config.title}
          </h3>
        </div>

        {/* Body: #1 Champion + #2 & #3 Runner-Ups */}
        <div className="flex flex-1 flex-col justify-between p-5">
          {!champion ? (
            <div className="flex h-40 flex-col items-center justify-center text-center text-xs font-medium text-slate-400">
              No stats recorded yet. Practice to crown a #1 word!
            </div>
          ) : (
            <>
              {/* #1 Champion Box */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    <Trophy className="h-3 w-3 text-amber-500" /> #1 Champion
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-black ${config.badgeColor}`}
                  >
                    {config.formatMetric(champion)}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xl font-black text-slate-900 dark:text-white">
                      {champion.cleanWord}
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-400">
                      {champion.translation || champion.categoryLabel}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onListen(champion, 0.9)}
                      disabled={status !== "idle"}
                      title="Listen"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-indigo-600 shadow-xs border border-slate-200 hover:bg-indigo-600 hover:text-white transition dark:bg-slate-900 dark:border-slate-700"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onPronunciationTest(champion)}
                      disabled={status === "analyzing"}
                      title="Try"
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-white shadow-xs transition active:scale-95 ${
                        activeMicWordId === champion.id &&
                        status === "listening"
                          ? "bg-rose-600 animate-pulse"
                          : config.micBtnColor
                      }`}
                    >

                      {activeMicWordId === champion.id &&
                      status === "listening" ? (
                        <Square className="h-3.5 w-3.5 fill-current" />
                      ) : activeMicWordId === champion.id &&
                        status === "analyzing" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Mic className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* #2 and #3 Runner-Ups */}
              <div className="mt-3 space-y-2">
                {runnersUp.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs dark:border-slate-800/80 dark:bg-slate-900"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        #{idx + 2}
                      </span>
                      <span className="truncate font-extrabold text-slate-800 dark:text-slate-200">
                        {item.cleanWord}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-bold text-slate-500">
                        {config.formatMetric(item)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onListen(item, 0.9)}
                        disabled={status !== "idle"}
                        className="rounded-lg p-1 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* ====================================================================
          ROW 1: THE 4 HALL OF FAME PODIUM CARDS (1st, 2nd, 3rd)
      ==================================================================== */}
<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {renderPodiumCard({
          title: "Most Seen",
          subtitle: "Visual Exposure",
          icon: <Eye className="h-5 w-5 text-white" />,
          items: mostSeenTop3,
          headerGradient: "bg-gradient-to-br from-sky-500 to-blue-600",
          badgeColor: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
          micBtnColor: "bg-gradient-to-br from-sky-500 to-blue-600 hover:opacity-90",
          formatMetric: (w) => `${w.seenCount}x seen`,
        })}

        {renderPodiumCard({
          title: "Most Heard",
          subtitle: "Ear Training",
          icon: <Ear className="h-5 w-5 text-white" />,
          items: mostHeardTop3,
          headerGradient: "bg-gradient-to-br from-indigo-500 to-violet-600",
          badgeColor: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
          micBtnColor: "bg-gradient-to-br from-indigo-500 to-violet-600 hover:opacity-90",
          formatMetric: (w) => `${w.heardCount}x heard`,
        })}

        {renderPodiumCard({
          title: "Most Tapped",
          subtitle: "Exercise Accuracy",
          icon: <MousePointerClick className="h-5 w-5 text-white" />,
          items: mostTappedTop3,
          headerGradient: "bg-gradient-to-br from-amber-500 to-orange-500",
          badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
          micBtnColor: "bg-gradient-to-br from-amber-500 to-orange-500 hover:opacity-90",
          formatMetric: (w) =>
            `${w.tappedCorrect}/${w.tappedCorrect + w.tappedWrong} taps`,
        })}

        {renderPodiumCard({
          title: "Most Spoken",
          subtitle: "Voice Mastery",
          icon: <Mic className="h-5 w-5 text-white" />,
          items: mostSpokenTop3,
          headerGradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
          badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
          micBtnColor: "bg-gradient-to-br from-emerald-500 to-teal-600 hover:opacity-90",
          formatMetric: (w) => {
            const sc = sessionScores[w.id]?.overall ?? w.avgSpokenScore;
            return sc !== null ? `${sc}% (${w.spokenAttempts}x)` : `${w.spokenAttempts}x`;
          },
        })}
      </div>

      {/* ====================================================================
          ROW 2: INTERACTIVE LEARNING BOOSTERS (Left: 0 Spoken / Low Listen | Right: Mini Audio Quiz)
      ==================================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT 7 COLS: "0 Spoken" & "Low Listen" Action Deck */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Smart Blind-Spot Detector
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Level Up Your Unspoken & Unheard Words
                </h3>
              </div>

              {/* Sub-toggle: 0 Spoken vs Low Listen */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-extrabold dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setGapTab("ZERO_SPOKEN")}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    gapTab === "ZERO_SPOKEN"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  🎙️ 0 Spoken ({zeroSpokenHighSeen.length})
                </button>
                <button
                  type="button"
                  onClick={() => setGapTab("LOW_LISTEN")}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    gapTab === "LOW_LISTEN"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  👂 Low Listen ({lowListenWords.length})
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              {gapTab === "ZERO_SPOKEN"
                ? "You've seen and tapped these words in lessons, but you haven't spoken them out loud yet. Say them once to boost your mastery!"
                : "These words have low audio exposure. Tap Normal or Slow (0.6x) to lock their sound into your ear!"}
            </p>

            {/* Grid of 6 Action Pills */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeGapList.map((item) => {
                const isListening =
                  activeMicWordId === item.id && status === "listening";
                const isAnalyzing =
                  activeMicWordId === item.id && status === "analyzing";
                const isPlayingNormal =
                  activeTtsKey === `${item.id}-0.9` &&
                  (isTtsPlaying || isTtsLoading);
                const isPlayingSlow =
                  activeTtsKey === `${item.id}-0.6` &&
                  (isTtsPlaying || isTtsLoading);

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-slate-900 dark:text-white">
                        {item.cleanWord}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] font-bold text-slate-400">
                        <span>👁️ {item.seenCount}</span>
                        <span>👂 {item.heardCount}</span>
                        <span>👆 {item.tappedCorrect}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onListen(item, 0.9)}
                        disabled={status !== "idle"}
                        title="Listen (1.0x)"
                        className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                          isPlayingNormal
                            ? "bg-indigo-600 text-white animate-pulse"
                            : "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                        }`}
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onListen(item, 0.6)}
                        disabled={status !== "idle"}
                        title="Slow (0.6x)"
                        className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
                          isPlayingSlow
                            ? "border-amber-500 bg-amber-500 text-white animate-pulse"
                            : "border-slate-200 bg-white text-slate-500 hover:border-amber-400 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-900"
                        }`}
                      >
                        <Turtle className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onPronunciationTest(item)}
                        disabled={isAnalyzing}
                        className={`inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-extrabold text-white transition ${
                          isListening
                            ? "bg-rose-600 animate-pulse"
                            : "bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600"
                        }`}
                      >
                        {isListening ? (
                          <Square className="h-3 w-3 fill-current" />
                        ) : isAnalyzing ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Mic className="h-3 w-3" />
                            <span>Say</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {activeGapList.length > 0 && (
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400">
                Want to clear all {activeGapList.length} in a guided session?
              </span>
              <button
                type="button"
                onClick={() => onStartDojo(activeGapList)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-indigo-500 transition active:scale-95"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Practice {activeGapList.length} Words in Dojo
              </button>
            </div>
          )}
        </div>

        {/* RIGHT 5 COLS: INTERACTIVE MINI AUDIO QUIZ ("EAR & TAP BOOSTER") */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  Mini Audio Challenge
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Ear & Tap Booster
                </h3>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-extrabold text-amber-600 dark:text-amber-400">
                <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>Streak: {quizStreak}</span>
              </div>
            </div>

            {!quizTarget ? (
              <div className="flex h-48 items-center justify-center text-center text-xs text-slate-400">
                Unlock at least 3 words to play the Ear & Tap Booster!
              </div>
            ) : (
              <div className="mt-5">
                {/* Mystery Speaker Box */}
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-5 text-center dark:border-indigo-900/50 dark:bg-indigo-950/20">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onListen(quizTarget, 0.9)}
                      disabled={status !== "idle"}
                      className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 transition active:scale-95"
                    >
                      <Volume2 className="h-5 w-5" />
                      Play Mystery Audio
                    </button>

                    <button
                      type="button"
                      onClick={() => onListen(quizTarget, 0.6)}
                      disabled={status !== "idle"}
                      title="Play Slow (0.6x)"
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100 transition active:scale-95 dark:border-amber-800 dark:bg-amber-950/40"
                    >
                      <Turtle className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="mt-2.5 text-xs font-semibold text-slate-500">
                    Listen closely and tap the word you heard (+1 Heard & +1 Tap)
                  </p>
                </div>

                {/* 3 Multiple-Choice Word Pills */}
                <div className="mt-4 space-y-2.5">
                  {quizOptions.map((option) => {
                    const isPicked = selectedOptionId === option.id;
                    const isCorrectTarget = option.id === quizTarget.id;
                    const showResult = selectedOptionId !== null;

                    let btnStyle =
                      "border-slate-200 bg-white text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100";

                    if (showResult) {
                      if (isCorrectTarget) {
                        btnStyle =
                          "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200";
                      } else if (isPicked && !isCorrectTarget) {
                        btnStyle =
                          "border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-200";
                      } else {
                        btnStyle =
                          "border-slate-200 bg-slate-50 text-slate-400 opacity-60 dark:border-slate-800 dark:bg-slate-900";
                      }
                    }

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={showResult}
                        onClick={() => handleQuizSelect(option)}
                        className={`flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3 text-left font-black transition-all ${btnStyle}`}
                      >
                        <div>
                          <span className="text-base">{option.cleanWord}</span>
                          {showResult && option.translation && (
                            <span className="ml-2 text-xs font-semibold opacity-75">
                              ({option.translation})
                            </span>
                          )}
                        </div>

                        {showResult && isCorrectTarget && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        )}
                        {showResult && isPicked && !isCorrectTarget && (
                          <XCircle className="h-5 w-5 text-rose-600" />
                        )}
                        {!showResult && (
                          <HelpCircle className="h-4 w-4 text-slate-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {quizTarget && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400">
                {selectedOptionId
                  ? selectedOptionId === quizTarget.id
                    ? "🎉 Spot on! +1 Tap & +1 Heard logged."
                    : `Answer: "${quizTarget.cleanWord}"`
                  : "Pick an option above"}
              </span>

              <button
                type="button"
                onClick={() => generateNextQuizRound(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white hover:bg-indigo-600 transition dark:bg-white dark:text-slate-900"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Next Word
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}