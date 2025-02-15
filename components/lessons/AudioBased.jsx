// exercises/AudioBased.jsx
"use client"
import { useState, useRef } from 'react';

const AudioPlayer = ({ audioUrl }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handlePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  return (
    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
      <button
        onClick={handlePlay}
        className="w-12 h-12 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <PauseIcon className="w-6 h-6" />
        ) : (
          <PlayIcon className="w-6 h-6" />
        )}
      </button>

      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedData={() => setIsLoading(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {isLoading && (
        <div className="text-gray-500">Loading audio...</div>
      )}
    </div>
  );
};

const AudioBased = ({ exercise, onComplete }) => {
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const isMultipleChoice = exercise.additionalData?.options?.length > 0;

  const handleSubmit = () => {
    setAttempts(prev => prev + 1);
    
    const userAnswer = isMultipleChoice ? selectedOption : answer;
    const isCorrect = userAnswer?.toLowerCase().trim() === exercise.correctAnswer.toLowerCase().trim();

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

  const handleReset = () => {
    setAnswer('');
    setSelectedOption(null);
    setFeedback(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h3 className="text-xl font-semibold mb-6">{exercise.question}</h3>

      {/* Audio Player */}
      <div className="mb-6">
        <AudioPlayer audioUrl={exercise.additionalData.audio_url} />
      </div>

      {/* Exercise Input */}
      <div className="space-y-6">
        {isMultipleChoice ? (
          // Multiple Choice Options
          <div className="space-y-3">
            {exercise.additionalData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(option)}
                className={`w-full p-4 text-left rounded-lg transition-colors
                  ${selectedOption === option 
                    ? 'bg-blue-100 border-2 border-blue-500' 
                    : 'bg-gray-50 hover:bg-gray-100'
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          // Text Input
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your answer..."
          />
        )}

        {/* Hint Display */}
        {exercise.additionalData?.hint && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            💡 Hint: {exercise.additionalData.hint}
          </div>
        )}

        {/* Feedback Message */}
        {feedback && (
          <div className={`p-4 rounded-lg ${
            feedback.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {feedback.message}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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

// Icons
const PlayIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PauseIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default AudioBased;