// AudioExercise.jsx - Updated version
"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Play, Volume2 } from "lucide-react";
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
  AudioButton,
  OptionButton,
  FeedbackText,
} from "./styles";

export const AudioExercise = forwardRef(({ exercise }, ref) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [synth, setSynth] = useState(null);
  const [utterance, setUtterance] = useState(null);

  const correctAnswer = parseInt(exercise.correctAnswer);

  useImperativeHandle(ref, () => ({
    checkValidity: () => selectedAnswer === correctAnswer,
  }));

  useEffect(() => {
    setSelectedAnswer(null);
    setSubmitted(false);
    setIsSpeaking(false);
    return () => {
      if (synth) synth.cancel();
    };
  }, [exercise.id]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(exercise.audioScript);
      utterance.lang = "fr-FR";
      setSynth(synth);
      setUtterance(utterance);
    }
  }, [exercise.audioScript]);

  const handleSpeak = () => {
    if (synth && utterance) {
      synth.speak(utterance);
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
    }
  };

  const handleAnswerSelect = (index) => {
    if (!submitted) setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null) setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setSubmitted(false);
  };

  const isCorrect = selectedAnswer === correctAnswer;

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

        <div
          style={{
            marginBottom: "12px",
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <motion.div
            whileHover={
              !(isSpeaking || (submitted && isCorrect)) ? { scale: 1.03 } : {}
            }
            whileTap={
              !(isSpeaking || (submitted && isCorrect)) ? { scale: 0.97 } : {}
            }
          >
            <AudioButton
              onClick={handleSpeak}
              disabled={isSpeaking || (submitted && isCorrect)}
              $isDisabled={isSpeaking}
              $isCorrect={submitted && isCorrect}
              aria-label="Play question audio"
            >
              {isSpeaking ? (
                <>
                  <Volume2 className="h-5 w-5 animate-pulse" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Listen to Audio</span>
                </>
              )}
            </AudioButton>
          </motion.div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {exercise.multipleChoice.map((option, index) => (
            <motion.div
              key={index}
              whileHover={!submitted ? { scale: 1.01, x: 3 } : {}}
            >
              <OptionButton
                onClick={() => handleAnswerSelect(index)}
                $isSubmitted={submitted}
                $isCorrect={index === correctAnswer}
                $isSelected={selectedAnswer === index}
                disabled={submitted}
              >
                {option}
              </OptionButton>
            </motion.div>
          ))}
        </div>

        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {!submitted ? (
            <motion.div
              whileHover={selectedAnswer !== null ? { scale: 1.05 } : {}}
              whileTap={selectedAnswer !== null ? { scale: 0.95 } : {}}
            >
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                size="sm"
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 500,
                  background:
                    selectedAnswer === null
                      ? "#e5e7eb"
                      : "linear-gradient(to right, #6366f1, #9333ea)",
                  color: selectedAnswer === null ? "#9ca3af" : "#ffffff",
                  cursor: selectedAnswer === null ? "not-allowed" : "pointer",
                }}
              >
                Check
              </Button>
            </motion.div>
          ) : (
            !isCorrect && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleReset}
                  size="sm"
                  style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 500,
                    background: "linear-gradient(to right, #3b82f6, #14b8a6)",
                    color: "#ffffff",
                  }}
                >
                  Try Again
                </Button>
              </motion.div>
            )
          )}
        </div>

        {submitted && (
          <FeedbackText>
            {isCorrect
              ? exercise.feedback.correct
              : exercise.feedback.incorrect}
          </FeedbackText>
        )}
      </Content>
    </Container>
  );
});

AudioExercise.displayName = "AudioExercise";
