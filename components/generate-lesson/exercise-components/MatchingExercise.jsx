"use client";

import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import { Bird, Turtle, Squirrel, Bug } from "lucide-react";
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
  SymbolGuide,
  SymbolGuideLabel,
  SymbolItem,
  SymbolBox,
  SymbolText,
  MatchingItem,
  MatchingWord,
  SymbolButtons,
  SymbolButton,
  FeedbackText,
} from "./styles";
import { Button } from "@/components/old-ui/button";
import { Check } from "lucide-react";

const SYMBOLS = [
  <Bird className="h-4 w-4" />,
  <Turtle className="h-4 w-4" />,
  <Squirrel className="h-4 w-4" />,
  <Bug className="h-4 w-4" />,
];

export const MatchingExercise = forwardRef(({ exercise }, ref) => {
  const [shuffledPairs, setShuffledPairs] = useState([]);
  const [selectedMatches, setSelectedMatches] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const checkAnswers = useCallback(() => {
    const correct = shuffledPairs.every((pair, index) => {
      const originalIndex = exercise.pairs.findIndex(
        (p) => p.word === pair.word,
      );
      return selectedMatches[index] === originalIndex;
    });
    return correct;
  }, [shuffledPairs, selectedMatches, exercise.pairs]);

  useImperativeHandle(
    ref,
    () => ({
      checkValidity: () => {
        const result = checkAnswers();
        setIsCorrect(result);
        return result;
      },
    }),
    [checkAnswers],
  );

  const initializeExercise = useCallback(() => {
    if (exercise?.pairs) {
      const shuffled = [...exercise.pairs].sort(() => Math.random() - 0.5);
      setShuffledPairs(shuffled);
      setSelectedMatches({});
      setSubmitted(false);
      setShowFeedback(false);
      setIsCorrect(false);
    }
  }, [exercise]);

  useEffect(() => {
    initializeExercise();
  }, [initializeExercise]);

  const handleSymbolSelect = (wordIndex, symbolIndex) => {
    if (!submitted) {
      setSelectedMatches((prev) => ({
        ...prev,
        [wordIndex]: symbolIndex,
      }));
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowFeedback(true);
    setIsCorrect(checkAnswers());
  };

  return (
    <Container $isCorrect={submitted && isCorrect}>
      <DecorativeCircleTop $isCorrect={submitted && isCorrect} />
      <DecorativeCircleBottom $isCorrect={submitted && isCorrect} />

      {submitted && isCorrect && (
        <BadgeContainer>
          <BadgeIcon>
            <Check className="h-4 w-4" />
          </BadgeIcon>
          <BadgeText>Excellent! ✨</BadgeText>
        </BadgeContainer>
      )}

      <NumberCircle $isCorrect={submitted && isCorrect}>
        {exercise.order + 1}
      </NumberCircle>

      <Content>
        <Question>{exercise.question}</Question>

        <div
          style={{
            marginTop: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <SymbolGuide>
            <SymbolGuideLabel>Symbol Guide:</SymbolGuideLabel>
            {exercise.pairs.map((pair, index) => (
              <SymbolItem key={pair.match}>
                <SymbolBox>{SYMBOLS[index]}</SymbolBox>
                <SymbolText>{pair.match}</SymbolText>
              </SymbolItem>
            ))}
          </SymbolGuide>

          <div>
            {shuffledPairs.map((pair, wordIndex) => {
              const originalIndex = exercise.pairs.findIndex(
                (p) => p.word === pair.word,
              );
              const isCorrectMatch =
                submitted && selectedMatches[wordIndex] === originalIndex;
              const isIncorrectMatch =
                submitted &&
                selectedMatches[wordIndex] !== originalIndex &&
                selectedMatches[wordIndex] !== undefined;

              return (
                <motion.div
                  key={pair.word}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: wordIndex * 0.05 }}
                >
                  <MatchingItem
                    $isCorrectMatch={isCorrectMatch}
                    $isIncorrectMatch={isIncorrectMatch}
                    $index={wordIndex}
                  >
                    <MatchingWord>{pair.word}</MatchingWord>
                    <SymbolButtons>
                      {SYMBOLS.map((symbol, symbolIndex) => {
                        const isSelected =
                          selectedMatches[wordIndex] === symbolIndex;
                        return (
                          <SymbolButton
                            key={symbolIndex}
                            onClick={() =>
                              handleSymbolSelect(wordIndex, symbolIndex)
                            }
                            $isSelected={isSelected}
                            $isSubmitted={submitted}
                            $isCorrect={symbolIndex === originalIndex}
                            disabled={submitted}
                          >
                            {symbol}
                          </SymbolButton>
                        );
                      })}
                    </SymbolButtons>
                  </MatchingItem>
                </motion.div>
              );
            })}
          </div>
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
              whileHover={
                Object.keys(selectedMatches).length >= shuffledPairs.length
                  ? { scale: 1.05 }
                  : {}
              }
              whileTap={
                Object.keys(selectedMatches).length >= shuffledPairs.length
                  ? { scale: 0.95 }
                  : {}
              }
            >
              <Button
                onClick={handleSubmit}
                disabled={
                  Object.keys(selectedMatches).length < shuffledPairs.length
                }
                size="sm"
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 500,
                  background:
                    Object.keys(selectedMatches).length < shuffledPairs.length
                      ? "#e5e7eb"
                      : "linear-gradient(to right, #6366f1, #9333ea)",
                  color:
                    Object.keys(selectedMatches).length < shuffledPairs.length
                      ? "#9ca3af"
                      : "#ffffff",
                  cursor:
                    Object.keys(selectedMatches).length < shuffledPairs.length
                      ? "not-allowed"
                      : "pointer",
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
                  onClick={initializeExercise}
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

        {showFeedback && isCorrect && exercise.feedback && (
          <FeedbackText>{exercise.feedback}</FeedbackText>
        )}
      </Content>
    </Container>
  );
});

MatchingExercise.displayName = "MatchingExercise";
