'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti'; // Import the Confetti component
import { Button } from '@/components/ui/button';

export default function Quiz({ params }) {
  const [quiz, setQuiz] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // Track window width
  const [windowHeight, setWindowHeight] = useState(window.innerHeight); // Track window height
  const router = useRouter();

  // Fetch the quiz data from the API
  useEffect(() => {
    const fetchQuiz = async () => {
      // Ensure that the endpoint matches your API route. Adjust 'lesson' vs. 'lessons' if needed.
      const response = await fetch(`/api/lessons/${params.lessonId}/quiz`);
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
        // If your API returns course nested inside the quiz data (e.g., { ...quiz, course: { id: ... } })
        setCourseId(data.course ? data.course.id : null);
        // If instead it returns a top-level courseId (e.g., { ...quiz, courseId: ... }), then use:
        // setCourseId(data.courseId);
      } else {
        console.error('Failed to fetch quiz');
      }
    };

    fetchQuiz();
  }, [params.lessonId]);
  

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  console.log("lessondId: ", quiz);

  const handleNextQuestion = () => {
    if (selectedAnswer === quiz.questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < quiz.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
    } else {
      setQuizCompleted(true);
    }
  };

  const handleReturnToLesson = () => {
    router.push(`/courses/${courseId}/lesson/${params.lessonId}`);
  };

  useEffect(() => {
    // Update window dimensions on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleQuizSubmit = async () => {
    try {
      console.log("Quiz submitted");
      toast.success('Quiz submitted successfully!');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while submitting the quiz');
    }
  }

  if (!quiz) return <div>Loading...</div>;

  if (quizCompleted) {
    return (
      <div className="container mx-auto p-4">
        <Confetti width={windowWidth} height={windowHeight} /> {/* Render Confetti */}
        <h1 className="text-2xl font-bold mb-4">Quiz Completed</h1>
        <p className="mb-4">Your score: {score} out of {quiz.questions.length}</p>
        <Button
          type="button"
          onClick={handleReturnToLesson} 
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Return to Lesson
        </Button>
        <Button 
          type="button"
          onClick={handleQuizSubmit} 
          className='bg-emerald-400 text-white px-4 p-y rounded'
        >
          Submit Quiz
        </Button>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{quiz.lesson.title}</h1>
      <p className="mb-4">Question {currentQuestion + 1} of {quiz.questions.length}</p>
      <p className="mb-4">{question.text}</p>
      <ul className="mb-4">
        {question.options.map((option, index) => (
          <li key={index} className="mb-2">
            <button
              onClick={() => handleAnswerSelect(option)}
              className={`px-4 py-2 rounded ${
                selectedAnswer === option ? 'bg-blue-500 text-white' : 'bg-gray-200'
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
        className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {currentQuestion + 1 === quiz.questions.length ? 'Finish' : 'Next'}
      </button>
    </div>
  );
}
