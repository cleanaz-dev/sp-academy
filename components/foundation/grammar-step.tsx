"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useSpeak } from "@/hooks/use-speak";
import { useWordAudio } from "@/context/word-audio-context";
import { useMatrix } from "@/context/matrix-context"; // <-- ADDED IMPORT

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

  // 1. Track "seen" for all words on load (Only Once!)
  useEffect(() => {
    if (!hasTrackedSeen.current && data.words) {
      data.words.forEach((wordObj: any) => {
        trackInteraction(wordObj.word, { seen: 1 });
      });
      hasTrackedSeen.current = true;
    }
  }, [data.words, trackInteraction]);

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

  // 3. Ensure they listened to the sentence AND every single word
  const allWordsHeard = heardWords.size === data.words.length;
  const isNextEnabled = hasPlayedSentence && allWordsHeard;

  return (
    <div className="flex flex-col h-full p-8 animate-in fade-in duration-500 overflow-y-auto">
      <div className="mb-10 shrink-0">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
          Grammar & Meaning
        </h2>
        <p className="text-gray-500 text-lg">
          Break down the target sentence to understand its structure.
        </p>
      </div>

      {/* Target Sentence Display */}
      <button
        onClick={handlePlaySentence}
        disabled={isSentenceLoading}
        className={`group w-full mb-10 p-8 rounded-2xl border text-left transition-all relative overflow-hidden shrink-0 ${
          hasPlayedSentence
            ? "bg-white border-green-200 shadow-sm"
            : "bg-linear-to-br from-blue-50 to-indigo-50 border-blue-100 hover:shadow-md hover:border-blue-300"
        }`}
      >
        <div
          className={`absolute top-8 right-8 transition-colors ${
            hasPlayedSentence
              ? "text-green-500"
              : "text-blue-300 group-hover:text-blue-500"
          }`}
        >
          {isSentenceLoading ? (
            <Loader2 className="animate-spin" size={28} />
          ) : hasPlayedSentence ? (
            <CheckCircle2 size={28} />
          ) : (
            <Volume2 size={28} />
          )}
        </div>
        <p
          className={`text-xs font-bold mb-3 uppercase tracking-widest flex items-center gap-2 ${
            hasPlayedSentence ? "text-green-600" : "text-blue-500"
          }`}
        >
          {hasPlayedSentence ? "Sentence Played" : "Click to play sentence"}
        </p>
        <p className="text-3xl md:text-4xl font-bold text-blue-950 mb-3">
          {data.targetSentence}
        </p>
        <p className="text-lg text-blue-800/70 font-medium mb-6">
          {data.nativeSentence}
        </p>

        {/* Highlight Group */}
        {data.highlightGroup && data.highlightGroup.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-blue-200/50">
            <span className="text-sm font-semibold text-blue-800 flex items-center mr-2">
              Key Chunks:
            </span>
            {data.highlightGroup.map((chunk: string, idx: number) => (
              <span
                key={idx}
                className="bg-white/80 text-blue-900 px-3 py-1 rounded-md text-sm font-bold shadow-sm border border-blue-100"
              >
                {chunk}
              </span>
            ))}
          </div>
        )}
      </button>

      {/* Word-by-Word Breakdown List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Word-by-Word Breakdown
          </h3>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              allWordsHeard
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {heardWords.size} / {data.words.length} Played
          </span>
        </div>

        <ScrollArea className="h-[300px]">
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
                  className={`group flex items-center gap-3 rounded-xl border p-3 text-left shadow-xs transition-all ${
                    isThisWordPlaying
                      ? "border-blue-500 bg-blue-50"
                      : hasBeenHeard
                        ? "border-green-200 bg-green-50/30 hover:border-green-300"
                        : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/50"
                  }`}
                >
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isThisWordPlaying
                        ? "bg-blue-600 text-white"
                        : hasBeenHeard
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-50 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600"
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

      <div className="mt-auto pt-6 flex flex-col sm:flex-row items-center justify-end gap-4 shrink-0">
        {!isNextEnabled && (
          <span className="text-sm text-gray-500 font-medium">
            Listen to the sentence and all words to continue.
          </span>
        )}
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