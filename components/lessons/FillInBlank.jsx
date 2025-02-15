// exercises/FillInBlank.jsx
"use client"
import { useState } from 'react';

const FillInBlank = ({ exercise, onComplete }) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Split the question to highlight the blank space
  const questionParts = exercise.question.split('_____');

  const handleSubmit = () => {
    setAttempts(prev => prev + 1);
    const isCorrect = answer.toLowerCase().trim() === exercise.correctAnswer.toLowerCase().trim();

    setFeedback({
      message: isCorrect ? 'Correct!' : 'Try again!',
      type: isCorrect ? 'success' : 'error'
    });

    if (isCorrect) {
      onComplete(exercise.id, {
        completed: true,
        score: Math.max(100 - (attempts * 10), 0),
        attempts
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleReset = () => {
    setAnswer('');
    setFeedback(null);
    setShowHint(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Question Display */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">
          {questionParts.map((part, index) => (
            <span key={index}>
              {part}
              {index < questionParts.length - 1 && (
                <span className="mx-2 px-4 py-1 bg-gray-100 rounded">
                  _____
                </span>
              )}
            </span>
          ))}
        </h3>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your answer..."
            aria-label="Your answer"
          />
          
          {exercise.additionalData?.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
              title="Show hint"
            >
              💡
            </button>
          )}
        </div>

        {/* Hint Display */}
        {showHint && exercise.additionalData?.hint && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            💡 Hint: {exercise.additionalData.hint}
          </div>
        )}

        {/* Feedback Message */}
        {feedback && (
          <div 
            className={`p-3 rounded ${
              feedback.type === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Progress Information */}
        <div className="text-sm text-gray-600">
          <span>Attempts: {attempts}</span>
          {feedback?.type === 'success' && (
            <span className="ml-4">
              Score: {Math.max(100 - (attempts * 10), 0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FillInBlank;