"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { deburr } from "lodash";

const FillInTheBlankExercise = forwardRef(({ exercise, isCompleted }, ref) => {
  const correctAnswers = JSON.parse(exercise.correctAnswer).map((answer) =>
    deburr(answer.trim().toLowerCase()),
  );
  const [userAnswers, setUserAnswers] = useState(
    Array(correctAnswers.length).fill(""),
  );
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [inputErrors, setInputErrors] = useState([]);

  useImperativeHandle(ref, () => ({
    checkValidity: () => {
      return correctAnswers.every((answer, index) => {
        const normalizedUserInput = deburr(
          userAnswers[index].trim().toLowerCase(),
        );
        const normalizedCorrectAnswer = deburr(answer.trim().toLowerCase());
        return normalizedUserInput === normalizedCorrectAnswer;
      });
    },
  }));

  // Parse sentences to extract hints and split text
  const parsedSentences = exercise.sentences.map((sentence) => {
    const match = sentence.match(/(.*)\[___\](.*)\((.+)\)/);

    return {
      before: match?.[1]?.trim() || "",
      after: match?.[2]?.trim() || "",
      hint: match?.[3] || "",
    };
  });

  useEffect(() => {
    if (submitted) {
      const errors = userAnswers.map((answer, index) => {
        const normalizedUserInput = deburr(answer.trim().toLowerCase());
        const normalizedCorrectAnswer = deburr(
          correctAnswers[index].trim().toLowerCase(),
        );
        return normalizedUserInput !== normalizedCorrectAnswer;
      });
      setInputErrors(errors);
      setIsCorrect(errors.every((error) => !error));
    }
  }, [submitted]);

  const handleInputChange = (index, value) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
    setSubmitted(false);
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
      <div className="mx-auto rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-10 flex items-center gap-4">
          <span className="flex h-8 w-8 animate-[gradient_6s_ease_infinite] items-center justify-center rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-sky-400 bg-[length:300%_300%] text-sm font-medium text-white">
            {exercise.order + 1}
          </span>
          <p className="font-medium text-muted-foreground">
            {exercise.question}
          </p>
        </div>
        {parsedSentences.map((sentence, index) => (
          <div key={index} className="my-4 flex items-center text-lg">
            <div className="ml-2">{sentence.before}</div>

            <input
              type="text"
              value={userAnswers[index]}
              onChange={(e) => handleInputChange(index, e.target.value)}
              className={`mx-2 w-32 rounded-md border px-2 py-1 transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                submitted && inputErrors[index]
                  ? "animate-[shake_0.4s_ease-in-out] border-red-600"
                  : submitted && !inputErrors[index]
                    ? "border-green-500" // Green border for correct answers
                    : "border-gray-300"
              } `}
              placeholder="______"
            />
            {sentence.after}
          </div>
        ))}

        <button
          onClick={handleSubmit}
          className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white transition-opacity duration-200 hover:opacity-90"
        >
          Check Answers
        </button>

        {submitted && (
          <div
            className={`mt-4 animate-[fadeIn_0.3s_ease] rounded-md p-3 ${isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"} `}
          >
            {isCorrect
              ? exercise.feedback
              : "Some answers are incorrect. Please try again!"}
          </div>
        )}
      </div>
    </div>
  );
});

// Add these custom animations to your global CSS or Tailwind config
const customAnimations = `
  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(5px); }
    50% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
    100% { transform: translateX(0); }
  }

  @keyframes fadeIn {
    from { 
      opacity: 0; 
      transform: translateY(-10px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
`;

export default FillInTheBlankExercise;
