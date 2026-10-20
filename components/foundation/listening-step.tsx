"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Square, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import { useS3Media } from "@/context/s3-context";
import { useWordAudio } from "@/context/word-audio-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMatrix } from "@/context/matrix-context";

type WordTile = {
  id: string;
  text: string;
};

// Normalize punctuation/case when comparing words if needed, or exact match
function isSameWord(a?: string, b?: string) {
  if (!a || !b) return false;
  return a.trim() === b.trim();
}

export function ListeningStep({
  data,
  onNext,
}: {
  data: any;
  onNext: () => void;
}) {
  const { playWord, stopAudio: stopWordAudio } = useWordAudio();
  const { trackInteraction } = useMatrix();

  const hasTrackedSeen = useRef(false);
  const hasHeardMainAudio = useRef(false);
  // Track by unique tile ID so duplicate words in the bank are tracked & handled cleanly
  const heardTileIds = useRef<Set<string>>(new Set());
  const lastAudioTriggerRef = useRef<number>(0);

  // Resolve full sentence S3 audio key
  const { urls, isLoading: isAudioLoading } = useS3Media([data.audioS3Key]);
  const resolvedAudioUrl = urls[0];

  // Full sentence audio state & ref
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Build unique WordTile objects so duplicate words ("un", "un") never share keys or state
  const initialTiles: WordTile[] = React.useMemo(
    () =>
      (data.wordBank || []).map((word: string, index: number) => ({
        id: `word-tile-${index}-${word}`,
        text: word,
      })),
    [data.wordBank]
  );

  const [availableWords, setAvailableWords] =
    useState<WordTile[]>(initialTiles);
  const [selectedWords, setSelectedWords] = useState<WordTile[]>([]);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">(
    "idle"
  );
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");

  // Reset tiles if `data` changes between steps
  useEffect(() => {
    setAvailableWords(initialTiles);
    setSelectedWords([]);
    setStatus("idle");
    setFeedbackMsg("");
    hasTrackedSeen.current = false;
    hasHeardMainAudio.current = false;
    heardTileIds.current.clear();
  }, [initialTiles]);

  // 1. TRACK "SEEN" ONCE PER UNIQUE WORD ON MOUNT (Prevents duplicate concurrent calls)
  useEffect(() => {
    if (!hasTrackedSeen.current && data.wordBank) {
      const uniqueWords = Array.from(new Set<string>(data.wordBank));
      uniqueWords.forEach((word) => {
        trackInteraction(word, { seen: 1 });
      });
      hasTrackedSeen.current = true;
    }
  }, [data.wordBank, trackInteraction]);

  // Cleanup audio if component unmounts
  useEffect(() => {
    return () => stopAudio();
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
    stopWordAudio();
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    if (!resolvedAudioUrl) return;

    stopWordAudio();

    // 2. TRACK "HEARD" FOR UNIQUE EXPECTED WORDS (Only once per step)
    if (!hasHeardMainAudio.current && data.expectedOrder) {
      const uniqueExpected = Array.from(new Set<string>(data.expectedOrder));
      uniqueExpected.forEach((word) => {
        trackInteraction(word, { heard: 1 });
      });
      hasHeardMainAudio.current = true;
    }

    const audio = new Audio(resolvedAudioUrl);
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);

    audio.play().catch((err) => {
      console.warn("Audio playback skipped:", err);
      setIsPlaying(false);
    });

    setIsPlaying(true);
  };

  // Move word tile from Bank to Sentence & PLAY AUDIO ONCE
  const handleAddWord = (tile: WordTile) => {
    stopAudio();

    // Guard against double-triggering audio within 80ms
    const now = Date.now();
    if (now - lastAudioTriggerRef.current > 80) {
      lastAudioTriggerRef.current = now;
      playWord(tile.text, "m");
    }

    // 3. TRACK "HEARD" PER TILE (So tapping a second occurrence of a word still counts!)
    if (!heardTileIds.current.has(tile.id)) {
      trackInteraction(tile.text, { heard: 1 });
      heardTileIds.current.add(tile.id);
    }

    setStatus("idle");
    setSelectedWords((prev) => [...prev, tile]);
    setAvailableWords((prev) => prev.filter((item) => item.id !== tile.id));
  };

  // Move word tile from Sentence back to Bank
  const handleRemoveWord = (tile: WordTile) => {
    setStatus("idle");
    setSelectedWords((prev) => prev.filter((item) => item.id !== tile.id));
    setAvailableWords((prev) => [...prev, tile]);
  };

  // Reset the whole board in original bank order
  const handleReset = () => {
    stopAudio();
    setStatus("idle");
    setSelectedWords([]);
    setAvailableWords(initialTiles);
  };

  // Check if they built the right sentence
  const handleCheck = () => {
    const expected: string[] = data.expectedOrder || [];

    // 4. TRACK CORRECT / WRONG TAPS
    selectedWords.forEach((tile, i) => {
      if (isSameWord(tile.text, expected[i])) {
        trackInteraction(tile.text, { tappedCorrect: 1 });
      } else {
        trackInteraction(tile.text, { tappedWrong: 1 });
      }
    });

    const isCorrectLength = selectedWords.length === expected.length;
    const isPerfectMatch =
      isCorrectLength &&
      selectedWords.every((tile, i) => isSameWord(tile.text, expected[i]));

    if (isPerfectMatch) {
      setStatus("correct");
      setFeedbackMsg("✅ Excellent ear! You nailed it.");
    } else {
      setStatus("incorrect");
      setFeedbackMsg(
        "❌ Not quite right. Review your word order and try again."
      );
    }
  };

  const handleNext = () => {
    stopAudio();
    onNext();
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto p-8 animate-in fade-in duration-500">
      <div className="mb-8 shrink-0 text-center">
        <h2 className="mb-3 text-xl font-extrabold text-gray-900 md:text-2xl">
          Listen &amp; Build
        </h2>
        <p className="text-lg text-gray-500">
          Tap the words to recreate what you hear.
        </p>
      </div>

      {/* Big Audio Play Button */}
      <div className="mb-10 flex shrink-0 justify-center">
        <button
          type="button"
          onClick={toggleAudio}
          disabled={isAudioLoading}
          className={`group relative flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all md:h-24 md:w-24 ${
            isAudioLoading
              ? "cursor-not-allowed bg-gray-200 text-gray-400"
              : isPlaying
                ? "bg-blue-100 text-blue-600 ring-8 ring-blue-50"
                : "bg-gray-900 text-white hover:scale-105 hover:bg-black"
          }`}
        >
          {isAudioLoading ? (
            <Loader2 size={32} className="animate-spin" />
          ) : isPlaying ? (
            <Square size={28} className="fill-current" />
          ) : (
            <Play size={32} className="ml-1 fill-current" />
          )}
          {isPlaying && (
            <span className="absolute inset-0 animate-ping rounded-full border-4 border-blue-400 opacity-20" />
          )}
        </button>
      </div>

      {/* Sentence Builder Drop Zone */}
      <div className="mb-6 shrink-0">
        <div
          className={`flex min-h-[80px] w-full flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed p-4 transition-colors ${
            status === "correct"
              ? "border-green-400 bg-green-50"
              : status === "incorrect"
                ? "border-red-400 bg-red-50"
                : "border-gray-300 bg-gray-50"
          }`}
        >
          {selectedWords.length === 0 && (
            <span className="w-full text-center font-medium text-gray-400">
              Tap words below to build the sentence...
            </span>
          )}

          {selectedWords.map((tile, idx) => {
            const expected: string[] = data.expectedOrder || [];
            const isCorrectPosition = isSameWord(tile.text, expected[idx]);

            let wordStyle =
              "bg-white border-gray-200 text-gray-800 hover:bg-red-50 hover:border-red-200";

            if (status === "correct") {
              wordStyle =
                "bg-green-500 border-green-600 text-white hover:bg-green-600";
            } else if (status === "incorrect") {
              wordStyle = isCorrectPosition
                ? "bg-green-100 border-green-500 text-green-900 hover:bg-red-50 hover:border-red-300"
                : "bg-red-100 border-red-400 text-red-900 hover:bg-red-200";
            } else if (isCorrectPosition) {
              wordStyle =
                "bg-green-50 border-green-300 text-green-800 hover:bg-red-50 hover:border-red-200";
            }

            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleRemoveWord(tile)}
                className={`rounded-xl border-2 px-4 py-2 text-lg font-bold shadow-xs transition-all active:scale-95 ${wordStyle}`}
                title="Tap to remove"
              >
                {tile.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* SHADCN WORD BANK SCROLL AREA */}
      <div className="mb-10 w-full shrink-0">
        <ScrollArea className="max-h-[125px] w-full rounded-2xl border border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap justify-center gap-3 p-4">
            {availableWords.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleAddWord(tile)}
                className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-lg font-bold text-gray-700 shadow-xs transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
              >
                {tile.text}
              </button>
            ))}
            {availableWords.length === 0 && (
              <span className="py-2 text-sm font-medium text-gray-400">
                All words used!
              </span>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Feedback & Action Area */}
      <div className="mt-auto flex shrink-0 flex-col items-center justify-between gap-6 border-t border-gray-100 pt-6 sm:flex-row">
        {/* Feedback Message */}
        <div className="flex w-full flex-1 flex-col justify-center gap-1">
          {status !== "idle" && (
            <div
              className={`flex items-center justify-between text-sm font-bold animate-in fade-in md:text-base ${
                status === "correct" ? "text-green-600" : "text-red-600"
              }`}
            >
              <span>{feedbackMsg}</span>

              {/* Reset Button */}
              {selectedWords.length > 0 && status !== "correct" && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="ml-3 shrink-0 rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-700"
                  title="Reset Sentence"
                >
                  <RotateCcw size={20} />
                </button>
              )}
            </div>
          )}

          {/* Freeform contrast hint if they get it wrong */}
          {status === "incorrect" && data.contrast && (
            <p className="mt-1 text-sm font-medium text-red-400/80 animate-in fade-in">
              Hint — pay attention to: {data.contrast}
            </p>
          )}
        </div>

        {/* Action Button (Check or Next) */}
        {status === "correct" ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-lg font-bold text-white shadow-md transition-transform hover:bg-black active:scale-95 sm:w-auto"
          >
            Next: Knowledge Check <ArrowRight size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCheck}
            disabled={selectedWords.length === 0}
            className={`flex w-full items-center justify-center rounded-xl px-8 py-4 text-lg font-bold transition-all sm:w-auto ${
              selectedWords.length > 0
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 active:scale-95"
                : "cursor-not-allowed bg-gray-100 text-gray-400"
            }`}
          >
            Check Answer
          </button>
        )}
      </div>
    </div>
  );
}