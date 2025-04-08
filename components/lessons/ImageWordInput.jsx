// exercises/ImageWordInput.jsx
"use client";
import { useState } from "react";
import Image from "next/image";

const ExerciseImage = ({ imageUrl }) => {
  // Check if the imageUrl is a placeholder (wrapped in brackets)
  const isPlaceholder = imageUrl.startsWith("[") && imageUrl.endsWith("]");

  if (isPlaceholder) {
    return (
      <div className="relative mb-4 flex h-48 w-full items-center justify-center rounded bg-gray-100">
        <div className="text-gray-400">
          [Placeholder Image: {imageUrl.slice(1, -1)}]
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-4 h-48 w-full">
      <Image
        src={imageUrl}
        alt="Exercise reference"
        fill
        className="rounded object-contain"
      />
    </div>
  );
};

const ImageWordInput = ({ exercise, onComplete }) => {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = () => {
    setAttempts((prev) => prev + 1);
    const isCorrect =
      answer.toLowerCase().trim() ===
      exercise.correctAnswer.toLowerCase().trim();

    setFeedback({
      message: isCorrect ? "Correct!" : "Try again!",
      type: isCorrect ? "success" : "error",
    });

    if (isCorrect) {
      onComplete(exercise.id, {
        completed: true,
        score: Math.max(100 - attempts * 10, 0),
        attempts,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleReset = () => {
    setAnswer("");
    setFeedback(null);
    setShowHint(false);
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h3 className="mb-4 text-xl font-semibold">{exercise.question}</h3>

      {exercise.additionalData.image_url && (
        <ExerciseImage imageUrl={exercise.additionalData.image_url} />
      )}

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your answer..."
          />

          {exercise.additionalData.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="rounded bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
              title="Show hint"
            >
              💡
            </button>
          )}
        </div>

        {showHint && exercise.additionalData.hint && (
          <div className="rounded bg-gray-50 p-3 text-sm text-gray-600">
            💡 Hint: {exercise.additionalData.hint}
          </div>
        )}

        {feedback && (
          <div
            className={`rounded p-3 ${
              feedback.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Submit
          </button>
          <button
            onClick={handleReset}
            className="rounded bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
          >
            Reset
          </button>
        </div>

        <div className="text-sm text-gray-600">
          <span>Attempts: {attempts}</span>
          {feedback?.type === "success" && (
            <span className="ml-4">
              Score: {Math.max(100 - attempts * 10, 0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageWordInput;
