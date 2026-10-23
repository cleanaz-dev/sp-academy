"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Volume2, Loader2, ArrowRight, CheckCircle2, Play } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useSpeak } from "@/hooks/use-speak";
import { useWordAudio } from "@/context/word-audio-context";
import { useMatrix } from "@/context/matrix-context";

export function GrammarStep({
  data,
  onNext,
}: {
  data: any;
  onNext: () => void;
}) {
  // Main sentence TTS
  const { speak, isLoading: isSentenceLoading } = useSpeak();

  // Word-level native audio from context
  const {
    playWord,
    activeWord,
    isPlaying: isWordPlaying,
    targetLang,
  } = useWordAudio();

  // Matrix Tracking
  const { trackInteraction } = useMatrix();
  const hasTrackedSeen = useRef(false);

  // Engagement Tracking States
  const [hasPlayedSentence, setHasPlayedSentence] = useState(false);
  const [heardWords, setHeardWords] = useState<Set<string>>(new Set());

  // Extract unique words so duplicates don't break the counter or double-track
  const uniqueWords = useMemo(() => {
    if (!data?.words) return [];
    return Array.from(new Set(data.words.map((w: any) => w.word))) as string[];
  }, [data?.words]);

  // 1. Track "seen" for all unique words on load (Only Once!)
  useEffect(() => {
    if (!hasTrackedSeen.current && uniqueWords.length > 0) {
      uniqueWords.forEach((word) => {
        trackInteraction(word, { seen: 1 });
      });
      hasTrackedSeen.current = true;
    }
  }, [uniqueWords, trackInteraction]);

  const handlePlaySentence = async () => {
    setHasPlayedSentence(true);
    await speak(data.targetSentence, targetLang);
  };

  const handleWordClick = (word: string) => {
    playWord(word, "m");

    // 2. Track "heard" only the first time they click it
    if (!heardWords.has(word)) {
      trackInteraction(word, { heard: 1 });
      setHeardWords((prev) => new Set(prev).add(word));
    }
  };

  // 3. Ensure they listened to the sentence AND every unique word
  const allWordsHeard = heardWords.size === uniqueWords.length;
  const isNextEnabled = hasPlayedSentence && allWordsHeard;

  return (
    <div className="flex flex-col h-full p-8 animate-in fade-in duration-500 overflow-y-auto">
      <div className="mb-8 shrink-0">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
          Grammar & Meaning
        </h2>
        <p className="text-gray-500 text-lg">
          Listen to the full sentence first, then tap each word below to unlock the next step.
        </p>
      </div>

      {/* STEP 1: Target Sentence Display */}
      <div className="mb-8 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Step 1 • Full Sentence Audio
          </h3>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
              hasPlayedSentence
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700 animate-pulse"
            }`}
          >
            {hasPlayedSentence ? (
              <>
                <CheckCircle2 size={13} /> Played
              </>
            ) : (
              "1 Required • Tap Card Below"
            )}
          </span>
        </div>

        <button
          onClick={handlePlaySentence}
          disabled={isSentenceLoading}
          className={`group w-full p-6 md:p-8 rounded-2xl border-2 text-left transition-all relative overflow-hidden cursor-pointer ${
            hasPlayedSentence
              ? "bg-white border-green-300 shadow-xs hover:border-green-400"
              : "bg-linear-to-br from-blue-50 via-indigo-50/80 to-blue-50 border-blue-400 shadow-md ring-4 ring-blue-100 hover:shadow-lg hover:border-blue-500"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                    hasPlayedSentence
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-600 text-white shadow-xs"
                  }`}
                >
                  {isSentenceLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={12} />
                      Loading Audio...
                    </>
                  ) : hasPlayedSentence ? (
                    <>
                      <CheckCircle2 size={13} />
                      Sentence Played (Tap to Replay)
                    </>
                  ) : (
                    <>
                      <Volume2 size={13} />
                      Tap Here to Listen First
                    </>
                  )}
                </span>
              </div>

              <p className="text-3xl md:text-4xl font-extrabold text-blue-950 mb-2">
                {data.targetSentence}
              </p>
              <p className="text-lg text-blue-900/70 font-medium">
                {data.nativeSentence}
              </p>
            </div>

            {/* Prominent Big Play Button */}
            <div
              className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl font-bold text-sm shrink-0 transition-all ${
                hasPlayedSentence
                  ? "bg-green-50 text-green-700 border border-green-200 group-hover:bg-green-100"
                  : "bg-blue-600 text-white shadow-lg shadow-blue-600/25 group-hover:bg-blue-700 group-hover:scale-105"
              }`}
            >
              {isSentenceLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : hasPlayedSentence ? (
                <>
                  <Volume2 size={20} />
                  <span>Replay</span>
                </>
              ) : (
                <>
                  <Play size={18} className="fill-current" />
                  <span>Play Sentence</span>
                </>
              )}
            </div>
          </div>

          {/* Highlight Group */}
          {data.highlightGroup && data.highlightGroup.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 mt-5 border-t border-blue-200/60">
              <span className="text-sm font-semibold text-blue-800 flex items-center mr-2">
                Key Chunks:
              </span>
              {data.highlightGroup.map((chunk: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-white/90 text-blue-900 px-3 py-1 rounded-md text-sm font-bold shadow-xs border border-blue-100"
                >
                  {chunk}
                </span>
              ))}
            </div>
          )}
        </button>
      </div>

      {/* STEP 2: Word-by-Word Breakdown List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Step 2 • Word-by-Word Breakdown
          </h3>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
              allWordsHeard
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {allWordsHeard && <CheckCircle2 size={13} />}
            {heardWords.size} / {uniqueWords.length} Words Played
          </span>
        </div>

        <ScrollArea className="h-[280px]">
          <div className="grid grid-cols-1 gap-3 pr-3 pb-2 md:grid-cols-2">
            {data.words.map((wordObj: any, idx: number) => {
              const isThisWordPlaying =
                isWordPlaying && activeWord === wordObj.word;
              const hasBeenHeard = heardWords.has(wordObj.word);

              return (
                <button
                  key={idx}
                  onClick={() => handleWordClick(wordObj.word)}
                  disabled={isWordPlaying}
                  className={`group flex items-center gap-3 rounded-xl border p-3 text-left shadow-xs transition-all cursor-pointer ${
                    isThisWordPlaying
                      ? "border-blue-500 bg-blue-50"
                      : hasBeenHeard
                        ? "border-green-200 bg-green-50/30 hover:border-green-300"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isThisWordPlaying
                        ? "bg-blue-600 text-white"
                        : hasBeenHeard
                          ? "bg-green-100 text-green-600"
                          : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                    }`}
                  >
                    {isThisWordPlaying ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : hasBeenHeard ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <Volume2 size={14} />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span
                        className={`font-bold transition-colors ${
                          isThisWordPlaying
                            ? "text-blue-900"
                            : hasBeenHeard
                              ? "text-green-900"
                              : "text-gray-900 group-hover:text-blue-700"
                        }`}
                      >
                        {wordObj.word}
                      </span>
                      <span className="text-sm text-gray-400">
                        = {wordObj.gloss}
                      </span>
                    </div>

                    <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                      {wordObj.role}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Footer with explicit requirement pills */}
      <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePlaySentence}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              hasPlayedSentence
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100"
            }`}
          >
            {hasPlayedSentence ? (
              <CheckCircle2 size={14} />
            ) : (
              <Volume2 size={14} />
            )}
            1. Play Full Sentence
          </button>

          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
              allWordsHeard
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            {allWordsHeard ? (
              <CheckCircle2 size={14} />
            ) : (
              <Volume2 size={14} />
            )}
            2. Play All Words ({heardWords.size}/{uniqueWords.length})
          </span>
        </div>

        <button
          onClick={onNext}
          disabled={!isNextEnabled}
          className={`w-full sm:w-auto px-8 py-4 font-bold rounded-xl text-lg transition-all flex items-center justify-center gap-2 ${
            isNextEnabled
              ? "bg-gray-900 hover:bg-black text-white shadow-md active:scale-95"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Next: Pronunciation Lab <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}