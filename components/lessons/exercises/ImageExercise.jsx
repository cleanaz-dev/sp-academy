"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import Image from "next/image";
import { Hash } from "lucide-react";

const ImageExercise = forwardRef(({ exercise, isCompleted }, ref) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useImperativeHandle(ref, () => ({
    checkValidity: () => result?.score >= 0.8,
  }));

  const checkAnswer = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAnswer,
          correctAnswer: exercise.correctAnswer,
          context: exercise.correctAnswer,
          instructions:
            "Evaluate the French greeting considering grammar, vocabulary, and cultural context.",
        }),
      });

      if (!response.ok) throw new Error("Evaluation failed");
      const evaluation = await response.json();
      console.log("evaluation:", evaluation);
      setResult(evaluation.result);
    } catch (err) {
      setError(err.message || "Failed to evaluate answer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    await checkAnswer();
  };

  return (
    <div
      className={`relative p-4 rounded-lg border-2 ${
        isCompleted ? "border-green-200 bg-green-50" : "border-gray-200"
      }`}
    >
      {isCompleted && (
        <div className="absolute top-2 right-2 text-green-500">✓</div>
      )}
      <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-4 mb-10">
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-sky-400 bg-[length:300%_300%] animate-[gradient_6s_ease_infinite] text-sm font-medium text-white">
            {exercise.order + 1}
          </span>
          <p className="font-medium text-muted-foreground">
            {exercise.question}
          </p>
        </div>

        {/* Image and exercise content */}
        <div className="flex flex-col items-center mb-6 text-center justify-center">
          <Image
            src="https://placehold.co/400"
            alt={exercise.title}
            width={400}
            height={300}
            className="rounded-lg border-teal-300 border-4"
            unoptimized
            priority
          />
          <p className="mt-2 text-sm text-gray-600 italic text-center">
            {exercise.image_prompt}
          </p>
        </div>

        {/* Question and input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="Type your French greeting here..."
            disabled={isLoading}
          />

          {/* Error and feedback display */}
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !userAnswer.trim()}
            className={`px-6 py-2 text-white rounded-lg transition-all ${
              isLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isLoading ? "Analyzing..." : "Submit Answer"}
          </button>
        </form>

        {/* Results display */}
        {result && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              result.score >= 0.8
                ? "bg-green-100 text-green-700"
                : result.score >= 0.5
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <p className="font-medium">
              {result.score >= 0.8
                ? "✅ Excellent!"
                : result.score >= 0.5
                ? "⚠️ Almost There!"
                : "❌ Needs Improvement"}
            </p>
            <p className="mt-2">{result.feedback}</p>

            {/* <p className="mt-2 text-sm">Tip: {result.suggestion}</p> */}
          </div>
        )}
      </div>
    </div>
  );
});

export default ImageExercise;
