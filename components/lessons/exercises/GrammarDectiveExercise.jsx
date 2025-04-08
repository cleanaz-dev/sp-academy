"use client";
import { useState, forwardRef, useImperativeHandle } from "react";

const GrammarDetectiveExercise = forwardRef(
  ({ exercise, isCompleted }, ref) => {
    const [selectedWordIndex, setSelectedWordIndex] = useState(null);
    const [userCorrections, setUserCorrections] = useState({});
    const [submitted, setSubmitted] = useState(false);

    // Split sentence into words with punctuation handling
    const words = exercise.incorrectSentence
      .split(/\s+/)
      .map((word, index) => ({
        text: word,
        index,
        isError: exercise.errorIndices.includes(index),
        corrections: exercise.corrections[index] || [],
      }));

    useImperativeHandle(ref, () => ({
      checkValidity: () =>
        Object.entries(userCorrections).every(
          ([index, correction]) =>
            correction === exercise.correctAnswers[index],
        ),
    }));

    const handleWordClick = (index) => {
      if (!submitted && words[index].isError) {
        setSelectedWordIndex(index === selectedWordIndex ? null : index);
      }
    };

    const handleCorrectionSelect = (wordIndex, correction) => {
      setUserCorrections((prev) => ({
        ...prev,
        [wordIndex]: correction,
      }));
      setSelectedWordIndex(null); // Close correction menu after selection
    };

    const handleSubmit = () => {
      setSubmitted(true);
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

          {/* Interactive sentence display */}
          <div className="mb-6 flex flex-wrap gap-2">
            {words.map((word) => (
              <div
                key={word.index}
                className={`relative cursor-pointer rounded p-2 ${word.isError ? "bg-yellow-100 hover:bg-yellow-200" : ""} ${selectedWordIndex === word.index ? "ring-2 ring-blue-500" : ""} ${
                  submitted && word.isError
                    ? userCorrections[word.index] ===
                      exercise.correctAnswers[word.index]
                      ? "bg-green-100"
                      : "bg-red-100"
                    : ""
                } `}
                onClick={() => handleWordClick(word.index)}
              >
                {word.text}

                {/* Correction indicator */}
                {userCorrections[word.index] && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                    ✓
                  </span>
                )}

                {/* Correction menu */}
                {selectedWordIndex === word.index && (
                  <div className="absolute z-10 mt-2 rounded-lg border bg-white p-2 shadow-lg">
                    {word.corrections.map((correction, idx) => (
                      <button
                        key={idx}
                        className="block w-full rounded p-2 text-left hover:bg-gray-100"
                        onClick={() =>
                          handleCorrectionSelect(word.index, correction)
                        }
                      >
                        {correction}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit/Feedback section */}
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={
                Object.keys(userCorrections).length !==
                exercise.errorIndices.length
              }
              className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
            >
              Check Answers
            </button>
          ) : (
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              {exercise.errorIndices.map((index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <p
                    className={`font-medium ${
                      userCorrections[index] === exercise.correctAnswers[index]
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    <strong>"{words[index].text}"</strong> →{" "}
                    {exercise.correctAnswers[index]}
                  </p>
                  <p className="text-sm text-gray-600">
                    {exercise.feedback[index]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default GrammarDetectiveExercise;
