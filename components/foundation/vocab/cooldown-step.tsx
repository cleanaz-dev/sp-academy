"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, AlertCircle, Volume2 } from "lucide-react";
import { useS3Media } from "@/context/s3-context";
import { useWordAudio } from "@/context/word-audio-context";
import { useMatrix } from "@/context/matrix-context";
import { WordTap, useSpeakWord, cleanWord } from "@/components/foundation/word-tap"; // adjust path

// Lowercase, strip accents and punctuation, collapse spaces.
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (s: string) =>
  s
    .split(/\s+/)
    .map((t) => t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter(Boolean)
    .map((t, i) => (i === 0 ? t.toLowerCase() : t));

const shuffle = (arr: string[], seed: number) =>
  arr
    .map((w, i) => ({ w, k: Math.sin(seed * 9301 + i * 49297 + w.length * 233) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.w);

const hasLetters = (s: string) => /[\p{L}\p{N}]/u.test(s);

export function CooldownStep({
  data,
  onNext,
}: {
  data: any[];
  onNext: () => void;
}) {
  const { stopAudio, activeWord } = useWordAudio();
  const { trackInteraction } = useMatrix();
  const speak = useSpeakWord();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const { urls: videoUrls } = useS3Media(data.map((d) => d.videoS3Key));

  const item = data[currentIndex];
  const videoUrl = videoUrls[currentIndex] || undefined;
  const isBuilder = item.mechanic === "variable_shift";
  const isMultipleChoice = !isBuilder;

  // Matrix: the words shown in this drill count as "seen"
  useEffect(() => {
    const words: string[] = [];
    if (item.targetWord) words.push(cleanWord(item.targetWord));
    if (item.mechanic === "variable_shift") {
      tokenize(item.expected?.[0] ?? "").forEach((w) => words.push(cleanWord(w)));
    }
    words.filter(Boolean).forEach((w) => trackInteraction(w, { seen: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const bank = useMemo(() => {
    if (!isBuilder) return [] as string[];
    if (Array.isArray(item.wordBank) && item.wordBank.length > 0) {
      return shuffle(item.wordBank, currentIndex + 1);
    }

    const answer = tokenize(item.expected?.[0] ?? "");
    const seen = new Set(answer.map(normalize));
    const extras: string[] = [];

    const candidates = [
      ...tokenize(item.baseSentence ?? ""),
      ...Object.keys(item.rejectFeedback ?? {}).flatMap(tokenize),
    ];
    for (const word of candidates) {
      const n = normalize(word);
      if (n && !seen.has(n)) {
        seen.add(n);
        extras.push(word);
      }
    }
    return shuffle([...answer, ...extras], currentIndex + 1);
  }, [item, currentIndex, isBuilder]);

  const placedWords = selected.map((i) => bank[i]);

  const handleNextQuestion = () => {
    stopAudio();
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setStatus("idle");
      setFeedbackMsg("");
      setSelected([]);
    } else {
      onNext();
    }
  };

  const handleMultipleChoiceGuess = (guess: string) => {
    // Long context_clash sentences are not vocab, so don't count them as "heard words"
    speak(guess, { track: item.mechanic !== "context_clash" });

    let isCorrect = false;
    if (item.mechanic === "video_spotlight") {
      isCorrect = guess === item.targetWord;
    } else if (Array.isArray(item.correct)) {
      isCorrect = item.correct.includes(guess);
    } else {
      isCorrect = item.correct === guess;
    }

    // Matrix: score against the vocab word this drill is testing
    if (item.targetWord) {
      trackInteraction(
        cleanWord(item.targetWord),
        isCorrect ? { tappedCorrect: 1 } : { tappedWrong: 1 }
      );
    }

    if (isCorrect) {
      setStatus("correct");
      setFeedbackMsg("✅ Great job! Spot on.");
    } else {
      setStatus("incorrect");
      const specificHint = item.feedback?.[guess] || item.rejectFeedback?.[guess];
      setFeedbackMsg(`❌ ${specificHint || "Not quite right. Try again!"}`);
    }
  };

  const addWord = (bankIndex: number) => {
    if (status === "correct" || selected.includes(bankIndex)) return;
    speak(bank[bankIndex]);
    setSelected((prev) => [...prev, bankIndex]);
    if (status === "incorrect") {
      setStatus("idle");
      setFeedbackMsg("");
    }
  };

  const removeWord = (bankIndex: number) => {
    if (status === "correct") return;
    setSelected((prev) => prev.filter((i) => i !== bankIndex));
    if (status === "incorrect") {
      setStatus("idle");
      setFeedbackMsg("");
    }
  };

  const handleBuilderSubmit = () => {
    const guess = normalize(placedWords.join(" "));
    const accepted = [...(item.expected ?? []), ...(item.expectedFolds ?? [])].map(normalize);
    const answerWords = new Set(tokenize(item.expected?.[0] ?? "").map(normalize));

    if (accepted.includes(guess)) {
      setStatus("correct");
      setFeedbackMsg("✅ Perfect adaptation!");
      placedWords.forEach((w) => trackInteraction(cleanWord(w), { tappedCorrect: 1 }));
      speak(placedWords.join(" "), { each: true });
      return;
    }

    // Matrix: only the distractors they picked count as wrong
    placedWords
      .filter((w) => !answerWords.has(normalize(w)))
      .forEach((w) => trackInteraction(cleanWord(w), { tappedWrong: 1 }));

    setStatus("incorrect");
    const rejectKey = Object.keys(item.rejectFeedback ?? {}).find(
      (k) => normalize(k) === guess
    );
    const hint = rejectKey
      ? item.rejectFeedback[rejectKey]
      : "Not quite. Check the word order and which words you need.";
    setFeedbackMsg(`❌ ${hint}`);
  };

  return (
    <div className="flex flex-col h-full p-8 md:p-12 animate-in fade-in duration-500 overflow-y-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 capitalize">
            {item.mechanic.replace(/_/g, " ")}
          </h2>
          <p className="text-gray-500 font-medium">
            Drill {currentIndex + 1} of {data.length}
          </p>
        </div>
        <div className="flex gap-2">
          {data.map((_, idx) => (
            <div
              key={idx}
              className={`h-2.5 w-8 rounded-full transition-colors ${
                idx < currentIndex
                  ? "bg-green-500"
                  : idx === currentIndex
                    ? "bg-indigo-500"
                    : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full mb-8">
        {/* Video Spotlight */}
        {item.mechanic === "video_spotlight" && item.videoS3Key && (
          <div className="mb-6 flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-900 md:h-64">
            {videoUrl ? (
              <video
                key={item.videoS3Key}
                src={videoUrl}
                controls
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full animate-pulse bg-gray-800" />
            )}
          </div>
        )}

        {/* Context & Instruction */}
        <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-2xl mb-8">
          <p className="text-gray-800 text-lg leading-relaxed font-medium mb-3">
            {item.contextNative}
          </p>
          <p className="text-indigo-900 font-bold text-xl flex items-center gap-2">
            <AlertCircle size={20} className="text-indigo-500" />{" "}
            {item.instructionNative}
          </p>
        </div>

        {/* Sentence Builder */}
        {isBuilder && (
          <>
            <div className="mb-6 p-6 bg-white border border-gray-200 rounded-2xl text-center shadow-xs">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Base Sentence
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                {(item.baseSentence ?? "")
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((token: string, i: number) =>
                    hasLetters(token) ? (
                      <WordTap
                        key={i}
                        word={token}
                        className="px-1.5 py-0.5 text-2xl font-bold text-gray-900"
                      />
                    ) : (
                      <span key={i} className="text-2xl font-bold text-gray-900">
                        {token}
                      </span>
                    )
                  )}
                <button
                  onClick={() => speak(item.baseSentence, { each: true, track: true })}
                  aria-label="Play full sentence"
                  className={`ml-2 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    activeWord === item.baseSentence
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  }`}
                >
                  <Volume2 size={18} />
                </button>
              </div>
            </div>

            {/* Answer tray */}
            <div
              className={`mb-4 flex min-h-[76px] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed p-4 transition-colors ${
                status === "correct"
                  ? "border-green-400 bg-green-50"
                  : status === "incorrect"
                    ? "border-red-300 bg-red-50/50"
                    : "border-gray-300 bg-gray-50"
              }`}
            >
              {placedWords.length === 0 && (
                <span className="text-gray-400 font-medium">
                  Tap the words below to build your sentence...
                </span>
              )}
              {selected.map((bankIndex) => (
                <button
                  key={bankIndex}
                  onClick={() => removeWord(bankIndex)}
                  disabled={status === "correct"}
                  className="rounded-xl border-2 border-indigo-300 bg-white px-4 py-2 text-lg font-bold text-indigo-900 shadow-xs transition-all hover:bg-indigo-50 active:scale-95 disabled:cursor-default"
                >
                  {bank[bankIndex]}
                </button>
              ))}
            </div>

            {/* Word bank */}
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {bank.map((word, bankIndex) => {
                const used = selected.includes(bankIndex);
                return (
                  <button
                    key={bankIndex}
                    onClick={() => addWord(bankIndex)}
                    disabled={used || status === "correct"}
                    className={`rounded-xl border-2 px-4 py-2 text-lg font-bold transition-all active:scale-95 ${
                      used
                        ? "cursor-not-allowed border-gray-100 bg-gray-100 text-transparent"
                        : activeWord === word
                          ? "border-indigo-400 bg-indigo-50 text-indigo-800 shadow-xs"
                          : "border-gray-200 bg-white text-gray-800 shadow-xs hover:border-indigo-400 hover:bg-indigo-50"
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>

            {status !== "correct" && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelected([]);
                    setStatus("idle");
                    setFeedbackMsg("");
                  }}
                  disabled={selected.length === 0}
                  className="rounded-xl bg-gray-100 px-6 py-4 text-lg font-bold text-gray-600 hover:bg-gray-200 active:scale-95 disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  onClick={handleBuilderSubmit}
                  disabled={selected.length === 0}
                  className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-lg shadow-md active:scale-95 disabled:opacity-50"
                >
                  Check Answer
                </button>
              </div>
            )}
          </>
        )}

        {/* Multiple Choice */}
        {isMultipleChoice && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {item.options?.map((opt: string, idx: number) => (
              <button
                key={idx}
                disabled={status === "correct"}
                onClick={() => handleMultipleChoiceGuess(opt)}
                className={`flex min-h-[72px] items-center justify-center rounded-2xl border-2 p-4 text-center text-base font-bold leading-snug transition-all active:scale-95 sm:text-lg ${
                  status === "correct"
                    ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                    : activeWord === opt
                      ? "border-indigo-400 bg-indigo-50 text-indigo-800 shadow-xs"
                      : "border-gray-200 bg-white text-gray-800 shadow-xs hover:border-indigo-400 hover:bg-indigo-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Feedback */}
      <div className="mt-auto min-h-[80px] flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100 pt-6">
        <div
          className={`flex-1 font-medium text-lg animate-in fade-in ${
            status === "correct"
              ? "text-green-600"
              : status === "incorrect"
                ? "text-red-500"
                : "text-transparent"
          }`}
        >
          {feedbackMsg || "placeholder"}
        </div>

        <button
          onClick={handleNextQuestion}
          disabled={status !== "correct"}
          className={`w-full sm:w-auto px-8 py-4 font-bold rounded-xl text-lg transition-all flex items-center justify-center gap-2 ${
            status === "correct"
              ? "bg-gray-900 hover:bg-black text-white shadow-md active:scale-95"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {currentIndex === data.length - 1 ? "Finish Cooldown" : "Next Drill"}{" "}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}