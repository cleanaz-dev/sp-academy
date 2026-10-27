"use client";

import { usePronunciation } from "@/context/pronunciation-context";
import { useSpeak } from "@/hooks/use-speak";
import { useWordAudio } from "@/context/word-audio-context";
import { useMatrix } from "@/context/matrix-context";
import { cleanWord } from "@/components/foundation/word-tap";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Mic,
  Square,
  Volume2,
  ArrowRight,
  Activity,
  AlertCircle,
  CheckCircle2,
  Ear,
  Loader2,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

type WordResult = { score: number; omitted: boolean };
type VoicePhase = "waiting" | "speaking" | "wrapping_up";

// Green = good, orange = needs work, red = retry
const tone = (score: number, omitted: boolean) => {
  if (omitted || score < 60) return "text-red-600 bg-red-50";
  if (score < 80) return "text-orange-500 bg-orange-50";
  return "text-green-600 bg-green-50";
};

/**
 * Clean 60fps live microphone waveform using Web Audio API.
 * Detects 3 phases:
 *  - "waiting": user hasn't spoken yet
 *  - "speaking": user is actively speaking
 *  - "wrapping_up": user spoke and just paused (Azure is detecting end-of-speech silence)
 */
function LiveWaveform({ onPhaseChange }: { onPhaseChange?: (phase: VoicePhase) => void }) {
  const BAR_COUNT = 28;
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasSpokenRef = useRef(false);
  const phaseRef = useRef<VoicePhase>("waiting");
  const silenceStartRef = useRef<number | null>(null);

  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let stream: MediaStream | null = null;
    let rafId: number | null = null;
    let isCancelled = false;

    const setPhase = (next: VoicePhase) => {
      if (phaseRef.current !== next) {
        phaseRef.current = next;
        onPhaseChange?.(next);
      }
    };

    async function setupMic() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioContextClass();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();

        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.75;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const half = Math.floor(BAR_COUNT / 2);

        const updateWaveform = () => {
          analyser.getByteFrequencyData(dataArray);

          // Calculate average energy in vocal range
          let sum = 0;
          const vocalBins = Math.min(20, dataArray.length);
          for (let i = 1; i < vocalBins; i++) {
            sum += dataArray[i];
          }
          const avg = sum / vocalBins;
          const isSpeakingNow = avg > 18;
          const now = performance.now();

          if (isSpeakingNow) {
            hasSpokenRef.current = true;
            silenceStartRef.current = null;
            setPhase("speaking");
          } else if (hasSpokenRef.current) {
            if (!silenceStartRef.current) {
              silenceStartRef.current = now;
            } else if (now - silenceStartRef.current > 400) {
              // User has finished speaking and paused for 400ms
              setPhase("wrapping_up");
            }
          }

          // Mirror bars from the center outward
          for (let i = 0; i < half; i++) {
            const value = dataArray[i + 1] ?? 0;
            const normalized = Math.min(1, value / 200);
            const heightPx = Math.max(6, Math.round(normalized * 44));

            const leftIdx = half - 1 - i;
            const rightIdx = half + i;

            const leftBar = barRefs.current[leftIdx];
            const rightBar = barRefs.current[rightIdx];

            if (leftBar) {
              leftBar.style.height = `${heightPx}px`;
              leftBar.style.opacity = `${0.35 + normalized * 0.65}`;
            }
            if (rightBar) {
              rightBar.style.height = `${heightPx}px`;
              rightBar.style.opacity = `${0.35 + normalized * 0.65}`;
            }
          }

          rafId = requestAnimationFrame(updateWaveform);
        };

        rafId = requestAnimationFrame(updateWaveform);
      } catch (err) {
        console.warn("Waveform mic access unavailable:", err);
      }
    }

    setupMic();

    return () => {
      isCancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }
    };
  }, [onPhaseChange]);

  return (
    <div className="flex h-12 items-center justify-center gap-1 px-4" aria-hidden="true">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            barRefs.current[i] = el;
          }}
          style={{ height: "6px", opacity: 0.35 }}
          className="w-1.5 rounded-full bg-indigo-600 transition-[height,opacity] duration-75 ease-out"
        />
      ))}
    </div>
  );
}

