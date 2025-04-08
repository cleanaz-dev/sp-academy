"use client";
import { useState, forwardRef, useImperativeHandle } from "react";

const WordAssociationGame = forwardRef(({ exercise, isCompleted }, ref) => {
  const [selectedWords, setSelectedWords] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  // Correct answers are stored as an array of indices
  const correctAnswers = exercise.correctAnswer;

  useImperativeHandle(ref, () => ({
    checkValidity: () => {
      const userSelectedIndices = selectedWords.map((word) =>
        exercise.words.indexOf(word),
      );
      return (
        userSelectedIndices.length === correctAnswers.length &&
        userSelectedIndices.every((index) => correctAnswers.includes(index))
      );
    },
  }));

  const handleWordClick = (word) => {
    if (!submitted) {
      setSelectedWords(
        (prev) =>
          prev.includes(word)
            ? prev.filter((w) => w !== word) // Deselect if already selected
            : [...prev, word], // Add to selection
      );
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const isWordCorrect = (word) => {
    return correctAnswers.includes(exercise.words.indexOf(word));
  };

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

        {/* Image Display */}
        <div className="mb-6">
          <img
            src={exercise.imageUrl}
            alt={exercise.image_prompt}
            className="mx-auto w-full max-w-md rounded-lg shadow-sm"
          />
        </div>

        {/* Word Selection */}
        <div className="mb-6 flex flex-wrap gap-2">
          {exercise.words.map((word, index) => (
            <button
              key={index}
              onClick={() => handleWordClick(word)}
              className={`rounded-lg px-4 py-2 transition-all duration-200 ${
                selectedWords.includes(word)
                  ? submitted
                    ? isWordCorrect(word)
                      ? "border-green-500 bg-green-100" // Correct selection
                      : "border-red-500 bg-red-100" // Incorrect selection
                    : "border-blue-500 bg-blue-100" // Selected but not submitted
                  : "border-gray-300 bg-gray-100 hover:bg-gray-200" // Not selected
              } ${
                submitted &&
                !selectedWords.includes(word) &&
                isWordCorrect(word)
                  ? "border-2 border-dashed border-green-500" // Correct but not selected
                  : ""
              } `}
              disabled={submitted}
            >
              {word}
            </button>
          ))}
        </div>

        {/* Submit Button */}
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedWords.length === 0}
            className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
          >
            Check Answers
          </button>
        ) : (
          <button
            onClick={() => setSubmitted(false)}
            className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          >
            Try Again
          </button>
        )}

        {/* Feedback Section */}
        {submitted && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <p className="mb-3 font-medium">{exercise.feedback}</p>
            <ul className="list-disc pl-5">
              {exercise.words.map((word, index) => (
                <li
                  key={index}
                  className={`text-sm ${
                    correctAnswers.includes(index)
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {word}:{" "}
                  {correctAnswers.includes(index)
                    ? "Associated"
                    : "Not Associated"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});

export default WordAssociationGame;
