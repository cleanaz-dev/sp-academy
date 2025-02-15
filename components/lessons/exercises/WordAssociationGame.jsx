"use client";
import { useState, forwardRef, useImperativeHandle } from 'react';

const WordAssociationGame = forwardRef(({ exercise, isCompleted }, ref) => {
  const [selectedWords, setSelectedWords] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  // Correct answers are stored as an array of indices
  const correctAnswers = exercise.correctAnswer;

  useImperativeHandle(ref, () => ({
    checkValidity: () => {
      const userSelectedIndices = selectedWords.map(word => exercise.words.indexOf(word));
      return (
        userSelectedIndices.length === correctAnswers.length &&
        userSelectedIndices.every(index => correctAnswers.includes(index))
   )}
  }));

  const handleWordClick = (word) => {
    if (!submitted) {
      setSelectedWords(prev => 
        prev.includes(word) 
          ? prev.filter(w => w !== word) // Deselect if already selected
          : [...prev, word] // Add to selection
      );
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const isWordCorrect = (word) => {
    return correctAnswers.includes(exercise.words.indexOf(word));
  };

  return (
    <div className={`relative p-6 rounded-lg border-2 ${
      isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'
    }`}>
      {isCompleted && (
        <div className="absolute top-2 right-2 text-green-500">✓</div>
      )}
      
      <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-4 mb-10">
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-sky-400 bg-[length:300%_300%] animate-[gradient_6s_ease_infinite] text-sm font-medium text-white">
              {exercise.order + 1}
            </span>
            <p className="font-medium text-muted-foreground">
              {exercise.question}
            </p>
          </div>
        
        {/* Image Display */}
        <div className="mb-6">
          <img 
            src={exercise.imageUrl} 
            alt={exercise.image_prompt} 
            className="w-full max-w-md mx-auto rounded-lg shadow-sm"
          />
        </div>

        {/* Word Selection */}
        <div className="flex flex-wrap gap-2 mb-6">
          {exercise.words.map((word, index) => (
            <button
              key={index}
              onClick={() => handleWordClick(word)}
              className={`px-4 py-2 rounded-lg transition-all duration-200
                ${
                  selectedWords.includes(word)
                    ? submitted
                      ? isWordCorrect(word)
                        ? 'bg-green-100 border-green-500' // Correct selection
                        : 'bg-red-100 border-red-500' // Incorrect selection
                      : 'bg-blue-100 border-blue-500' // Selected but not submitted
                    : 'bg-gray-100 hover:bg-gray-200 border-gray-300' // Not selected
                }
                ${submitted && !selectedWords.includes(word) && isWordCorrect(word)
                  ? 'border-dashed border-2 border-green-500' // Correct but not selected
                  : ''
                }
              `}
              disabled={submitted}
            >
              {word}
            </button>
          ))}
        </div>

        {/* Submit Button */}
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedWords.length === 0}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Check Answers
          </button>
        ) : (
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        )}

        {/* Feedback Section */}
        {submitted && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium mb-3">{exercise.feedback}</p>
            <ul className="list-disc pl-5">
              {exercise.words.map((word, index) => (
                <li
                  key={index}
                  className={`text-sm ${
                    correctAnswers.includes(index)
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}
                >
                  {word}: {correctAnswers.includes(index) ? "Associated" : "Not Associated"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});

export default WordAssociationGame;