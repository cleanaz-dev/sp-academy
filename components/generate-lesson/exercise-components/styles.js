// styles.js
import styled from "styled-components";
import React from "react";

export const Container = styled(
  React.forwardRef(({ $isCorrect, ...props }, ref) => (
    <div ref={ref} {...props} />
  )),
)`
  position: relative;
  padding: 12px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid ${({ $isCorrect }) => ($isCorrect ? "#86efac" : "#e0e7ff")};
  background: ${({ $isCorrect }) =>
    $isCorrect
      ? "linear-gradient(to bottom right, #f0fdf4, #ffffff)"
      : "linear-gradient(to bottom right, #eff6ff, #ffffff)"};
`;

// Rest of your styles remain unchanged
export const DecorativeCircleTop = styled.div`
  position: absolute;
  top: -24px;
  right: -24px;
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  opacity: 0.3;
  background-color: ${({ $isCorrect }) => ($isCorrect ? "#bbf7d0" : "#c7d2fe")};
`;

export const DecorativeCircleBottom = styled.div`
  position: absolute;
  bottom: -16px;
  left: -16px;
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  opacity: 0.2;
  background-color: ${({ $isCorrect }) => ($isCorrect ? "#bbf7d0" : "#c7d2fe")};
`;

export const BadgeContainer = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
`;

export const BadgeIcon = styled.div`
  background-color: #dcfce7;
  color: #16a34a;
  border-radius: 9999px;
  padding: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

export const BadgeText = styled.div`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 9999px;
  font-weight: 500;
  background-color: #dcfce7;
  color: #15803d;
  animation: fadeIn 0.2s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const NumberCircle = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  background: ${({ $isCorrect }) =>
    $isCorrect
      ? "linear-gradient(to right, #22c55e, rgba(16, 185, 129, 0.6))"
      : "linear-gradient(to right, #6366f1, #9333ea)"};
`;

export const Content = styled.div`
  position: relative;
  z-index: 10;
  padding-top: 32px;
`;

export const Question = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 12px;
`;

export const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
`;

export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
`;

export const ImageCaption = styled.p`
  margin-top: 6px;
  font-size: 12px;
  color: #4b5563;
  font-style: italic;
  text-align: center;
  padding-left: 8px;
  padding-right: 8px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const InputWrapper = styled.div`
  position: relative;
`;

export const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  outline: none;
  background: rgba(255, 255, 255, 0.9);

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 1px #6366f1;
  }
`;

export const Spinner = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
`;

export const ErrorMessage = styled.div`
  padding: 8px;
  font-size: 12px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 6px;
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
`;

export const ResultContainer = styled.div`
  margin-top: 12px;
  padding: 8px;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid;
  animation: fadeIn 0.2s ease-in;
  ${({ $score }) =>
    $score >= 0.8
      ? `
        background-color: rgba(220, 252, 231, 0.7);
        border-color: #bbf7d0;
        color: #15803d;
      `
      : $score >= 0.5
        ? `
        background-color: rgba(254, 243, 199, 0.7);
        border-color: #fde68a;
        color: #b45309;
      `
        : `
        background-color: rgba(254, 242, 242, 0.7);
        border-color: #fecaca;
        color: #b91c1c;
      `}

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
`;

export const ResultFeedback = styled.p`
  margin-top: 4px;
  font-size: 12px;
`;

export const AudioButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 140px;
  height: 36px;
  transition: all 200ms;
  ${({ $isDisabled, $isCorrect }) =>
    $isCorrect
      ? `
        background: linear-gradient(to right, #22c55e, #10b981);
        color: #ffffff;
        opacity: 0.8;
      `
      : $isDisabled
        ? `
        background-color: #f3f4f6;
        color: #9ca3af;
        border: 1px solid #e5e7eb;
      `
        : `
        background: linear-gradient(to right, #8b5cf6, #4f46e5);
        color: #ffffff;
        &:hover { opacity: 0.95; }
      `}
