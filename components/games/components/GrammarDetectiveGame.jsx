"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/old-ui/button";
import { useAudio } from "@/hooks/useAudioRecorder";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/old-ui/card";

export default function GrammarDetectiveGame({ gameData }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const { play } = useAudio();

  // Timer logic
  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [gameStarted, timeLeft]);

  // Handle answer selection
  const handleAnswer = (selectedAnswerIndex) => {
    const currentQuestion = gameData[currentQuestionIndex];
    if (selectedAnswerIndex === currentQuestion.correctAnswerIndex) {
      setScore((prev) => prev + 10); // Award 10 points for correct answers
      play("/sounds/correct.mp3"); // Play correct sound
    } else {
      play("/sounds/wrong.mp3"); // Play wrong sound
    }

    // Move to next question
    if (currentQuestionIndex < gameData.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setGameOver(true); // End game if no more questions
    }
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(60);
    setScore(0);
    setCurrentQuestionIndex(0);
    setGameOver(false);
  };

  // Render game over screen
  if (gameOver) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-bold">Game Over!</h1>
        <p className="text-2xl">Your Score: {score}</p>
        <Button onClick={startGame}>Play Again</Button>
      </div>
    );
  }

  // Render start screen
  if (!gameStarted) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-bold">Grammar Detective</h1>
        <p className="text-xl">
          Correct as many sentences as you can in 60 seconds!
        </p>
        <Button onClick={startGame}>Start Game</Button>
      </div>
    );
  }

  // Render current question
  const currentQuestion = gameData[currentQuestionIndex];
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-6">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Question {currentQuestionIndex + 1}
          </CardTitle>
          <CardDescription>
            Time Left: {timeLeft}s | Score: {score}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Incorrect Sentence */}
          <p className="text-lg font-semibold text-red-600">
            {currentQuestion.incorrect}
          </p>

          {/* Choices */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {currentQuestion.choices.map((choice, i) => (
              <Button
                key={i}
                variant="outline"
                className="h-12 w-full text-lg"
                onClick={() => handleAnswer(i)}
              >
                {choice}
              </Button>
            ))}
          </div>

          {/* Explanation (shown after answer) */}
          {gameOver && (
            <div className="mt-4 rounded-lg bg-gray-100 p-4">
              <p className="text-sm text-gray-700">
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
