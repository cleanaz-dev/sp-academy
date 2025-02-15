// exercises/ImageWordInput.jsx
"use client"
import { useState } from 'react';
import Image from 'next/image';

const ExerciseImage = ({ imageUrl }) => {
  // Check if the imageUrl is a placeholder (wrapped in brackets)
  const isPlaceholder = imageUrl.startsWith('[') && imageUrl.endsWith(']');
  
  if (isPlaceholder) {
    return (
      <div className="mb-4 relative h-48 w-full bg-gray-100 rounded flex items-center justify-center">
        <div className="text-gray-400">
          [Placeholder Image: {imageUrl.slice(1, -1)}]
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 relative h-48 w-full">
      <Image 
        src={imageUrl}
        alt="Exercise reference"
        fill
        className="object-contain rounded"
      />
    </div>
  );
};

const ImageWordInput = ({ exercise, onComplete }) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

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
      <h3 className="text-xl font-semibold mb-4">{exercise.question}</h3>
      
      {exercise.additionalData.image_url && (
        <ExerciseImage imageUrl={exercise.additionalData.image_url} />
      )}

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your answer..."
          />
          
          {exercise.additionalData.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
              title="Show hint"
            >
              💡
            </button>
          )}
        </div>

        {showHint && exercise.additionalData.hint && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            💡 Hint: {exercise.additionalData.hint}
          </div>
        )}

        {feedback && (
          <div className={`p-3 rounded ${
            feedback.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {feedback.message}
          </div>
        )}

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

export default ImageWordInput;