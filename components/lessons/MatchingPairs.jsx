// exercises/MatchingPairs.jsx
"use client";
import { useState, useEffect } from "react";

const MatchingPairs = ({ exercise, onComplete }) => {
  const [pairs, setPairs] = useState([]);
  const [selectedPair, setSelectedPair] = useState([null, null]);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);

  // Initialize pairs
  useEffect(() => {
    const correctPairs = JSON.parse(exercise.correctAnswer);

    // Create array of left and right items
    const leftItems = Object.keys(correctPairs);
    const rightItems = Object.values(correctPairs);

    // Shuffle both arrays
    const shuffledLeft = [...leftItems].sort(() => Math.random() - 0.5);
    const shuffledRight = [...rightItems].sort(() => Math.random() - 0.5);

    setPairs({
      left: shuffledLeft.map((item, index) => ({
        id: `left-${index}`,
        text: item,
        original: item,
      })),
      right: shuffledRight.map((item, index) => ({
        id: `right-${index}`,
        text: item,
        original: item,
      })),
    });
  }, [exercise.correctAnswer]);

  const handleItemClick = (item, side) => {
    const newSelected = [...selectedPair];
    if (side === "left") {
      newSelected[0] = item;
    } else {
      newSelected[1] = item;
    }
    setSelectedPair(newSelected);

    // Check if we have a pair selected
    if (newSelected[0] && newSelected[1]) {
      checkPair(newSelected[0], newSelected[1]);
    }
  };

  const checkPair = (leftItem, rightItem) => {
    setAttempts((prev) => prev + 1);

    const correctPairs = JSON.parse(exercise.correctAnswer);
    const isCorrect = correctPairs[leftItem.original] === rightItem.original;

    if (isCorrect) {
      setMatchedPairs((prev) => new Set([...prev, leftItem.id, rightItem.id]));
      setFeedback({
        message: "Correct match!",
        type: "success",
      });

      // Check if all pairs are matched
      if (matchedPairs.size + 2 === Object.keys(correctPairs).length * 2) {
        onComplete(exercise.id, {
          completed: true,
          score: Math.max(100 - attempts * 5, 0),
          attempts,
        });
      }
    } else {
      setFeedback({
        message: "Try again!",
        type: "error",
      });
    }

    // Reset selection
    setTimeout(() => {
      setSelectedPair([null, null]);
      setFeedback(null);
    }, 1000);
  };

  const handleReset = () => {
    setSelectedPair([null, null]);
    setMatchedPairs(new Set());
    setAttempts(0);
    setFeedback(null);

    // Reshuffle pairs
    const correctPairs = JSON.parse(exercise.correctAnswer);
    const leftItems = Object.keys(correctPairs);
    const rightItems = Object.values(correctPairs);

    setPairs({
      left: leftItems
        .sort(() => Math.random() - 0.5)
        .map((item, index) => ({
          id: `left-${index}`,
          text: item,
          original: item,
        })),
      right: rightItems
        .sort(() => Math.random() - 0.5)
        .map((item, index) => ({
          id: `right-${index}`,
          text: item,
          original: item,
        })),
    });
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h3 className="mb-6 text-xl font-semibold">{exercise.question}</h3>

      <div className="flex justify-between gap-8">
        {/* Left Column */}
        <div className="flex-1 space-y-2">
          {pairs.left?.map((item) => (
            <button
              key={item.id}
              onClick={() =>
                !matchedPairs.has(item.id) && handleItemClick(item, "left")
              }
              className={`w-full rounded p-3 text-left transition-all ${
                matchedPairs.has(item.id)
                  ? "cursor-default bg-green-100"
                  : selectedPair[0]?.id === item.id
                    ? "bg-blue-100"
                    : "bg-gray-100 hover:bg-gray-200"
              } ${matchedPairs.has(item.id) ? "opacity-50" : "opacity-100"} `}
              disabled={matchedPairs.has(item.id)}
            >
              {item.text}
            </button>
          ))}
        </div>

        {/* Right Column */}
        <div className="flex-1 space-y-2">
          {pairs.right?.map((item) => (
            <button
              key={item.id}
              onClick={() =>
                !matchedPairs.has(item.id) && handleItemClick(item, "right")
              }
              className={`w-full rounded p-3 text-left transition-all ${
                matchedPairs.has(item.id)
                  ? "cursor-default bg-green-100"
                  : selectedPair[1]?.id === item.id
                    ? "bg-blue-100"
                    : "bg-gray-100 hover:bg-gray-200"
              } ${matchedPairs.has(item.id) ? "opacity-50" : "opacity-100"} `}
              disabled={matchedPairs.has(item.id)}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`mt-4 rounded p-3 ${
            feedback.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Controls and Progress */}
      <div className="mt-6 space-y-4">
        <button
          onClick={handleReset}
          className="rounded bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
        >
          Reset
        </button>

        <div className="text-sm text-gray-600">
          <span>Attempts: {attempts}</span>
          {matchedPairs.size ===
            Object.keys(JSON.parse(exercise.correctAnswer)).length * 2 && (
            <span className="ml-4">
              Score: {Math.max(100 - attempts * 5, 0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchingPairs;
