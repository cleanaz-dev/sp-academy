"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { deburr } from "lodash";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
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
  SentenceContainer,
  SentencePart,
  SelectWrapper,
  Select,
  SelectArrow,
  FeedbackText,
} from "./styles";

export const FillInTheBlankExercise = forwardRef(({ exercise }, ref) => {
  const correctAnswers = Array.isArray(exercise.correctAnswer)
    ? exercise.correctAnswer.map((answer) =>
        deburr(answer.trim().toLowerCase()),
      )
    : JSON.parse(exercise.correctAnswer).map((answer) =>
        deburr(answer.trim().toLowerCase()),
      );

  const options = Array.isArray(exercise.options)
    ? exercise.options
    : JSON.parse(exercise.options || "[]");

  const [userAnswers, setUserAnswers] = useState(
    Array(correctAnswers.length).fill(""),
  );
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [inputErrors, setInputErrors] = useState([]);

  const validateAnswers = () => {
    const errors = userAnswers.map((answer, index) => {
      const normalizedUserInput = deburr(answer.trim().toLowerCase());
      const normalizedCorrectAnswer = deburr(
        correctAnswers[index].trim().toLowerCase(),
      );
      return normalizedUserInput !== normalizedCorrectAnswer;
    });
    const correct = errors.every((error) => !error);
    return { errors, correct };
  };

  useImperativeHandle(ref, () => ({
    checkValidity: () => {
      const { errors, correct } = validateAnswers();
      setInputErrors(errors);
      setIsCorrect(correct);
      return correct;
    },
  }));

  const parsedSentences = exercise.sentences.map((sentence) => {
    const match = sentence.match(/(.*)\[___\](.*)/);
    return {
      before: match?.[1]?.trim() || "",
      after: match?.[2]?.trim() || "",
    };
  });

  const handleInputChange = (index, value) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    const { errors, correct } = validateAnswers();
    setInputErrors(errors);
    setIsCorrect(correct);
    setSubmitted(true);
  };

  return (
    <Container $isCorrect={submitted && isCorrect} ref={ref}>
      <DecorativeCircleTop $isCorrect={submitted && isCorrect} />
      <DecorativeCircleBottom $isCorrect={submitted && isCorrect} />

      {submitted && isCorrect && (
        <BadgeContainer>
          <BadgeIcon>
            <Check className="h-4 w-4" />
          </BadgeIcon>
          <BadgeText>Correct! 🎉</BadgeText>
        </BadgeContainer>
      )}

      <NumberCircle $isCorrect={submitted && isCorrect}>
        {exercise.order + 1}
      </NumberCircle>

      <Content>
        <Question>{exercise.question}</Question>

        <div style={{ paddingLeft: "32px" }}>
          {parsedSentences.map((sentence, index) => (
            <SentenceContainer key={index}>
              <SentencePart>{sentence.before}</SentencePart>
              <SelectWrapper>
                <Select
                  value={userAnswers[index]}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  $isSubmitted={submitted}
                  $hasError={submitted && inputErrors[index]}
                  disabled={submitted && isCorrect}
                >
                  <option value="">Choose...</option>
                  {options[index]?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
                <SelectArrow>
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </SelectArrow>
              </SelectWrapper>
              <SentencePart>{sentence.after}</SentencePart>
            </SentenceContainer>
          ))}
        </div>

        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            paddingLeft: "32px",
          }}
        >
          {!submitted || !isCorrect ? (
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={userAnswers.every((answer) => answer === "")}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 500,
                background: userAnswers.every((answer) => answer === "")
                  ? "#e5e7eb"
                  : "linear-gradient(to right, #6366f1, #9333ea)",
                color: userAnswers.every((answer) => answer === "")
                  ? "#9ca3af"
                  : "#ffffff",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                cursor: userAnswers.every((answer) => answer === "")
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              Check
            </Button>
          ) : null}
        </div>

        {submitted && isCorrect && exercise.feedback && (
          <FeedbackText>{exercise.feedback}</FeedbackText>
        )}
      </Content>
    </Container>
  );
});

FillInTheBlankExercise.displayName = "FillInTheBlankExercise";
