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

const DragDropExercise = forwardRef(({ exercise, isCompleted }, ref) => {
  const correctAnswerArray = exercise.correctAnswer
    .replace(/['"]/g, "") // Remove quotes
    .split(" ")
    .map((word, index, arr) => {
      if (index === 0) {
        // Capitalize first word
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      if (index === arr.length - 1) {
        // Add period to last word if it doesn't have one
        return word.endsWith(".") ? word : word + ".";
      }
      return word;
    });

  // Ensure first word is always capitalized in correctAnswerArray
  if (correctAnswerArray.length > 0) {
    correctAnswerArray[0] =
      correctAnswerArray[0].charAt(0).toUpperCase() +
      correctAnswerArray[0].slice(1);
  }

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

  useImperativeHandle(ref, () => ({
    checkValidity: () => {
      const userAnswer = currentOrder.map((word, index, arr) => {
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        if (index === arr.length - 1) {
          return word.endsWith(".") ? word : word + ".";
        }
        return word;
      });
      return userAnswer.join(" ") === correctAnswerArray.join(" ");
    },
  }));

  const isWordCorrect = (word, index) => {
    if (submitted) {
      let compareWord = word;
      if (index === 0) {
        compareWord = word.charAt(0).toUpperCase() + word.slice(1);
      }
      if (index === currentOrder.length - 1) {
        compareWord = compareWord.endsWith(".")
          ? compareWord
          : compareWord + ".";
      }
      return compareWord === correctAnswerArray[index];
    }
    return false;
  };

  // Determine if the current order is correct
  const isCorrect =
    currentOrder
      .map((word, index, arr) => {
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        if (index === arr.length - 1) {
          return word.endsWith(".") ? word : word + ".";
        }
        return word;
      })
      .join(" ") === correctAnswerArray.join(" ");

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
    if (currentOrder.join(" ") !== correctAnswerArray.join(" ")) {
      setAnimateWrong(true);
      setTimeout(() => setAnimateWrong(false), 400);
    }
  };

  const handleTryAgain = () => {
    setSubmitted(false);
    setShowFeedback(false);
    // Optionally reshuffle words here if you want
  };
  // Modified DraggableWord component to include correct/incorrect highlighting
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

    return (
      <motion.div
        ref={ref}
        layout
        className={`cursor-move rounded-md border px-4 py-2 shadow-sm transition-all duration-200 ${
          isDragging
            ? "bg-gray-300 opacity-60"
            : submitted
              ? isWordCorrect(word, index)
                ? "border-green-500 bg-green-100"
                : "border-red-500 bg-red-100"
              : "border-gray-300 bg-white"
        }`}
      >
        {word}
      </motion.div>
    );
  };

  useEffect(() => {
    if (!submitted) setShowFeedback(false);
  }, [currentOrder, submitted]);

  return (
    <div
      className={`relative rounded-lg border-2 p-4 ${
        isCompleted ? "border-green-200 bg-green-50" : "border-gray-200"
      }`}
    >
      {isCompleted && (
        <div className="absolute right-2 top-2 text-green-500">✓</div>
      )}
      <DndProvider backend={HTML5Backend}>
        <div className="mx-auto space-y-6 rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-10 flex items-center gap-4">
            <span className="flex h-8 w-8 animate-[gradient_6s_ease_infinite] items-center justify-center rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-sky-400 bg-[length:300%_300%] text-sm font-medium text-white">
              {exercise.order + 1}
            </span>
            <p className="font-medium text-muted-foreground">
              {exercise.question}
            </p>
          </div>

          {/* Draggable Words Container */}
          <div
            className={`flex min-h-[80px] flex-wrap gap-2 rounded-md p-4 transition-colors duration-300 ${
              submitted && isCorrect ? "bg-green-50" : "bg-gray-50"
            } ${animateWrong ? "animate-shake" : ""}`}
          >
            {currentOrder.map((word, index) => (
              <DraggableWord
                key={`${word}-${index}`}
                word={word}
                index={index}
                moveWord={moveWord}
              />
            ))}
          </div>

          {/* Submit Button */}
          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="w-full rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              Check Answer
            </button>
          ) : (
            !isCorrect && (
              <button
                onClick={handleTryAgain}
                className="w-full rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
              >
                Try Again
              </button>
            )
          )}

          {/* Feedback Message */}
          {showFeedback && (
            <div
              className={`rounded-md p-3 transition-all duration-300 ${
                isCorrect
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {isCorrect ? exercise.feedback : "Please try again!"}
            </div>
          )}
        </div>
      </DndProvider>
    </div>
  );
});

export default DragDropExercise;
