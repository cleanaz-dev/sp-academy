"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti"; // Import the Confetti component
import { Button } from "@/components/old-ui/button";
import { CheckCircle } from "lucide-react";
import { SkipBack } from "lucide-react";
import { SkipForward } from "lucide-react";
import { toast } from "sonner";

export default function Quiz({ params }) {
  const [quiz, setQuiz] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // Use a simple string for the current answer and an array to store answers for all questions.
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(() => 0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const router = useRouter();

  // Update window dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch the quiz data from the API
  useEffect(() => {
    const fetchQuiz = async () => {
      const response = await fetch(`/api/lessons/${params.lessonId}/quiz`);
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
        setCourseId(data.course ? data.course.id : null);
        // Initialize the answers array with an empty string for each question.
        if (data.questions) {
          setAnswers(Array(data.questions.length).fill(""));
        }
      } else {
        console.error("Failed to fetch quiz");
      }
    };

    fetchQuiz();
  }, [params.lessonId]);

  // When currentQuestion changes, update selectedAnswer with the stored answer (if any)
  useEffect(() => {
    setSelectedAnswer(answers[currentQuestion] || "");
  }, [currentQuestion, answers]);

  // Handler for selecting an answer
  const handleAnswerSelect = (answer) => {
    // Update the answers array for the current question.
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
    setSelectedAnswer(answer);
  };

  // Handler for moving to the next question
  const handleNextQuestion = () => {
    // Create a copy of the answers array to work with
    const currentAnswers = [...answers];

    // Check if the current answer is correct using the latest state
    const isCorrect =
      currentAnswers[currentQuestion] ===
      quiz.questions[currentQuestion].answer;

    // Update score only if we haven't reached the end yet
    if (currentQuestion + 1 < quiz.questions.length) {
      if (isCorrect) {
        setScore((prev) => prev + 1);
      }
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Final score calculation when completing the quiz
      const finalScore = currentAnswers.reduce((acc, answer, index) => {
        return answer === quiz.questions[index].answer ? acc + 1 : acc;
      }, 0);

      setScore(finalScore);
      setQuizCompleted(true);
    }
  };

  // Handler for moving to the previous question
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleReturnToLesson = () => {
    router.push(`/courses/${courseId}/lesson/${params.lessonId}`);
  };

  const handleQuizSubmit = async () => {
    try {
      // Calculate the score as a percentage
      const totalQuestions = quiz.questions.length;
      const percentageScore = (score / totalQuestions) * 100;

      // Send the quiz result to the API
      const response = await fetch("/api/quiz/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quiz.id,
          score: percentageScore, // Send the percentage score
          lessonId: quiz.lessonId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      const data = await response.json();
      console.log("Quiz submitted:", data);
      toast.success("Quiz submitted successfully!");
      router.push(`/courses/${courseId}`); // Redirect to lesson page
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting the quiz");
    }
  };

  if (!quiz) return <div>Loading...</div>;

  if (quizCompleted) {
    return (
      <div className="container mx-auto p-4">
        <Confetti width={windowWidth} height={windowHeight} />
        <h1 className="mb-4 text-2xl font-bold">Quiz Completed</h1>
        <p className="mb-4">
          Your score: {score} out of {quiz.questions.length}
        </p>
        <div className="flex gap-4">
          <Button
            type="button"
            onClick={handleReturnToLesson}
            className="bg-blue-500 text-white transition-all duration-300 hover:bg-white hover:text-blue-500"
          >
            Return to Lesson
          </Button>
          <Button
            type="button"
            onClick={handleQuizSubmit}
            className="bg-emerald-500 text-white transition-colors duration-300 hover:bg-white hover:text-emerald-500"
          >
            Submit Quiz
          </Button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">{quiz.lesson.title}</h1>
      <p className="mb-4">
        Question {currentQuestion + 1} of {quiz.questions.length}
      </p>
      <p className="mb-4">{question.text}</p>
      <ul className="mb-4">
        {question.options.map((option, index) => (
          <li key={index} className="mb-2">
            <div className="flex items-center gap-3">
              {/* Button */}
              <button
                onClick={() => handleAnswerSelect(option)}
                className={`flex rounded px-4 py-2 transition-all ${
                  selectedAnswer === option
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <span>{option}</span>
              </button>

              {/* Checkmark icon (outside the button, aligned to the right) */}
              {selectedAnswer === option && (
                <CheckCircle
                  className="h-5 w-5 cursor-pointer text-green-500 transition-all duration-300 animate-in fade-in zoom-in-50 hover:text-green-600"
                  aria-hidden="true"
                />
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-4">
        {/* Previous Button (Left Arrow) */}
        <Button
          size="icon"
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0} // Disable on the first question
          className={`bg-blue-300 text-white transition-all duration-300 ${
            currentQuestion === 0
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-blue-500"
          }`}
        >
          <SkipBack />
        </Button>

        {/* Next Button (Right Arrow) */}
        <Button
          size="icon"
          onClick={handleNextQuestion}
          disabled={!selectedAnswer} // Disable if no answer is selected
          className={`bg-green-300 text-white transition-all duration-300 ${
            !selectedAnswer
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-green-500"
          }`}
        >
          <SkipForward />
        </Button>
      </div>
    </div>
  );
}
