"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Mic,
  ArrowRight,
  Activity,
  AlertCircle,
  CheckCircle2,
  Ear,
  Volume2,
  Loader2,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { usePronunciation } from "@/context/pronunciation-context";
import { useWordAudio } from "@/context/word-audio-context";
import { useMatrix } from "@/context/matrix-context";
import { useSpeakWord, cleanWord } from "@/components/foundation/word-tap"; // adjust path

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

export function BridgePronunciationStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { status, isRecording, score, error, assessSpeech, cancelAssessment } = usePronunciation();
  const { stopAudio, activeWord, targetLang } = useWordAudio();
  const { trackInteraction } = useMatrix();
  const speak = useSpeakWord();

  const [voicePhase, setVoicePhase] = useState<VoicePhase>("waiting");
  const lastTrackedScore = useRef<unknown>(null);

  const isListening = status === "listening";
  const isAnalyzing = status === "analyzing";

  // Reset phase when listening stops
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

  // Look up a word, falling back to the overall score if Azure merged/split it
  const resultFor = (token: string): WordResult | null => {
    if (!score) return null;
    const key = cleanWord(token);
    if (!key) return null;
    return wordResults.get(key) ?? { score: score.pronunciationScore, omitted: false };
  };

  // Save each word's own score to the matrix (once per result)
  useEffect(() => {
    if (!score || score === lastTrackedScore.current) return;
    lastTrackedScore.current = score;

    (data.referenceText ?? "")
      .split(/\s+/)
      .map(cleanWord)
      .filter(Boolean)
      .forEach((w: string) => {
        const r = wordResults.get(w);
        trackInteraction(w, {
          spokenAttempt: true,
          spokenScore: r ? r.score : score.pronunciationScore,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const handleStartRecording = () => {
    if (status === "idle") {
      stopAudio(); // don't let playback bleed into the mic
      assessSpeech(data.referenceText, targetLang);
    }
  };

  const handleNext = () => {
    stopAudio();
    onNext();
  };

  const focusSound = data.focusSounds?.[0];
  const tokens: string[] = (data.referenceText ?? "").split(/\s+/).filter(Boolean);

  return (
    <div className="flex flex-col h-full p-8 md:p-12 animate-in fade-in duration-500 overflow-y-auto">
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Final Pronunciation Check</h2>
        <p className="text-gray-500 text-lg">One last check to ensure you've mastered the target phrase.</p>
      </div>

      <div
        className={`mb-8 p-10 bg-white rounded-3xl border shadow-xs text-center relative overflow-hidden transition-all duration-300 ${
          isListening
            ? "border-indigo-300 ring-4 ring-indigo-500/10"
            : isAnalyzing
            ? "border-amber-200 bg-amber-50/10"
            : "border-gray-200"
        }`}
      >
        <Mic
          size={160}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-50 opacity-40 pointer-events-none"
        />

        {/* Reference sentence: each word colored by its score after recording */}
        <p className="relative z-10 mb-6 flex flex-wrap justify-center gap-x-2 gap-y-2 text-4xl font-bold leading-snug text-gray-900">
          {tokens.map((token, i) => {
            const r = resultFor(token);
            if (!r) {
              return <span key={i}>{token}</span>;
            }
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

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => speak(data.referenceText, { each: true })}
            disabled={isRecording}
            aria-label="Listen to the phrase"
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50 ${
              activeWord === data.referenceText
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            <Volume2 size={16} /> Listen
          </button>

          {focusSound && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-sm font-bold border border-purple-200">
              <Ear size={16} /> Focus: {focusSound.sound}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Recorder & State Dock */}
      <div className="mb-8 flex flex-col items-center">
        {/* 1. IDLE STATE: Start / Try Again Button */}
        {status === "idle" && (
          <div className="flex flex-col items-center gap-2 w-full">
            <button
              onClick={handleStartRecording}
              className="w-full sm:w-80 py-5 px-6 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all border shadow-xs text-lg bg-gray-900 hover:bg-black border-gray-900 text-white active:scale-[0.98]"
            >
              {score ? (
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
            <p className="text-gray-600 font-medium decoration-solid decoration-primary underline ">
              Recording stops and analyzes automatically when you finish speaking
            </p>
          </div>
        )}

        {/* 2. LISTENING STATE: Live Waveform + Automatic End Guidance */}
        {isListening && (
          <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-indigo-200 bg-indigo-50/50 px-6 py-5 animate-in fade-in zoom-in-95 duration-200">
            <LiveWaveform onPhaseChange={setVoicePhase} />

            {/* Dynamic Status Message based on whether they are speaking or just finished */}
            <div className="mt-3 flex items-center gap-2 text-sm font-bold">
              {voicePhase === "waiting" && (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-indigo-800">Speak the phrase clearly now...</span>
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

            {/* Subtle secondary Cancel button so users don't mistakenly click it to 'submit' */}
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
            <p className="text-xs text-gray-500 mt-1">Grading accuracy and syllable stress</p>
          </div>
        )}
      </div>

      {/* Score Breakdown Card */}
      {score && status === "idle" && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-xs animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
              <Activity className="text-indigo-500" /> Analysis
            </h3>
            {score.pronunciationScore >= 80 && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                <CheckCircle2 size={16} /> Great job!
              </span>
            )}
          </div>

          <div className="flex justify-between px-4 font-bold text-lg text-gray-700 mb-5">
            <span>Overall Accuracy:</span>
            <span className={score.pronunciationScore >= 80 ? "text-green-600" : "text-orange-500"}>
              {Math.round(score.pronunciationScore)}%
            </span>
          </div>

          {/* Legend */}
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="mt-auto flex justify-end pt-6 border-t border-gray-100">
        <button
          onClick={handleNext}
          disabled={isRecording}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-lg shadow-md active:scale-95 disabled:opacity-50"
        >
          Complete Bridge <ArrowRight size={20} className="inline ml-2" />
        </button>
      </div>
    </div>
  );
}