"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Bird, Rabbit, Turtle, Fish } from 'lucide-react';

const SYMBOLS = ['★', '◆', '●', '▲']; 

const MatchingExercise = forwardRef(({ exercise, isCompleted }, ref) => {
  const [shuffledPairs, setShuffledPairs] = useState([]);
  const [selectedMatches, setSelectedMatches] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);


  useImperativeHandle(ref, () => ({
    checkValidity: () => {
      return shuffledPairs.every((pair, shuffledIndex) => {
        const originalIndex = exercise.pairs.findIndex(p => p.word === pair.word);
        return selectedMatches[shuffledIndex] === originalIndex;
      });      
    }
  }));

  useEffect(() => {
    initializeExercise();
  }, [exercise]);

  const initializeExercise = () => {
    const shuffled = [...exercise.pairs].sort(() => Math.random() - 0.5);
    setShuffledPairs(shuffled);
    setSelectedMatches({});
    setSubmitted(false);
    setShowFeedback(false);
  };

  const handleSymbolSelect = (wordIndex, symbolIndex) => {
    if (!submitted) {
      setSelectedMatches(prev => ({
        ...prev,
        [wordIndex]: symbolIndex
      }));
    }
  };



  const checkAnswers = () => {
    return exercise.pairs.every((pair, index) => {
      const originalIndex = exercise.pairs.findIndex(p => p.word === shuffledPairs[index].word);
      return selectedMatches[index] === originalIndex;
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowFeedback(true);
  };

  const getFeedbackMessage = () => {
    const isPerfect = checkAnswers();
    return isPerfect ? exercise.feedback : 'Some matches are incorrect. Please try again!';
  };

  return (
    <div className={`relative p-6 rounded-lg border-2 ${
      isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'
    }`}>
      {isCompleted && (
        <div className="absolute top-2 right-2 text-green-500">✓</div>
      )}
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <div className="flex items-center gap-4 mb-10">
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-sky-400 bg-[length:300%_300%] animate-[gradient_6s_ease_infinite] text-sm font-medium text-white">
            {exercise.order + 1}
          </span>
          <p className="font-medium text-muted-foreground">
            {exercise.question}
          </p>
        </div>
      
      <div className="space-y-6">
        {/* Word Column */}
        <div className="space-y-4">
          {shuffledPairs.map((pair, wordIndex) => {
            const originalIndex = exercise.pairs.findIndex(p => p.word === pair.word);
            const isCorrect = submitted && selectedMatches[wordIndex] === originalIndex;
            const isIncorrect = submitted && selectedMatches[wordIndex] !== originalIndex;

            return (
              <div key={pair.word} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{pair.word}</span>
                
                <div className="flex gap-2">
                  {SYMBOLS.map((symbol, symbolIndex) => {
                    const isSelected = selectedMatches[wordIndex] === symbolIndex;
                    let buttonStyle = 'bg-white border-gray-200';
                    
                    if (submitted) {
                      if (symbolIndex === originalIndex) {
                        buttonStyle = 'bg-green-100 border-green-500';
                      } else if (isSelected) {
                        buttonStyle = 'bg-red-100 border-red-500';
                      }
                    } else if (isSelected) {
                      buttonStyle = 'bg-blue-100 border-blue-500';
                    }

                    return (
                      <button
                        key={symbol}
                        onClick={() => handleSymbolSelect(wordIndex, symbolIndex)}
                        className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg 
                          ${buttonStyle} transition-colors duration-200 text-xl
                          ${!submitted ? 'hover:bg-gray-50' : ''}`}
                        disabled={submitted}
                      >
                        {symbol}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Match Key */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-3 text-gray-600">Symbol Guide:</h3>
          <div className="grid grid-cols-2 gap-3">
            {exercise.pairs.map((pair, index) => (
              <div key={pair.match} className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-white border-2 rounded-lg">
                  {SYMBOLS[index]}
                </span>
                <span className="text-sm text-gray-600">{pair.match}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedMatches).length < exercise.pairs.length}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
              disabled:bg-gray-300 transition-colors duration-200"
          >
            Check Answers
          </button>
        ) : (
          <button
            onClick={initializeExercise}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Try Again
          </button>
        )}

        {showFeedback && (
          <div className={`p-4 rounded-lg ${
            checkAnswers() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <p className="font-medium">{getFeedbackMessage()}</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
});

export default MatchingExercise;