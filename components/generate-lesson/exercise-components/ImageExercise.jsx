"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, X } from "lucide-react";
import {
  Container,
  DecorativeCircleTop,
  DecorativeCircleBottom,
  BadgeContainer,
  BadgeIcon,
  BadgeText,
  NumberCircle,
  Content,
  Question,
  ImageContainer,
  ImageWrapper,
  ImageCaption,
  Form,
  InputWrapper,
  Input,
  Spinner,
  ErrorMessage,
  ButtonWrapper,
  ResultContainer,
  ResultHeader,
  ResultFeedback,
} from "./styles"; // Adjust path based on your file structure

export const ImageExercise = forwardRef(({ exercise, isCompleted }, ref) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useImperativeHandle(ref, () => ({
    checkValidity: () => result?.score >= 0.8,
  }));

  const checkAnswer = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAnswer,
          correctAnswer: exercise.correctAnswer,
          context: exercise.correctAnswer,
          instructions:
            "Evaluate the French greeting considering grammar, vocabulary, and cultural context.",
        }),
      });
      if (!response.ok) throw new Error("Evaluation failed");
      const evaluation = await response.json();
      setResult(evaluation.result);
    } catch (err) {
      setError(err.message || "Failed to evaluate answer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    await checkAnswer();
  };

  const isCorrect = result && result.score >= 0.8;

  return (
    <Container $isCorrect={isCorrect}>
      <DecorativeCircleTop $isCorrect={isCorrect} />
      <DecorativeCircleBottom $isCorrect={isCorrect} />

      {result && isCorrect && (
        <BadgeContainer>
          <BadgeIcon>
            <Check className="h-4 w-4" />
          </BadgeIcon>
          <BadgeText>Excellent! 🎉</BadgeText>
        </BadgeContainer>
      )}

      <NumberCircle $isCorrect={isCorrect}>{exercise.order + 1}</NumberCircle>

      <Content>
        <Question>{exercise.question}</Question>

        <ImageContainer>
          <ImageWrapper>
            <Image
              src="https://placehold.co/400"
              alt={exercise.title}
              width={300}
              height={200}
              className="h-auto w-full rounded-full object-cover"
              unoptimized
              priority
            />
          </ImageWrapper>
          <ImageCaption>{exercise.image_prompt}</ImageCaption>
        </ImageContainer>

        <Form onSubmit={handleSubmit}>
          <InputWrapper>
            <Input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your French greeting here..."
              disabled={isLoading || (result && isCorrect)}
            />
            {isLoading && (
              <Spinner>
                <svg
                  className="h-4 w-4 animate-spin text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </Spinner>
            )}
          </InputWrapper>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ButtonWrapper>
            <Button
              type="submit"
              disabled={
                isLoading || !userAnswer.trim() || (result && isCorrect)
              }
              className={isLoading || (result && isCorrect) ? "opacity-70" : ""}
              size="sm"
              style={{
                padding: "4px 12px",
                height: "32px",
                fontSize: "12px",
                fontWeight: 500,
                background: "linear-gradient(to right, #6366f1, #9333ea)",
                color: "#ffffff",
              }}
            >
              {isLoading ? "Analyzing..." : "Check"}
            </Button>
          </ButtonWrapper>
        </Form>

        {result && (
          <ResultContainer $score={result.score}>
            <ResultHeader>
              {result.score >= 0.8 ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : result.score >= 0.5 ? (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span>
                {result.score >= 0.8
                  ? "Excellent!"
                  : result.score >= 0.5
                    ? "Almost There!"
                    : "Needs Improvement"}
              </span>
            </ResultHeader>
            <ResultFeedback>{result.feedback}</ResultFeedback>
          </ResultContainer>
        )}
      </Content>
    </Container>
  );
});
