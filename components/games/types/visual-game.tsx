// components/games/types/VisualGame.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

export default function VisualGame({ gameData, timeLeft, score, setScore, onGameOver }: any) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (gameData?.gameData) {
      const prepared = shuffleArray(gameData.gameData).map((q) => ({
        ...q,
        choices: shuffleArray(q.choices),
      }));
      setQuestions(prepared);
    }
  }, [gameData]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (choice: string) => {
    if (choice === currentQuestion.answer) {
      setScore((prev: number) => prev + 10);
      setStreak((prev: number) => prev + 1);
    } else {
      setStreak(0);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onGameOver(); // Game finished early
    }
  };

  if (!currentQuestion) return <div>Loading...</div>;

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-6">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Question {currentIndex + 1}</CardTitle>
          <CardDescription>
            Time Left: {timeLeft}s | Score: {score} | Streak: {streak}x
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative h-64 w-full"
            >
              <Image
                src={currentQuestion.imageUrl || "/default-image.jpg"}
                alt="Prompt"
                fill
                className="rounded-lg object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {currentQuestion.choices.map((choice: string, i: number) => (
              <Button key={i} variant="outline" onClick={() => handleAnswer(choice)}>
                {choice}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}