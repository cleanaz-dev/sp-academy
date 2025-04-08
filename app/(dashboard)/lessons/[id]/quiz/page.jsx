"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti"; // Import the Confetti component

export default function Quiz({ params }) {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // Track window width
  const [windowHeight, setWindowHeight] = useState(window.innerHeight); // Track window height
  const router = useRouter();

  useEffect(() => {
    const fetchQuiz = async () => {
      const response = await fetch(`/api/lessons/${params.id}/quiz`);
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
      } else {
        console.error("Failed to fetch quiz");
      }
    };

    fetchQuiz();
  }, [params.id]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === quiz.questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < quiz.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
    } else {
      setQuizCompleted(true);
    }
  };

  const handleReturnToLesson = () => {
    router.push(`/lessons/${params.id}`);
  };

  useEffect(() => {
    // Update window dimensions on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!quiz) return <div>Loading...</div>;

  if (quizCompleted) {
    return (
      <div className="container mx-auto p-4">
        <Confetti width={windowWidth} height={windowHeight} />{" "}
        {/* Render Confetti */}
        <h1 className="mb-4 text-2xl font-bold">Quiz Completed</h1>
        <p className="mb-4">
          Your score: {score} out of {quiz.questions.length}
        </p>
        <button
          onClick={handleReturnToLesson}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Return to Lesson
        </button>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">{quiz.title}</h1>
      <p className="mb-4">
        Question {currentQuestion + 1} of {quiz.questions.length}
      </p>
      <p className="mb-4">{question.text}</p>
      <ul className="mb-4">
        {question.options.map((option, index) => (
          <li key={index} className="mb-2">
            <button
              onClick={() => handleAnswerSelect(option)}
              className={`rounded px-4 py-2 ${
                selectedAnswer === option
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={handleNextQuestion}
        disabled={!selectedAnswer}
        className="rounded bg-green-500 px-4 py-2 text-white disabled:bg-gray-400"
      >
        {currentQuestion + 1 === quiz.questions.length ? "Finish" : "Next"}
      </button>
    </div>
  );
}
