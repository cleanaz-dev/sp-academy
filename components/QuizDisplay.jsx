'use client';

import { useState } from 'react';

export default function QuizDisplay({ quiz }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers({ ...userAnswers, [questionId]: answer });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowResults(true);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    quiz.questions.forEach(question => {
      if (userAnswers[question.id] === question.answer) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Quiz</h2>
      <form onSubmit={handleSubmit}>
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="mb-4">
            <p className="font-bold">{index + 1}. {question.text}</p>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex}>
                <input
                  type="radio"
                  id={`${question.id}-${optionIndex}`}
                  name={question.id}
                  value={option}
                  onChange={() => handleAnswerChange(question.id, option)}
                  disabled={showResults}
                />
                <label htmlFor={`${question.id}-${optionIndex}`}>{option}</label>
                {showResults && option === question.answer && <span className="text-green-500 ml-2">✓</span>}
              </div>
            ))}
            {showResults && userAnswers[question.id] !== question.answer && (
              <p className="text-red-500">Correct answer: {question.answer}</p>
            )}
          </div>
        ))}
        {!showResults && (
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Submit Quiz
          </button>
        )}
      </form>
      {showResults && (
        <div className="mt-4">
          <h3 className="text-xl font-bold">Results</h3>
          <p>You got {calculateScore()} out of {quiz.questions.length} questions correct.</p>
        </div>
      )}
    </div>
  );
}