"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";
import { Check, CheckCircle } from "lucide-react";
import { deburr } from "lodash";
import { Button } from "@/components/old-ui/button";
import * as S from "./styles";

const getItems = (words) =>
  words.map((word, i) => ({ id: `word-${i}`, content: word }));

const DraggableWord = ({
  id,
  content,
  inSlot = false,
  slotIndex = null,
  isCorrect = false,
  submitted = false,
  disabled = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { content, slotIndex, inSlot },
      disabled: disabled || (submitted && isCorrect),
    });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    visibility: isDragging ? "hidden" : "visible",
  };

  const dragProps =
    submitted && isCorrect ? {} : { ...listeners, ...attributes };

  return (
    <S.WordButton ref={setNodeRef} style={style} {...dragProps}>
      {content}
    </S.WordButton>
  );
};

const DroppableSlot = ({
  index,
  word,
  placeholder,
  onRemove,
  isCorrect,
  submitted,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${index}`,
  });

  return (
    <S.Slot
      ref={setNodeRef}
      $isOver={isOver}
      $isFilled={word !== null}
      $isCorrect={submitted && isCorrect} // Reflect correctness only after submission
    >
      {word ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <DraggableWord
            id={`slot-word-${index}`}
            content={word}
            inSlot={true}
            slotIndex={index}
            isCorrect={isCorrect}
            submitted={submitted}
          />
          {submitted && isCorrect ? (
            <CheckCircle size={18} color="#087F5B" />
          ) : submitted ? (
            <S.RemoveButton onClick={() => onRemove(index)}>×</S.RemoveButton>
          ) : null}
        </div>
      ) : (
        placeholder
      )}
    </S.Slot>
  );
};

export const VerbSceneIllustrator = forwardRef(({ exercise }, ref) => {
  const {
    scrambledWords,
    correctAnswer,
    slots: slotPlaceholders,
    question,
    feedback,
    order,
  } = exercise;
  const initialWords = getItems(scrambledWords);
  const [slots, setSlots] = useState(Array(slotPlaceholders.length).fill(null));
  const [availableWords, setAvailableWords] = useState(initialWords);
  const [draggingWord, setDraggingWord] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const normalizeString = (str) => deburr(str?.trim().toLowerCase() || "");

  const validateAnswers = () => {
    const correct = slots.every(
      (word, index) =>
        normalizeString(word) === normalizeString(correctAnswer[index]),
    );
    return correct;
  };

  useImperativeHandle(ref, () => ({
    checkValidity: () => {
      const correct = validateAnswers();
      setIsCorrect(correct);
      setSubmitted(true);
      return correct;
    },
  }));

  const handleRemove = (slotIndex) => {
    if (submitted && isCorrect) return;
    setSlots((prevSlots) => {
      const newSlots = [...prevSlots];
      const removedWord = newSlots[slotIndex];
      newSlots[slotIndex] = null;

      if (removedWord) {
        setAvailableWords((prevWords) => {
          const wordExists = prevWords.some(
            (word) => word.content === removedWord,
          );
          if (!wordExists) {
            return [
              ...prevWords,
              {
                id: `returned-${Date.now()}-${slotIndex}`,
                content: removedWord,
              },
            ];
          }
          return prevWords;
        });
      }
      return newSlots;
    });
    setSubmitted(false);
  };

  const handleDragStart = (event) => {
    setDraggingWord(event.active.data.current?.content || null);
  };

  const handleDragEnd = (event) => {
    if (submitted && isCorrect) return;
    setDraggingWord(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    const activeData = active.data.current;

    if (
      (activeId.startsWith("word-") || activeId.startsWith("returned-")) &&
      overId.startsWith("slot-")
    ) {
      const slotIndex = parseInt(overId.split("-")[1]);
      const newSlots = [...slots];
      const existingWord = newSlots[slotIndex];
      newSlots[slotIndex] = activeData.content;

      setSlots(newSlots);
      setAvailableWords((prevWords) =>
        prevWords.filter((word) => word.id !== activeId),
      );

      if (existingWord) {
        setAvailableWords((prevWords) => {
          const wordExists = prevWords.some(
            (word) => word.content === existingWord,
          );
          if (!wordExists) {
            return [
              ...prevWords,
              {
                id: `returned-${Date.now()}-${slotIndex}`,
                content: existingWord,
              },
            ];
          }
          return prevWords;
        });
      }
    }

    if (activeId.startsWith("slot-word-") && overId.startsWith("slot-")) {
      const fromSlotIndex = activeData.slotIndex;
      const toSlotIndex = parseInt(overId.split("-")[1]);
      if (fromSlotIndex !== toSlotIndex) {
        const newSlots = [...slots];
        [newSlots[fromSlotIndex], newSlots[toSlotIndex]] = [
          newSlots[toSlotIndex],
          newSlots[fromSlotIndex],
        ];
        setSlots(newSlots);
      }
    }
    setSubmitted(false);
  };

  const handleSubmit = () => {
    const correct = validateAnswers();
    setIsCorrect(correct);
    setSubmitted(true);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <S.Container $isCorrect={submitted && isCorrect} ref={ref}>
        <S.DecorativeCircleTop $isCorrect={submitted && isCorrect} />
        <S.DecorativeCircleBottom $isCorrect={submitted && isCorrect} />

        {submitted && isCorrect && (
          <S.BadgeContainer>
            <S.BadgeIcon>
              <Check className="h-4 w-4" />
            </S.BadgeIcon>
            <S.BadgeText>Correct! 🎉</S.BadgeText>
          </S.BadgeContainer>
        )}

        <S.NumberCircle $isCorrect={submitted && isCorrect}>
          {order + 1}
        </S.NumberCircle>

        <S.Content>
          <S.Question>{question}</S.Question>

          <S.SlotContainer>
            {slots.map((word, index) => (
              <DroppableSlot
                key={`slot-${index}`}
                index={index}
                word={word}
                placeholder={slotPlaceholders[index]}
                onRemove={handleRemove}
                isCorrect={
                  normalizeString(word) ===
                  normalizeString(correctAnswer[index])
                }
                submitted={submitted}
              />
            ))}
          </S.SlotContainer>

          <S.WordsArea>
            {availableWords.map((word) => (
              <div key={word.id}>
                <DraggableWord
                  id={word.id}
                  content={word.content}
                  submitted={submitted}
                  isCorrect={isCorrect}
                />
              </div>
            ))}
          </S.WordsArea>

          <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
            {!submitted || !isCorrect ? (
              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                disabled={slots.some((slot) => slot === null)}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 500,
                  background: slots.some((slot) => slot === null)
                    ? "#e5e7eb"
                    : "linear-gradient(to right, #6366f1, #9333ea)",
                  color: slots.some((slot) => slot === null)
                    ? "#9ca3af"
                    : "#ffffff",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  cursor: slots.some((slot) => slot === null)
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                Check
              </Button>
            ) : null}
          </div>

          {submitted && isCorrect && (
            <S.FeedbackText>{feedback}</S.FeedbackText>
          )}
        </S.Content>
      </S.Container>
      <DragOverlay>
        {draggingWord ? (
          <S.WordButton
            style={{
              padding: "4px 16px",
              borderRadius: "4px",
              backgroundColor: "#f0f0f0",
              color: "#333",
              fontSize: "14px",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.15)",
            }}
          >
            {draggingWord}
          </S.WordButton>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
});

VerbSceneIllustrator.displayName = "VerbSceneIllustrator";
