"use client";
import React, { useState, useEffect } from "react";
import { ArrowRight, AlertCircle } from "lucide-react";
import { getSceneMediaUrls } from "@/app/actions/get-media";

export function CooldownStep({ data, onNext }: { data: any[]; onNext: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [textInput, setTextInput] = useState(""); // Used for variable_shift
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});

  // Sign every video key for the whole cooldown once, up front
  useEffect(() => {
    const keys = data.map((d) => d.videoS3Key).filter(Boolean);
    if (keys.length === 0) return;

    let cancelled = false;
    getSceneMediaUrls(keys)
      .then((res) => !cancelled && setMediaUrls(res))
      .catch((err) => console.error("Failed to load cooldown media:", err));
    return () => {
      cancelled = true;
    };
  }, [data]);

  const item = data[currentIndex];
  const videoUrl = item.videoS3Key ? mediaUrls[item.videoS3Key] : undefined;
  const isMultipleChoice =
    item.mechanic === "word_coupling" ||
    item.mechanic === "context_clash" ||
    item.mechanic === "video_spotlight";

  const handleNextQuestion = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setStatus("idle");
      setFeedbackMsg("");
      setTextInput("");
    } else {
      onNext();
    }
  };

  const handleMultipleChoiceGuess = (guess: string) => {
    let isCorrect = false;

    // Normalizing the 'correct' field mismatches from JSON
    if (item.mechanic === "video_spotlight") {
      isCorrect = guess === item.targetWord;
    } else if (Array.isArray(item.correct)) {
      isCorrect = item.correct.includes(guess);
    } else {
      isCorrect = item.correct === guess;
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

  const handleTextInputSubmit = () => {
    const normalize = (s: string) => s.toLowerCase().trim();
    const guess = normalize(textInput);

    const isCorrect = item.expectedFolds?.some((fold: string) => normalize(fold) === guess);

    if (isCorrect) {
      setStatus("correct");
      setFeedbackMsg("✅ Perfect adaptation!");
    } else {
      setStatus("incorrect");
      const exactMatchKey = Object.keys(item.rejectFeedback || {}).find(
        (k) => normalize(k) === guess
      );
      const specificHint = exactMatchKey
        ? item.rejectFeedback[exactMatchKey]
        : "Check your grammar or vocabulary and try again.";
      setFeedbackMsg(`❌ ${specificHint}`);
    }
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

      {/* Main Question Content */}
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
            <AlertCircle size={20} className="text-indigo-500" /> {item.instructionNative}
          </p>
        </div>

        {/* Variable Shift Base Sentence */}
        {item.mechanic === "variable_shift" && (
          <div className="mb-8 p-6 bg-white border border-gray-200 rounded-2xl text-center shadow-xs">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Base Sentence
            </p>
            <p className="text-2xl font-bold text-gray-900">"{item.baseSentence}"</p>
          </div>
        )}

        {/* Multiple Choice */}
        {isMultipleChoice && (
          <div className="flex flex-col gap-3">
            {item.options?.map((opt: string, idx: number) => (
              <button
                key={idx}
                disabled={status === "correct"}
                onClick={() => handleMultipleChoiceGuess(opt)}
                className={`p-5 text-left text-lg font-bold rounded-2xl border-2 transition-all active:scale-95 ${
                  status === "correct"
                    ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-gray-800 shadow-xs"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Text Input (Variable Shift) */}
        {!isMultipleChoice && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={status === "correct"}
              placeholder="Type your adapted sentence here..."
              className="w-full p-5 text-xl font-medium rounded-2xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-hidden transition-all bg-gray-50 focus:bg-white"
            />
            {status !== "correct" && (
              <button
                onClick={handleTextInputSubmit}
                disabled={!textInput.trim()}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-lg shadow-md active:scale-95 disabled:opacity-50"
              >
                Submit Answer
              </button>
            )}
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