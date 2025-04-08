"use client";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

const AudioExercise = forwardRef(({ exercise, isCompleted }, ref) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [synth, setSynth] = useState(null);
  const [utterance, setUtterance] = useState(null);

  const correctAnswer = parseInt(exercise.correctAnswer);

  useImperativeHandle(ref, () => ({
    checkValidity: () => selectedAnswer === correctAnswer,
  }));

  useEffect(() => {
    setSelectedAnswer(null);
    setSubmitted(false);
    setIsSpeaking(false);

    return () => {
      // Cleanup speech synthesis if needed
      if (synth) {
        synth.cancel();
      }
    };
  }, [exercise.id]);

  const handleReset = () => {
    setSelectedAnswer(null);
    setSubmitted(false);
  };

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(exercise.audioScript);
      utterance.lang = "fr-FR";
      setSynth(synth);
      setUtterance(utterance);
    }
  }, [exercise.audioScript]);

  const handleSpeak = () => {
    if (synth && utterance) {
      synth.speak(utterance);
      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
      };
    }
  };

  const handleAnswerSelect = (index) => {
    if (!submitted) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setSubmitted(true);
    }
  };

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <div
      className={`relative rounded-lg border-2 p-6 ${
        isCompleted ? "border-green-200 bg-green-50" : "border-gray-200"
      }`}
    >
      {isCompleted && (
        <div className="absolute right-2 top-2 text-green-500">✓</div>
      )}
      <div className="mx-auto rounded-lg bg-white p-6 shadow-md">
        <div className="mb-10 flex items-center gap-4">
          <span className="flex h-8 w-8 animate-[gradient_6s_ease_infinite] items-center justify-center rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-sky-400 bg-[length:300%_300%] text-sm font-medium text-white">
            {exercise.order + 1}
          </span>
          <p className="font-medium text-muted-foreground">
            {exercise.question}
          </p>
        </div>
        <div className="mb-6">
          <button
            onClick={handleSpeak}
            disabled={isSpeaking}
            className={`rounded-md px-4 py-2 ${isSpeaking ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"} mb-4 flex items-center gap-2 transition-colors duration-200`}
            aria-label="Play question audio"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.343 9.657L14 2l1.414 1.414-7.657 7.657 7.657 7.657-1.414 1.414-7.657-7.657z"
              />
            </svg>
            {isSpeaking ? "Playing..." : "Play Question"}
          </button>

          <div className="space-y-3">
            {exercise.multipleChoice.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full rounded-lg p-3 text-left transition-all duration-200 ${
                  selectedAnswer === index
                    ? "border-2 border-blue-500 bg-blue-50"
                    : "border-2 border-transparent bg-gray-50 hover:bg-gray-100"
                } ${
                  submitted &&
                  (index === correctAnswer
                    ? "border-green-500 bg-green-50"
                    : index === selectedAnswer
                      ? "border-red-500 bg-red-50"
                      : "")
                }`}
                disabled={submitted}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Submit button logic */}
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className={`rounded-md px-6 py-2 text-white ${
              selectedAnswer === null
                ? "cursor-not-allowed bg-gray-300"
                : "bg-blue-500 hover:bg-blue-600"
            } transition-colors duration-200`}
          >
            Submit Answer
          </button>
        ) : !isCorrect ? (
          <button
            onClick={handleReset}
            className="rounded-md bg-blue-500 px-6 py-2 text-white transition-colors duration-200 hover:bg-blue-600"
          >
            Try Again
          </button>
        ) : null}

        {submitted && (
          <div
            className={`mt-4 rounded-lg p-4 ${
              isCorrect
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            } animate-fade-in`}
          >
            <p className="font-medium">
              {isCorrect
                ? exercise.feedback.correct
                : exercise.feedback.incorrect}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
export default AudioExercise;