`;

export const OptionButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  border-radius: 6px;
  font-size: 14px;
  transition: all 200ms;
  ${({ $isSubmitted, $isCorrect, $isSelected }) =>
    $isSubmitted
      ? $isCorrect
        ? `
          border: 2px solid #86efac;
          background-color: rgba(220, 252, 231, 0.5);
          color: #15803d;
        `
        : $isSelected
          ? `
          border: 2px solid #f87171;
          background-color: rgba(254, 242, 242, 0.5);
          color: #b91c1c;
        `
          : `
          border: 1px solid #e5e7eb;
          background-color: #ffffff;
          opacity: 0.6;
        `
      : $isSelected
        ? `
        border: 2px solid #6366f1;
        background-color: rgba(224, 231, 255, 0.7);
      `
        : `
        border: 1px solid #e5e7eb;
        background-color: #ffffff;
        &:hover { background-color: #f9fafb; }
      `}
`;

export const FeedbackText = styled.div`
  margin-top: 8px;
  font-size: 12px;
  font-style: italic;
  color: #4b5563;
  background: rgba(255, 255, 255, 0.8);
  border-left: 2px solid #c7d2fe;
  padding: 4px 8px;
  border-radius: 0 4px 4px 0;
  animation: fadeIn 0.2s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const SymbolGuide = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e0e7ff;
  border-radius: 6px;
  padding: 6px;
  margin-bottom: 8px;
`;

export const SymbolGuideLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-right: 4px;
`;

export const SymbolItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(129, 140, 248, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
`;

export const SymbolBox = styled.span`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #c7d2fe;
  border-radius: 4px;
  color: #4f46e5;
  font-weight: 700;
  font-size: 14px;
`;

export const SymbolText = styled.span`
  font-size: 12px;
  color: #4b5563;
`;

export const MatchingItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid;
  margin-bottom: 4px; /* Adds vertical space between items */
  transition:
    background-color 300ms,
    border-color 300ms;
  ${({ $isCorrectMatch, $isIncorrectMatch, $index }) =>
    $isCorrectMatch
      ? `
        background-color: #f0fdf4;
        border-color: #bbf7d0;
      `
      : $isIncorrectMatch
        ? `
        background-color: #fef2f2;
        border-color: #fecaca;
      `
        : `
        background-color: ${$index % 2 === 0 ? "#ffffff" : "#f9fafb"};
        border-color: #e5e7eb;
      `}
`;

export const MatchingWord = styled.span`
  font-weight: 500;
  font-size: 14px;
  color: #374151;
  flex: 1;
`;

export const SymbolButtons = styled.div`
  display: flex;
  gap: 4px;
`;

export const SymbolButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  border-radius: 6px;
  background-color: ${({ $isSelected, $isSubmitted, $isCorrect }) =>
    $isSubmitted
      ? $isCorrect
        ? "#dcfce7"
        : $isSelected
          ? "#fee2e2"
          : "#f3f4f6"
      : $isSelected
        ? "#e0e7ff"
        : "#ffffff"};
  border-color: ${({ $isSelected, $isSubmitted, $isCorrect }) =>
    $isSubmitted
      ? $isCorrect
        ? "#86efac"
        : $isSelected
          ? "#f87171"
          : "#d1d5db"
      : $isSelected
        ? "#6366f1"
        : "#d1d5db"};
  color: ${({ $isSelected, $isSubmitted, $isCorrect }) =>
    $isSubmitted
      ? $isCorrect
        ? "#16a34a"
        : $isSelected
          ? "#dc2626"
          : "#9ca3af"
      : $isSelected
        ? "#4f46e5"
        : "#000000"};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 200ms;
  ${({ $isSubmitted, $isSelected }) =>
    !$isSubmitted && !$isSelected
      ? "cursor: pointer; &:hover { transform: scale(1.1); }"
      : ""}
`;

export const SentenceContainer = styled.div`
  margin: 8px 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

export const SentencePart = styled.span`
  font-size: 14px;
`;

export const SelectWrapper = styled.div`
  position: relative;
  display: inline-block;
  margin: 0 4px;
`;

export const Select = styled.select`
  padding: 4px 8px;
  font-size: 14px;
  width: 112px;
  border: 2px solid;
  border-radius: 6px;
  outline: none;
  background: #ffffff;
  appearance: none;
  ${({ $isSubmitted, $hasError }) =>
    $isSubmitted && $hasError
      ? `
        border-color: #f87171;
        background-color: #fee2e2;
      `
      : $isSubmitted && !$hasError
        ? `
        border-color: #86efac;
        background-color: #f0fdf4;
      `
        : `
        border-color: #c7d2fe;
        &:hover { border-color: #a5b4fc; }
     `}
  transition: all 200ms;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 1px #6366f1;
  }
`;

export const SelectArrow = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 8px;
  color: #9ca3af;
  pointer-events: none;
`;

export const VerbSceneContainer = styled(
  React.forwardRef((props, ref) => <div ref={ref} {...props} />),
)`
  position: relative;
  padding: 12px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e0e7ff;
  background: linear-gradient(to bottom right, #eff6ff, #ffffff);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const SlotContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
`;

export const Slot = styled.div`
  flex: 1;
  min-width: 0;
  height: 50px;
  border: 2px solid
    ${({ $isCorrect, $isOver }) =>
      $isCorrect
        ? "#37D67A" // Bright green border for correct answers
        : $isOver
          ? "#4dabf7"
          : "#e0e0e0"};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $isOver, $isFilled, $isCorrect }) =>
    $isCorrect
      ? "linear-gradient(135deg, #B4F8C8 0%, #5EEB92 100%)" // Brighter neon green gradient
      : $isOver
        ? "#f1f8ff"
        : $isFilled
          ? "#f8f9fa"
          : "#ffffff"};
  box-shadow: ${({ $isOver, $isCorrect }) =>
    $isCorrect
      ? "0 4px 12px rgba(94, 235, 146, 0.6)" // Stronger glow for correct answer
      : $isOver
        ? "0 2px 8px rgba(77, 171, 247, 0.2)"
        : "0 1px 4px rgba(0, 0, 0, 0.05)"};
  transition: all 0.2s ease;
  cursor: ${({ $isOver }) => ($isOver ? "pointer" : "default")};
  color: ${({ $isCorrect }) =>
    $isCorrect ? "#087F5B" : "inherit"}; // Bright green text for contrast
`;

export const WordButton = styled.button`
  padding: 4px 16px;
  border-radius: 4px;
  border: none;
  background-color: #f0f0f0;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease,
    box-shadow 0.2s ease;
  &:hover {
    background-color: #e0e0e0;
  }
  &:active {
    background-color: #d0d0d0;
  }
`;

export const WordsArea = styled.div`
  display: flex;
  gap: 12px; /* Matches Form gap */
  flex-wrap: wrap;
  padding: 12px;
  border-radius: 6px; /* Matches other containers */
  min-height: 70px;
  border: 2px dashed #e5e7eb; /* Matches Input border */
  background: rgba(249, 250, 251, 0.9); /* Subtle gradient-like effect */
  margin-top: 12px; /* Consistent spacing */
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
`;

export const RemoveButton = styled.button`
  padding: 2px 6px;
  background: transparent;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px; /* Matches other small text */
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms ease; /* Matches other transitions */
  margin-left: 2px; /* Matches gap in other components */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background: #ff6b6b;
    color: white;
  }
`;
