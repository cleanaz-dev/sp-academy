"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/old-ui/card";
import { Button } from "@/components/old-ui/button";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";
import { Crown } from "lucide-react";
import { toast } from "sonner";

// Helper function to shuffle an array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function GamePlayVisualGame({ gameData }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [shuffledGameData, setShuffledGameData] = useState([]);
  const [sounds, setSounds] = useState(gameData.GameSoundEffects);
  const [countdown, setCountdown] = useState(3); // 5-second countdown
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [submittingScore, setSubmittingScore] = useState(false);
  const { play, preload } = useAudio();

  // Load custom sounds when available
  useEffect(() => {
    if (gameData.soundEffects) {
      setSounds({
        ...DEFAULT_SOUNDS,
        ...gameData.soundEffects,
      });
    }
  }, [gameData]);

  // Start countdown when game is initiated
  useEffect(() => {
    if (countdown > 0 && gameStarted) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0 && gameStarted) {
      // Start the game after countdown
      setTimeLeft(60); // Reset game timer
      setCurrentQuestionIndex(0); // Start from the first question
    }
  }, [countdown, gameStarted]);

  // Shuffle questions and choices when the game starts
  useEffect(() => {
    if (gameStarted && gameData?.gameData?.length > 0 && countdown === 0) {
      const shuffledQuestions = shuffleArray([...gameData.gameData]);
      const fullyShuffled = shuffledQuestions.map((question) => {
        const choices = shuffleArray([...question.choices]);
        const correctAnswerIndex = choices.indexOf(question.answer);
        return { ...question, choices, correctAnswerIndex };
      });
      setShuffledGameData(fullyShuffled);
    }
  }, [gameStarted, gameData, countdown]);

  // Timer logic
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && countdown === 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [gameStarted, timeLeft, countdown]);

  // Handle answer selection
  const handleAnswer = (selectedAnswer) => {
    const currentQuestion = shuffledGameData[currentQuestionIndex];
    if (!currentQuestion) return; // Guard clause

    if (selectedAnswer === currentQuestion.answer) {
      // Player answered correctly
      setConsecutiveCorrect((prev) => prev + 1); // Increase consecutive correct count
      setScore((prev) => prev + 10); // Add base points

      // If the player has gotten 3 correct answers in a row, apply streak bonus and sound
      if (consecutiveCorrect + 1 >= 3) {
        setStreak((prev) => prev + 1); // Increase streak
        play(sounds[0].streakStart); // Play streak sound
      } else {
        play(sounds[0].correctAnswer); // Play regular correct answer sound
      }
    } else {
      // Player answered incorrectly
      setConsecutiveCorrect(0); // Reset consecutive correct count
      setStreak(0); // Reset streak
      play(sounds[0].wrongAnswer); // Play wrong answer sound
    }

    // Move to next question
    if (currentQuestionIndex < shuffledGameData.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setGameOver(true); // End game if no more questions
    }
  };

  // Start game (initiates countdown)
  const startGame = () => {
    setGameOver(false);
    play(sounds[0].gameStart);
    setScore(0);
    setStreak(0);
    setGameStarted(true);
    setCountdown(3);
    setConsecutiveCorrect(0); // Start 5-second countdown
  };

  const handleSubmitScore = async () => {
    if (!gameData?.id) {
      toast.error("Game ID is missing. Cannot submit score.");
      return;
    }

    setSubmittingScore(true);
    try {
      const response = await fetch("/api/games/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: gameData.id, score }),
      });

      const data = await response.json(); // Parse JSON response

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit score");
      }

      toast.success("Score submitted successfully!");
    } catch (error) {
      console.error("Failed to submit score:", error);
      toast.error(error.message);
    } finally {
      setSubmittingScore(false);
    }
  };

  // Render countdown screen
  if (gameStarted && countdown > 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <h1 className="text-6xl font-bold">{countdown}</h1>
        <p className="text-xl">Get ready!</p>
      </div>
    );
  }

  // Render game over screen
  if (gameOver) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-bold">Game Over!</h1>
        <p className="text-2xl">Your Score: {score}</p>
        <Button onClick={startGame}>Play Again</Button>
        <Button
          onClick={handleSubmitScore}
          className="bg-amber-400 transition-all duration-500 hover:scale-105 hover:bg-emerald-400"
        >
          <Crown className="mr-2" />{" "}
          {submittingScore ? "Submitting..." : "Submit Score"}
        </Button>
      </div>
    );
  }

  // Render start screen
  if (!gameStarted) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-bold">
          {gameData?.title || "Game Title"}
        </h1>
        <p className="text-xl">{gameData?.description || "Game Description"}</p>
        <Button onClick={startGame}>Start Game</Button>
      </div>
    );
  }

  // Render current question
  const currentQuestion = shuffledGameData[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-6">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Question {currentQuestionIndex + 1}
          </CardTitle>
          <CardDescription>
            Time Left: {timeLeft}s | Score: {score} | Streak: {streak}x
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={currentQuestion.imageUrl || "/default-image.jpg"}
                  alt={`Visual prompt for ${currentQuestion.answer}`}
                  fill
                  className="rounded-lg object-cover"
                  priority
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Choices with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              {currentQuestion.choices.map((choice, i) => (
                <Button
                  key={`choice-${i}`}
                  variant="outline"
                  className="h-12 w-full text-lg"
                  onClick={() => handleAnswer(choice)}
                >
                  {choice}
                </Button>
              ))}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
