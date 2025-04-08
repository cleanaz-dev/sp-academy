// exercises/AudioBased.jsx
"use client";
import { useState, useRef } from "react";

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
    <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
      <button
        onClick={handlePlay}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <PauseIcon className="h-6 w-6" />
        ) : (
          <PlayIcon className="h-6 w-6" />
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

      {isLoading && <div className="text-gray-500">Loading audio...</div>}
    </div>
  );
};

const AudioBased = ({ exercise, onComplete }) => {
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const isMultipleChoice = exercise.additionalData?.options?.length > 0;

  const handleSubmit = () => {
    setAttempts((prev) => prev + 1);

    const userAnswer = isMultipleChoice ? selectedOption : answer;
    const isCorrect =
      userAnswer?.toLowerCase().trim() ===
      exercise.correctAnswer.toLowerCase().trim();

    setFeedback({
      message: isCorrect ? "Correct!" : "Try again!",
      type: isCorrect ? "success" : "error",
    });

    if (isCorrect) {
      onComplete(exercise.id, {
        completed: true,
        score: Math.max(100 - attempts * 10, 0),
        attempts,
      });
    }
  };

  const handleReset = () => {
    setAnswer("");
    setSelectedOption(null);
    setFeedback(null);
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h3 className="mb-6 text-xl font-semibold">{exercise.question}</h3>

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
                className={`w-full rounded-lg p-4 text-left transition-colors ${
                  selectedOption === option
                    ? "border-2 border-blue-500 bg-blue-100"
                    : "bg-gray-50 hover:bg-gray-100"
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
            className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your answer..."
          />
        )}

        {/* Hint Display */}
        {exercise.additionalData?.hint && (
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            💡 Hint: {exercise.additionalData.hint}
          </div>
        )}

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`rounded-lg p-4 ${
              feedback.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Submit
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
          >
            Reset
          </button>
        </div>

        {/* Progress Information */}
        <div className="text-sm text-gray-600">
          <span>Attempts: {attempts}</span>
          {feedback?.type === "success" && (
            <span className="ml-4">
              Score: {Math.max(100 - attempts * 10, 0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Icons
const PlayIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const PauseIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default AudioBased;