export function PronunciationStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { speak, isPlaying: isPlayingTTS, stop: stopTTS } = useSpeak();
  const { playWord, isPlaying: isPlayingWord, stopAudio: stopWordAudio, targetLang: contextLang } = useWordAudio();
  const { status, isRecording, score, error, assessSpeech, cancelAssessment, reset } = usePronunciation();

  const { trackInteraction } = useMatrix();
  const trackedSeen = useRef<Set<string>>(new Set());
  const trackedHeard = useRef<Set<string>>(new Set());
  const lastTrackedScore = useRef<unknown>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  // Which text the current score belongs to, so a score never lands on the wrong word
  const [assessedText, setAssessedText] = useState<string | null>(null);
  const [voicePhase, setVoicePhase] = useState<VoicePhase>("waiting");

  const isListening = status === "listening";
  const isAnalyzing = status === "analyzing";

  const targetLang = contextLang || data.targetLang || "fr-FR";

  const breakdown = data.breakdown || [];
  const totalSteps = breakdown.length + 1;
  const isFullSentenceStep = currentIndex === breakdown.length;

  const currentText = isFullSentenceStep ? data.referenceText : breakdown[currentIndex]?.text || "";
  const currentPhonetic = isFullSentenceStep ? null : breakdown[currentIndex]?.phonetic;
  const currentHint = isFullSentenceStep ? "Put it all together!" : breakdown[currentIndex]?.hint;

  const activeFocusSound = data.focusSounds?.find((fs: any) => fs.positions?.includes(currentIndex));
  const isAudioActive = isFullSentenceStep ? isPlayingTTS : isPlayingWord;

  const tokens: string[] = (currentText ?? "").split(/\s+/).filter(Boolean);
  const scoreIsForThisStep = !!score && assessedText === currentText;

  // Reset voice phase when listening ends
  useEffect(() => {
    if (!isListening) setVoicePhase("waiting");
  }, [isListening]);

  // word -> result, straight from Azure
  const wordResults = useMemo(() => {
    const map = new Map<string, WordResult>();
    if (!score) return map;
    for (const w of score.words ?? []) {
      const key = cleanWord(w.word);
      if (!key) continue;
      const omitted = w.errorType === "Omission";
      map.set(key, { score: omitted ? 0 : w.accuracyScore, omitted });
    }
    return map;
  }, [score]);

  // Falls back to the overall score if Azure merged/split a word
  const resultFor = (token: string): WordResult | null => {
    if (!score) return null;
    const key = cleanWord(token);
    if (!key) return null;
    return wordResults.get(key) ?? { score: score.pronunciationScore, omitted: false };
  };

  // 1. SEEN: each word on screen counts once (the full sentence reuses words already seen)
  useEffect(() => {
    tokens.forEach((t) => {
      const key = cleanWord(t);
      if (key && !trackedSeen.current.has(key)) {
        trackInteraction(key, { seen: 1 });
        trackedSeen.current.add(key);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentText]);

  // 2. SPOKEN: each word saves its OWN score, only for the text it was recorded for
  useEffect(() => {
    if (!score || score === lastTrackedScore.current) return;
    if (assessedText !== currentText) return;
    lastTrackedScore.current = score;

    tokens.forEach((t) => {
      const key = cleanWord(t);
      if (!key) return;
      const r = wordResults.get(key);
      trackInteraction(key, {
        spokenAttempt: true,
        spokenScore: r ? r.score : score.pronunciationScore,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const stopAllAudio = () => {
    try {
      stopTTS();
      stopWordAudio();
    } catch (e) {
      console.warn("Error stopping audio:", e);
    }
  };

  useEffect(() => {
    reset();
    setAssessedText(null);
    setVoicePhase("waiting");
    stopAllAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  useEffect(() => {
    return () => stopAllAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartRecording = async () => {
    if (status !== "idle") return;

    stopAllAudio();

    if (!currentText || !targetLang) {
      console.error("Missing text or targetLang:", { currentText, targetLang });
      return;
    }

    setAssessedText(currentText);
    await assessSpeech(currentText, targetLang);
  };

  const handlePlayAudio = async () => {
    if (isRecording) return;

    if (isAudioActive) {
      stopAllAudio();
      return;
    }

    stopAllAudio();

    // 3. HEARD: first listen per word
    tokens.forEach((t) => {
      const key = cleanWord(t);
      if (key && !trackedHeard.current.has(key)) {
        trackInteraction(key, { heard: 1 });
        trackedHeard.current.add(key);
      }
    });

    if (isFullSentenceStep) {
      await speak(currentText, targetLang);
    } else {
      await playWord(currentText, "m");
    }
  };

  const handleNextWord = () => {
    stopAllAudio();
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onNext();
    }
  };

  const ScoreBar = ({ label, value }: { label: string; value: number }) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
        <span className="text-gray-500">{label}</span>
        <span className={value >= 80 ? "text-green-600" : value >= 60 ? "text-yellow-600" : "text-red-600"}>
          {Math.round(value)}%
        </span>
      </div>
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            value >= 80 ? "bg-green-500" : value >= 60 ? "bg-yellow-400" : "bg-red-500"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full p-8 animate-in fade-in duration-500 overflow-y-auto">
      {/* Header & Progress */}
      <div className="mb-10 text-center">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-6">Pronunciation Lab</h2>

        <div className="flex items-center justify-center gap-2 mb-2">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-8 bg-blue-600"
                  : idx < currentIndex
                  ? "w-2.5 bg-green-500"
                  : "w-2.5 bg-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          {isFullSentenceStep ? "Final Step: Full Sentence" : `Part ${currentIndex + 1} of ${totalSteps - 1}`}
        </p>
      </div>

      {/* Target Flashcard */}
      <div
        className={`mb-8 p-10 bg-white rounded-3xl border shadow-xs text-center relative overflow-hidden transition-all duration-300 ${
          isListening
            ? "border-indigo-300 ring-4 ring-indigo-500/10"
            : isAnalyzing
            ? "border-amber-200 bg-amber-50/10"
            : "border-gray-200"
        }`}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-50 opacity-40 pointer-events-none">
          <Mic size={160} />
        </div>

        {/* Each word colored by its own score after recording */}
        <p className="relative z-10 mb-4 flex flex-wrap justify-center gap-x-2 gap-y-2 text-4xl md:text-5xl font-bold leading-snug tracking-tight text-gray-900">
          {tokens.map((token, i) => {
            const r = scoreIsForThisStep ? resultFor(token) : null;
            if (!r) return <span key={i}>{token}</span>;
            return (
              <span
                key={i}
                title={r.omitted ? "Skipped" : `${Math.round(r.score)}%`}
                className={`rounded-xl px-2 transition-colors ${tone(r.score, r.omitted)} ${
                  r.omitted ? "line-through decoration-2" : ""
                }`}
              >
                {token}
              </span>
            );
          })}
        </p>

        {currentPhonetic && (
          <p className="text-lg font-mono text-gray-400 relative z-10 mb-6">/{currentPhonetic}/</p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
          {activeFocusSound && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-sm font-bold border border-purple-200">
              <Ear size={16} /> Focus: {activeFocusSound.sound}
            </div>
          )}
          {currentHint && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100">
              <Activity size={16} /> {currentHint}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Recorder & State Dock */}
      <div className="mb-8 flex flex-col items-center">
        {/* 1. IDLE STATE: Listen & Start Speaking Buttons */}
        {status === "idle" && (
          <div className="w-full flex flex-col items-center gap-2.5">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={handlePlayAudio}
                disabled={isRecording}
                className={`flex-1 py-5 px-6 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all border shadow-xs text-lg disabled:opacity-50 ${
                  isAudioActive
                    ? "bg-blue-50 border-blue-200 text-blue-700 ring-4 ring-blue-50"
                    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {isAudioActive ? <Square size={24} className="fill-current" /> : <Volume2 size={24} />}
                {isAudioActive ? "Stop" : "Listen"}
              </button>

              <button
                onClick={handleStartRecording}
                className="flex-1 py-5 px-6 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all border shadow-xs text-lg bg-gray-900 hover:bg-black border-gray-900 text-white active:scale-[0.98]"
              >
                {scoreIsForThisStep ? (
                  <>
                    <RotateCcw size={22} />
                    Try Again
                  </>
                ) : (
                  <>
                    <Mic size={24} />
                    Start Speaking
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 font-medium text-center">
              Recording stops and analyzes automatically when you finish speaking
            </p>
          </div>
        )}

        {/* 2. LISTENING STATE: Live Waveform + Automatic End Guidance */}
        {isListening && (
          <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-indigo-200 bg-indigo-50/50 px-6 py-5 animate-in fade-in zoom-in-95 duration-200">
            <LiveWaveform onPhaseChange={setVoicePhase} />

            <div className="mt-3 flex items-center gap-2 text-sm font-bold">
              {voicePhase === "waiting" && (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-indigo-800">
                    {isFullSentenceStep ? "Speak the sentence clearly now..." : "Say the word clearly now..."}
                  </span>
                </>
              )}

              {voicePhase === "speaking" && (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-ping" />
                  <span className="text-green-700">Hearing you — pause when you're done</span>
                </>
              )}

              {voicePhase === "wrapping_up" && (
                <>
                  <Sparkles size={16} className="text-indigo-600 animate-spin" />
                  <span className="text-indigo-700">Got it! Starting analysis automatically...</span>
                </>
              )}
            </div>

            <p className="mt-1 text-xs text-indigo-600/80 text-center">
              {voicePhase === "wrapping_up"
                ? "Hold still for a moment while we wrap up your audio"
                : "No need to press stop — analysis starts automatically after you finish"}
            </p>

            {/* Secondary Cancel button so users don't mistakenly click it to 'submit' */}
            <button
              onClick={cancelAssessment}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-200/60 hover:text-gray-700 transition-colors"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        )}

        {/* 3. ANALYZING STATE: Clear Feedback while Azure scores */}
        {isAnalyzing && (
          <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-amber-200 bg-amber-50/60 px-6 py-6 text-center animate-in fade-in duration-200">
            <Loader2 size={30} className="mb-2.5 animate-spin text-amber-600" />
            <p className="font-bold text-gray-900 text-base">Analyzing your pronunciation...</p>
            <p className="text-xs text-gray-500 mt-1">Grading accuracy, fluency, and syllable stress</p>
          </div>
        )}
      </div>

      {/* Azure Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Azure Results Display */}
      {scoreIsForThisStep && score && status === "idle" && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-xs animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Activity className="text-blue-500" size={24} />
              <h3 className="font-extrabold text-gray-900 text-lg">Analysis</h3>
            </div>
            {score.pronunciationScore >= 80 && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                <CheckCircle2 size={16} /> Great job!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-5">
            <ScoreBar label="Pronunciation" value={score.pronunciationScore} />
            <ScoreBar label="Accuracy" value={score.accuracyScore} />
            <ScoreBar label="Fluency" value={score.fluencyScore} />
          </div>

          <div className="flex flex-wrap justify-center gap-4 border-t border-gray-100 pt-4 text-sm font-semibold text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-green-500" /> 80%+ Great
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-orange-400" /> 60–79% Getting there
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500" /> Under 60% or skipped
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-auto pt-6 flex justify-end border-t border-gray-100">
        <button
          onClick={handleNextWord}
          disabled={isRecording}
          className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isFullSentenceStep ? "Finish Practice" : "Next Word"} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}