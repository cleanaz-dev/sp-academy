'use client';

import { useState } from 'react';

export default function QuizCreator({ lessonId, onQuizCreated }) {
  const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], answer: '' }]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], answer: '' }]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, questions }),
      });

      if (response.ok) {
        onQuizCreated();
      } else {
        console.error('Failed to create quiz');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {questions.map((question, qIndex) => (
        <div key={qIndex} className="mb-4">
          <input
            type="text"
            value={question.text}
            onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
            placeholder="Question"
            className="w-full p-2 mb-2 border rounded"
          />
          {question.options.map((option, oIndex) => (
            <input
              key={oIndex}
              type="text"
              value={option}
              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
              placeholder={`Option ${oIndex + 1}`}
              className="w-full p-2 mb-2 border rounded"
            />
          ))}
          <select
            value={question.answer}
            onChange={(e) => updateQuestion(qIndex, 'answer', e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          >
            <option value="">Select correct answer</option>
            {question.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}
      <button type="button" onClick={addQuestion} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
        Add Question
      </button>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Create Quiz
      </button>
    </form>
  );
}