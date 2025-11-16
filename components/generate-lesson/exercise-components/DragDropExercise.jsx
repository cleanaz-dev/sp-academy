"use client";
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export const DragDropExercise = forwardRef(({ exercise }, ref) => {
  // Extract the words from the correct answer, including punctuation
  const correctAnswerWords =
    exercise.correctAnswer.match(/[\w']+|[.,!?;]+/g) || [];

  // Initialize with scrambled words
  const [currentOrder, setCurrentOrder] = useState(() => {
    // Shuffle the words initially
    const shuffled = [...exercise.scrambledWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const [submitted, setSubmitted] = useState(false);
  const [animateWrong, setAnimateWrong] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Format user's answer to match the expected format of the correct answer
  const formatUserAnswer = () => {
    // Just join words with spaces, all lowercase for comparison
    return currentOrder.join(" ").toLowerCase();
  };

  useImperativeHandle(ref, () => ({
    checkValidity: () => {
      return formatUserAnswer() === exercise.correctAnswer;
    },
  }));

  // Determine if the current order is correct
  const isCorrect =
    formatUserAnswer() ===
    exercise.correctAnswer
      .toLowerCase()
      .replace(/[.,!?;]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  // Words with correct punctuation and capitalization as they should appear in final answer
  const getWordWithFormatting = (word, index, isLast) => {
    if (index === 0) {
      // First word should be capitalized
      word = word.charAt(0).toUpperCase() + word.slice(1);

      // Add comma if first word in correct answer has comma
      if (exercise.correctAnswer.split(" ")[0].includes(",")) {
        word += ",";
      }
    } else if (isLast) {
      // Last word should have period
      if (!word.endsWith(".")) {
        word += ".";
      }
    }

    return word;
  };

  // Check if a word is in the correct position
  const isWordCorrect = (word, index) => {
    if (!submitted) return false;

    // Get words from the correct answer, removing punctuation
    const correctWords = exercise.correctAnswer
      .toLowerCase()
      .replace(/[.,!?;]/g, "")
      .split(/\s+/);

    // Compare the current word with the correct word at this position
    // Ignore case and punctuation for comparison
    return word.toLowerCase() === correctWords[index];
  };

  const moveWord = useCallback((dragIndex, hoverIndex) => {
    setCurrentOrder((prev) => {
      const newOrder = [...prev];
      [newOrder[dragIndex], newOrder[hoverIndex]] = [
        newOrder[hoverIndex],
        newOrder[dragIndex],
      ];
      return newOrder;
    });
  }, []);

  const handleSubmit = () => {
    setSubmitted(true);
    setShowFeedback(true);
    if (!isCorrect) {
      setAnimateWrong(true);
      setTimeout(() => setAnimateWrong(false), 400);
    }
  };

  const handleTryAgain = () => {
    setSubmitted(false);
    setShowFeedback(false);
  };

  // Modified DraggableWord component
  const DraggableWord = ({ word, index, moveWord }) => {
    const ref = useRef(null);

    const [{ isDragging }, drag] = useDrag({
      type: "word",
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: "word",
      hover: (item) => {
        if (!ref.current) return;
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;
        moveWord(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });

    drag(drop(ref));

    // Display the word with appropriate style based on status
    const isLast = index === currentOrder.length - 1;
    const displayWord =
      submitted && isCorrect
        ? getWordWithFormatting(word, index, isLast)
        : word;

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant="ghost" // Use shadcn Button with ghost variant
          className={`m-0.5 cursor-move rounded-md px-2.5 py-1.5 text-sm font-medium shadow-sm transition-all duration-200 ${
            isDragging
              ? "border-2 border-indigo-300 bg-indigo-100 opacity-50 shadow-lg"
              : submitted
                ? isWordCorrect(word, index)
                  ? "animate-pulse-subtle border-0 bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                  : "animate-wobble border-0 bg-gradient-to-r from-red-400 to-pink-500 text-white"
                : "border border-indigo-200 bg-gradient-to-r from-indigo-100 to-blue-100 hover:border-indigo-300"
          } `}
        >
          {displayWord}
        </Button>
      </motion.div>
    );
  };

  useEffect(() => {
    if (!submitted) setShowFeedback(false);
  }, [currentOrder, submitted]);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border-2 p-3 ${
        isCorrect
          ? "border-green-300 bg-gradient-to-br from-green-50 to-white"
          : "border-indigo-200 bg-gradient-to-br from-indigo-50 to-white"
      } `}
    >
      {/* Decorative elements */}
      <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-indigo-200 opacity-30"></div>
      <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-blue-200 opacity-20"></div>

      {isCorrect && (
        <div className="absolute right-2 top-2 z-10 rounded-full bg-green-100 p-1 text-green-600 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      <DndProvider backend={HTML5Backend}>
        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-medium text-white shadow-sm">
              {exercise.order + 1}
            </span>
            <p className="text-sm font-medium text-gray-700">
              {exercise.question}
            </p>
          </div>

          {/* Draggable Words Container */}
          <div
            className={`relative flex min-h-[60px] flex-wrap gap-1 rounded-md border p-2 transition-all duration-300 ${animateWrong ? "animate-shake" : ""} ${
              submitted && isCorrect
                ? "border-green-200 bg-green-50/50"
                : "border-indigo-100 bg-white/80"
            } `}
          >
            {currentOrder.map((word, index) => (
              <DraggableWord
                key={`${word}-${index}`}
                word={word}
                index={index}
                moveWord={moveWord}
              />
            ))}

            {/* Animated pattern background */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] opacity-30 [background-size:16px_16px]"></div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {!submitted ? (
              <Button
                size="sm"
                onClick={handleSubmit}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-medium text-white shadow-sm transition-all hover:opacity-90"
              >
                Check
              </Button>
            ) : (
              !isCorrect && (
                <Button
                  size="sm"
                  onClick={handleTryAgain}
                  className="rounded-md bg-gradient-to-r from-blue-500 to-teal-500 text-xs font-medium text-white shadow-sm transition-all hover:opacity-90"
                >
                  Try Again
                </Button>
              )
            )}

            {/* Feedback Message */}
            {showFeedback && (
              <div
                className={`animate-fadeIn rounded-full px-3 py-1.5 text-xs ${
                  isCorrect
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                } `}
              >
                {isCorrect ? "Perfect! ✨" : "Not quite right 🔄"}
              </div>
            )}
          </div>

          {/* Extended feedback message */}
          {showFeedback && isCorrect && exercise.feedback && (
            <div className="animate-fadeIn mt-2 rounded-r-sm border-l-2 border-indigo-300 bg-white/80 py-1 pl-2 text-xs italic text-gray-600">
              {exercise.feedback}
            </div>
          )}

          {/* Display correct answer when submitted but incorrect */}
          {submitted && !isCorrect && (
            <div className="animate-fadeIn mt-2 text-xs text-gray-500">
              <span className="font-medium">Hint:</span> The correct sentence
              should have proper capitalization and punctuation.
            </div>
          )}
        </div>
      </DndProvider>
    </div>
  );
});
