// components/games/types/ImageDescribeGame.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useSpeech } from "@/context/speech-context"; // Adjust path to your context
import { evaluateSpeechTranscript } from "@/lib/game-templates/score-speech";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, CheckCircle2 } from "lucide-react";
import Image from "next/image";

const QUESTION_TIME_LIMIT = 5; // 5 seconds per image

export default function ImageDescribeGame({
  gameData,
  score,
  setScore,
  onGameOver,
}: {
  gameData: any;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  onGameOver: () => void;
}) {
  const { isRecording, transcript, startRecording, stopRecording, resetSpeechState } = useSpeech();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [turnTimeLeft, setTurnTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const questions = gameData?.gameData || [];
  const currentQuestion = questions[currentIndex];

  const isTransitioningRef = useRef(false);

  // 1. Start Mic when a new image loads
  useEffect(() => {
    if (!currentQuestion) return;

    resetSpeechState();
    setMatchedKeywords([]);
    setTurnTimeLeft(QUESTION_TIME_LIMIT);
    isTransitioningRef.current = false;

    // Start recording audio for this turn
    startRecording();

    return () => {
      stopRecording();
    };
  }, [currentIndex]);

  // 2. 5-second Turn Timer Logic
  useEffect(() => {
    if (turnTimeLeft <= 0) {
      handleTurnEnd();
      return;
    }

    const timer = setInterval(() => {
      setTurnTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [turnTimeLeft]);

  // 3. Live keyword matching while the user speaks
  useEffect(() => {
    if (transcript && currentQuestion) {
      const result = evaluateSpeechTranscript(transcript, currentQuestion.targetKeywords);
      setMatchedKeywords(result.matchedKeywords);
    }
  }, [transcript, currentQuestion]);

  // 4. Handle End of Turn (When timer hits 0 or user clicks next)
  const handleTurnEnd = async () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    // Stop mic
    await stopRecording();

    // Calculate final score for this image
    const result = evaluateSpeechTranscript(transcript, currentQuestion.targetKeywords);
    setScore((prev) => prev + result.score);

    // Advance to next image or end game
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onGameOver();
    }
  };

  if (!currentQuestion) return <div>Loading questions...</div>;

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-between">
            <span>Image {currentIndex + 1} of {questions.length}</span>
            <span className="text-2xl font-bold text-red-500">
              ⏱️ {turnTimeLeft}s
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Image Prompt */}
          <div className="relative h-64 w-full overflow-hidden rounded-lg border">
            <Image
              src={currentQuestion.imageUrl}
              alt="Describe this image"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Recording Status & Live Transcript */}
          <div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
            <div className="flex items-center justify-between text-sm font-semibold mb-2">
              <span className="flex items-center gap-2">
                {isRecording ? (
                  <Mic className="h-5 w-5 animate-pulse text-red-500" />
                ) : (
                  <MicOff className="h-5 w-5 text-gray-400" />
                )}
                {isRecording ? "Listening..." : "Microphone Off"}
              </span>
              <span>Overall Score: {score}</span>
            </div>

            {/* Display Spoken Text */}
            <p className="min-h-[48px] text-lg italic text-slate-700 dark:text-slate-200">
              {transcript || 'Speak now! e.g., "I see a cute dog on the grass"'}
            </p>
          </div>

          {/* Matched Keywords Feedback */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Detected Keywords:</p>
            <div className="flex flex-wrap gap-2">
              {matchedKeywords.length > 0 ? (
                matchedKeywords.map((word, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800"
                  >
                    <CheckCircle2 className="h-3 w-3" /> {word} (+10 pts)
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">No target keywords matched yet...</span>
              )}
            </div>
          </div>

          <Button onClick={handleTurnEnd} className="w-full">
            Done Speaking / Next Image
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}