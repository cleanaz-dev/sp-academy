// components/sprite/sprite-exercise-arcade.tsx
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  CheckCircle2,
  Zap,
  ArrowRight,
  Mic,
  Trophy,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { useSprite } from "@/context/sprite-context";
import { useMatrix } from "@/context/matrix-context";
import { completeSpriteExercise } from "@/app/actions/complete-sprite-exercise";
import type { SpriteExerciseContent } from "@/lib/schema/sprite-exercise-schema";

interface SpriteExerciseArcadeProps {
  userId: string;
  exerciseId: string;
  title: string;
  spriteName: string;
  content: SpriteExerciseContent;
  onFinishExercise: (newEnergy: number) => void;
  onClose: () => void;
}

export function SpriteExerciseArcade({
  userId,
  exerciseId,
  title,
  spriteName,
  content,
  onFinishExercise,
  onClose,
}: SpriteExerciseArcadeProps) {
  const { playAudioUrl } = useSprite();
  const { trackInteraction } = useMatrix();

  const [roundIdx, setRoundIdx] = useState<0 | 1 | 2>(0);
  const trackedSeenRef = useRef<Set<string>>(new Set());

  // Splits a phrase into normalized words and tracks them in the Word Matrix
  const trackPhrase = (
    phrase?: string | null,
    payload?: {
      seen?: number;
      heard?: number;
      tappedCorrect?: number;
      tappedWrong?: number;
      spokenAttempt?: boolean;
      spokenScore?: number;
    }
  ) => {
    if (!phrase || !payload) return;
    const uniqueWords = Array.from(
      new Set(
        phrase
          .split(/\s+/)
          .map((w) =>
            w
              .normalize("NFC")
              .trim()
              .toLowerCase()
              .replace(/[^\p{L}\p{N}'’-]/gu, "")
          )
          .filter((w) => w.length >= 2)
      )
    );
    uniqueWords.forEach((w) => trackInteraction(w, payload));
  };

  // ================= ROUND 1 STATE: VISUAL MATCH =================
  const cards = content.visualMatch?.cards || [];
  const [selectedWordId, setSelectedWordId] = useState<string | null>(
    cards[0]?.id ?? null
  );
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [wrongCardId, setWrongCardId] = useState<string | null>(null);

  // Track "seen: 1" when each round mounts
  useEffect(() => {
    const roundKey = `round-${roundIdx}`;
    if (trackedSeenRef.current.has(roundKey)) return;
    trackedSeenRef.current.add(roundKey);

    if (roundIdx === 0) {
      cards.forEach((c) => trackPhrase(c.word, { seen: 1 }));
    } else if (roundIdx === 1) {
      (content.sentenceDash?.items || []).forEach((it) =>
        trackPhrase(it.fullTarget, { seen: 1 })
      );
    } else if (roundIdx === 2 && content.speechBurst?.targetPhrase) {
      trackPhrase(content.speechBurst.targetPhrase, { seen: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx]);

  // Shuffle word pills once so they aren't in the exact same order as the 2x2 grid
  const shuffledWordPills = useMemo(
    () => [...cards].sort((a, b) => a.word.localeCompare(b.word)),
    [cards]
  );

  const handleCardTap = (cardId: string, audioUrl?: string | null) => {
    if (matchedIds.has(cardId) || !selectedWordId) return;

    const selectedCard = cards.find((c) => c.id === selectedWordId);

    if (cardId === selectedWordId) {
      if (selectedCard) {
        trackPhrase(selectedCard.word, { tappedCorrect: 1, heard: 1 });
      }
      if (audioUrl) void playAudioUrl(audioUrl);
      const nextMatched = new Set(matchedIds);
      nextMatched.add(cardId);
      setMatchedIds(nextMatched);

      // Auto-select next unmatched word pill
      const nextUnmatched = shuffledWordPills.find(
        (c) => !nextMatched.has(c.id)
      );
      setSelectedWordId(nextUnmatched?.id ?? null);
    } else {
      if (selectedCard) {
        trackPhrase(selectedCard.word, { tappedWrong: 1 });
      }
      setWrongCardId(cardId);
      setTimeout(() => setWrongCardId(null), 500);
    }
  };

  // ================= ROUND 2 STATE: BINARY SENTENCE DASH =================
  const dashItems = content.sentenceDash?.items || [];
  const [dashItemIdx, setDashItemIdx] = useState(0);
  const [forkIdx, setForkIdx] = useState(0);
  const [builtTokens, setBuiltTokens] = useState<string[]>([]);
  const [trapFeedback, setTrapFeedback] = useState<string | null>(null);

  const currentDashItem = dashItems[dashItemIdx];
  const currentFork = currentDashItem?.forks?.[forkIdx];

  // Deterministically randomize whether `correct` is on the left or right for each fork
  const forkOptions = useMemo(() => {
    if (!currentFork) return [];
    const flip = (dashItemIdx + forkIdx) % 2 === 1;
    return flip
      ? [
          { text: currentFork.trap, isCorrect: false },
          { text: currentFork.correct, isCorrect: true },
        ]
      : [
          { text: currentFork.correct, isCorrect: true },
          { text: currentFork.trap, isCorrect: false },
        ];
  }, [currentFork, dashItemIdx, forkIdx]);

  const handlePickFork = (opt: { text: string; isCorrect: boolean }) => {
    if (!currentDashItem || !currentFork) return;

    if (opt.isCorrect) {
      trackPhrase(opt.text, { tappedCorrect: 1 });
      setTrapFeedback(null);
      const nextBuilt = [...builtTokens, opt.text];
      setBuiltTokens(nextBuilt);

      if (forkIdx + 1 < currentDashItem.forks.length) {
        setForkIdx(forkIdx + 1);
      } else {
        // Sentence completed! Play audio if available & track heard
        trackPhrase(currentDashItem.fullTarget, { heard: 1 });
        if (currentDashItem.audioUrl) {
          void playAudioUrl(currentDashItem.audioUrl);
        }
      }
    } else {
      trackPhrase(currentFork.correct, { tappedWrong: 1 });
      setTrapFeedback(
        currentFork.whyTrap ||
          `Watch out! "${opt.text}" is a common trap here.`
      );
    }
  };

  const isDashSentenceComplete =
    currentDashItem && builtTokens.length >= currentDashItem.forks.length;

  const advanceDashOrRound = () => {
    if (dashItemIdx + 1 < dashItems.length) {
      setDashItemIdx(dashItemIdx + 1);
      setForkIdx(0);
      setBuiltTokens([]);
      setTrapFeedback(null);
    } else {
      setRoundIdx(2);
    }
  };

  // ================= ROUND 3 STATE: 3-REP SPEECH BURST =================
  const burst = content.speechBurst;
  const requiredReps = burst?.requiredReps || 3;
  const [repsDone, setRepsDone] = useState(0);
  const [isListeningRep, setIsListeningRep] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [awardedEnergy, setAwardedEnergy] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const completeOneSpeechRep = () => {
    setIsListeningRep(false);
    if (burst?.targetPhrase) {
      trackPhrase(burst.targetPhrase, {
        spokenAttempt: true,
        spokenScore: 88,
      });
    }
    setRepsDone((prev) => Math.min(requiredReps, prev + 1));
  };

  const triggerSpeechRep = () => {
    if (repsDone >= requiredReps || isListeningRep) return;

    const SpeechRec =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : null;

    setIsListeningRep(true);

    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        recognitionRef.current = rec;
        rec.lang = "fr-FR";
        rec.interimResults = false;
        rec.maxAlternatives = 1;

        rec.onresult = () => {
          completeOneSpeechRep();
        };
        rec.onerror = () => {
          completeOneSpeechRep();
        };
        rec.start();
        return;
      } catch {
        // Fallback below if browser blocks SpeechRecognition
      }
    }

    // Fallback: 1.4s active mic pulse per rep
    setTimeout(() => {
      completeOneSpeechRep();
    }, 1400);
  };

  const handleClaimEnergyReward = async () => {
    setIsClaimingReward(true);
    const res = await completeSpriteExercise({ userId, exerciseId });
    setIsClaimingReward(false);
    setAwardedEnergy(res.newEnergy);
    setWorkoutCompleted(true);
  };

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#141D2E] border-t-2 border-teal-400/50">
      {/* TOP ARCADE HEADER & 3-ROUND PROGRESS */}
      <div className="border-b border-slate-600/60 bg-[#0E1522] px-6 py-3.5 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-300 px-2 py-0.5 text-[10px] font-black uppercase text-slate-950 shrink-0">
              <Zap className="h-3 w-3 fill-current" /> +1 Energy Workout
            </span>
            <h4 className="text-sm font-black text-white truncate">{title}</h4>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 3-Round Progress Bar */}
        <div className="grid grid-cols-3 gap-2">
          {["1. Visual Match", "2. Sentence Dash", "3. Voice Burst"].map(
            (label, idx) => (
              <div key={label} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    idx < roundIdx || workoutCompleted
                      ? "bg-teal-400"
                      : idx === roundIdx
                        ? "bg-amber-300"
                        : "bg-slate-700"
                  }`}
                />
                <span
                  className={`block text-[10px] font-extrabold uppercase tracking-wider ${
                    idx === roundIdx ? "text-amber-300" : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* MAIN STAGE BODY */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col justify-between">
        {workoutCompleted ? (
          /* ================= WORKOUT COMPLETE / +1 ENERGY REWARD SCREEN ================= */
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="my-auto flex flex-col items-center justify-center text-center py-8 space-y-4"
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-amber-300 bg-amber-400/20 shadow-[0_0_40px_rgba(251,191,36,0.35)]">
              <Zap className="h-10 w-10 text-amber-300 fill-current" />
            </div>

            <h3 className="text-2xl font-black text-white">
              +1 Sprite Energy Charged! ⚡
            </h3>
            <p className="text-sm font-semibold text-slate-300 max-w-sm leading-relaxed">
              You crushed all 3 repair rounds! {spriteName} now has{" "}
              <span className="text-amber-300 font-black">
                {awardedEnergy ?? 1} ⚡
              </span>{" "}
              ready for bonus Chalkboard sessions.
            </p>

            <button
              type="button"
              onClick={() => onFinishExercise(awardedEnergy ?? 1)}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-teal-400 px-6 py-3 text-sm font-black text-slate-950 hover:bg-teal-300 transition shadow-lg"
            >
              <span>Return to {spriteName}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        ) : roundIdx === 0 ? (
          /* ================= ROUND 1: 2x2 PRUNA 3D VISUAL MATCH ================= */
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="text-center">
              <p className="text-sm font-extrabold text-slate-200">
                {content.visualMatch?.instruction ||
                  "Select a phrase below, then tap its matching 3D scene!"}
              </p>
            </div>

            {/* 2x2 Grid of 3D Picture Cards */}
            <div className="grid grid-cols-2 gap-3 my-auto">
              {cards.map((card) => {
                const isMatched = matchedIds.has(card.id);
                const isWrong = wrongCardId === card.id;

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleCardTap(card.id, card.audioUrl)}
                    className={`group relative overflow-hidden rounded-2xl border-2 aspect-[16/10] transition-all ${
                      isMatched
                        ? "border-teal-400 ring-2 ring-teal-400/30"
                        : isWrong
                          ? "border-rose-500 animate-shake"
                          : "border-slate-600/80 hover:border-amber-300"
                    }`}
                  >
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={card.translation}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-800 p-3 text-center text-xs font-bold text-slate-300">
                        {card.translation}
                      </div>
                    )}

                    {/* Matched Overlay */}
                    {isMatched && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-[2px] p-2">
                        <CheckCircle2 className="h-6 w-6 text-teal-400 mb-1" />
                        <span className="text-sm font-black text-white">
                          {card.word}
                        </span>
                        <span className="text-[11px] font-bold text-teal-300">
                          {card.translation}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 4 Selectable Target Word Pills */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2.5">
                {shuffledWordPills.map((pill) => {
                  const isMatched = matchedIds.has(pill.id);
                  const isSelected = selectedWordId === pill.id;

                  return (
                    <button
                      key={pill.id}
                      type="button"
                      disabled={isMatched}
                      onClick={() => {
                        setSelectedWordId(pill.id);
                        trackPhrase(pill.word, { heard: 1 });
                        if (pill.audioUrl) void playAudioUrl(pill.audioUrl);
                      }}
                      className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-black transition ${
                        isMatched
                          ? "border-teal-500/30 bg-teal-950/30 text-teal-400/50 line-through"
                          : isSelected
                            ? "border-amber-300 bg-amber-300/20 text-white shadow-md"
                            : "border-slate-600 bg-[#24324B] text-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <span className="truncate">{pill.word}</span>
                      <Volume2 className="h-3.5 w-3.5 text-teal-300 shrink-0 ml-1.5" />
                    </button>
                  );
                })}
              </div>

              {matchedIds.size >= cards.length && (
                <button
                  type="button"
                  onClick={() => setRoundIdx(1)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-400 py-3 text-xs font-black text-slate-950 hover:bg-teal-300 transition shadow-lg"
                >
                  <span>Next: Binary Sentence Dash</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ) : roundIdx === 1 ? (
          /* ================= ROUND 2: BINARY SENTENCE DASH (2-CHOICE FORKS) ================= */
          <div className="flex-1 flex flex-col justify-between space-y-5">
            {currentDashItem && (
              <>
                <div className="text-center space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                    Sentence {dashItemIdx + 1} of {dashItems.length}
                  </span>
                  <h3 className="text-lg font-black text-white">
                    &ldquo;{currentDashItem.promptNative}&rdquo;
                  </h3>
                </div>

                {/* Live Sentence Assembly Tray */}
                <div className="min-h-[76px] rounded-2xl border-2 border-dashed border-slate-500/60 bg-[#0E1522] p-4 flex flex-wrap items-center justify-center gap-2">
                  {builtTokens.map((tok, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="rounded-xl bg-teal-400 px-3.5 py-1.5 text-sm font-black text-slate-950 shadow-sm"
                    >
                      {tok}
                    </motion.span>
                  ))}

                  {!isDashSentenceComplete && (
                    <span className="rounded-xl border border-amber-300/50 bg-amber-300/10 px-4 py-1.5 text-xs font-bold text-amber-200 animate-pulse">
                      Pick word {forkIdx + 1} of {currentDashItem.forks.length}
                      ...
                    </span>
                  )}
                </div>

                {/* Binary Fork Buttons (Left vs Right) */}
                {!isDashSentenceComplete && currentFork ? (
                  <div className="my-auto space-y-4">
                    <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                      Choose the correct next piece:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {forkOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePickFork(opt)}
                          className="rounded-2xl border-2 border-slate-500/60 bg-[#24324B] hover:border-amber-300 hover:bg-[#2C3E5D] py-6 px-4 text-center text-xl font-black text-white shadow-lg transition active:scale-95"
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>

                    {trapFeedback && (
                      <div className="flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-950/60 px-4 py-2.5 text-xs font-bold text-rose-200">
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                        <span>{trapFeedback}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="my-auto flex flex-col items-center gap-4 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-teal-400/20 border border-teal-400/40 px-4 py-1.5 text-xs font-black text-teal-300">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Sentence Nailed!</span>
                    </div>

                    <button
                      type="button"
                      onClick={advanceDashOrRound}
                      className="w-full max-w-xs flex items-center justify-center gap-2 rounded-xl bg-teal-400 py-3 text-xs font-black text-slate-950 hover:bg-teal-300 transition shadow-lg"
                    >
                      <span>
                        {dashItemIdx + 1 < dashItems.length
                          ? "Next Sentence"
                          : "Final Round: 3x Voice Burst"}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* ================= ROUND 3: 3-REP SPEECH BURST (SHATTER THE SHIELD!) ================= */
          <div className="flex-1 flex flex-col items-center justify-between text-center py-2">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-300">
                Final Round · Rapid Muscle Memory
              </span>
              <h3 className="text-lg font-extrabold text-white">
                {burst?.instruction ||
                  `Say "${burst?.targetPhrase}" ${requiredReps} times to overcharge!`}
              </h3>
            </div>

            {/* Expanding Energy Core / Shield */}
            <div className="relative my-auto flex flex-col items-center justify-center py-6">
              <motion.div
                animate={{
                  scale: 1 + repsDone * 0.18,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className={`relative flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 shadow-2xl transition-colors ${
                  repsDone >= requiredReps
                    ? "border-amber-300 bg-gradient-to-tr from-amber-400/30 to-teal-400/30 shadow-[0_0_60px_rgba(45,212,191,0.5)]"
                    : "border-teal-400/60 bg-[#24324B]"
                }`}
              >
                <Zap
                  className={`h-10 w-10 ${
                    repsDone >= requiredReps
                      ? "text-amber-300 fill-current"
                      : "text-teal-300"
                  }`}
                />
                <span className="mt-1 text-xs font-black text-white">
                  {repsDone} / {requiredReps} Reps
                </span>
              </motion.div>

              <div className="mt-6 rounded-2xl border border-slate-500/50 bg-[#24324B] px-6 py-3.5 shadow-md">
                <div className="text-2xl font-black text-white">
                  {burst?.targetPhrase}
                </div>
                <div className="text-xs font-bold text-teal-300 mt-0.5">
                  &ldquo;{burst?.translation}&rdquo;
                </div>
              </div>
            </div>

            {/* Mic / Claim Button */}
            <div className="w-full max-w-sm space-y-2.5">
              {repsDone < requiredReps ? (
                <div className="flex items-center gap-2.5">
                  {burst?.audioUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        trackPhrase(burst.targetPhrase, { heard: 1 });
                        void playAudioUrl(burst.audioUrl!);
                      }}
                      className="rounded-xl border border-slate-500 bg-[#24324B] p-3.5 text-white hover:border-teal-300 transition"
                      title="Listen"
                    >
                      <Volume2 className="h-5 w-5 text-teal-300" />
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isListeningRep}
                    onClick={triggerSpeechRep}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black transition shadow-lg ${
                      isListeningRep
                        ? "bg-amber-300 text-slate-950 animate-pulse"
                        : "bg-teal-400 text-slate-950 hover:bg-teal-300"
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                    <span>
                      {isListeningRep
                        ? `Listening... Say "${burst?.targetPhrase}"!`
                        : `Speak Rep ${repsDone + 1} of ${requiredReps}`}
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isClaimingReward}
                  onClick={handleClaimEnergyReward}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-teal-400 py-3.5 text-sm font-black text-slate-950 hover:brightness-110 transition shadow-xl"
                >
                  {isClaimingReward ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trophy className="h-4 w-4" />
                      <span>Claim +1 ⚡ Energy Charge!</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}