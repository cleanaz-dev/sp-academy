"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { Mic, ArrowRight, Activity, AlertCircle, CheckCircle2, Ear, Square, Volume2 } from "lucide-react";
import { usePronunciation } from "@/context/pronunciation-context";
import { useWordAudio } from "@/context/word-audio-context";
import { useMatrix } from "@/context/matrix-context";
import { useSpeakWord, cleanWord } from "@/components/foundation/word-tap"; // adjust path

type WordResult = { score: number; omitted: boolean };

// Green = good, orange = needs work, red = retry
const tone = (score: number, omitted: boolean) => {
  if (omitted || score < 60) return "text-red-600 bg-red-50";
  if (score < 80) return "text-orange-500 bg-orange-50";
  return "text-green-600 bg-green-50";
};

export function BridgePronunciationStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { isRecording, score, error, assessSpeech, cancelAssessment } = usePronunciation();
  const { stopAudio, activeWord, targetLang } = useWordAudio();
  const { trackInteraction } = useMatrix();
  const speak = useSpeakWord();

  const lastTrackedScore = useRef<unknown>(null);

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

  const handleRecordToggle = () => {
    if (isRecording) {
      cancelAssessment();
    } else {
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

      <div className="mb-8 p-10 bg-white rounded-3xl border border-gray-200 shadow-xs text-center relative overflow-hidden">
        <Mic size={160} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-50 opacity-40 pointer-events-none" />

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

      <div className="flex justify-center mb-8">
        <button
          onClick={handleRecordToggle}
          className={`w-full sm:w-80 py-5 px-6 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all border shadow-xs text-lg ${
            isRecording ? 'bg-red-50 border-red-200 text-red-600 ring-4 ring-red-500/20 animate-pulse' : 'bg-gray-900 hover:bg-black border-gray-900 text-white'
          }`}
        >
          {isRecording ? <Square size={24} className="fill-current" /> : <Mic size={24} />}
          {isRecording ? "Stop Recording" : score ? "Try Again" : "Record"}
        </button>
      </div>

      {score && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-xs animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2"><Activity className="text-indigo-500" /> Analysis</h3>
            {score.pronunciationScore >= 80 && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold"><CheckCircle2 size={16} /> Great job!</span>
            )}
          </div>

          <div className="flex justify-between px-4 font-bold text-lg text-gray-700 mb-5">
            <span>Score:</span>
            <span className={score.pronunciationScore >= 80 ? 'text-green-600' : 'text-orange-500'}>{score.pronunciationScore}%</span>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 border-t border-gray-100 pt-4 text-sm font-semibold text-gray-500">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-green-500" /> 80%+ Great</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-orange-400" /> 60–79% Getting there</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-red-500" /> Under 60% or skipped</span>
          </div>
        </div>
      )}

      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3"><AlertCircle size={20} /> <p>{error}</p></div>}

      <div className="mt-auto flex justify-end pt-6 border-t border-gray-100">
        <button onClick={handleNext} disabled={isRecording} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-lg shadow-md active:scale-95 disabled:opacity-50">
          Complete Bridge <ArrowRight size={20} className="inline ml-2" />
        </button>
      </div>
    </div>
  );
}