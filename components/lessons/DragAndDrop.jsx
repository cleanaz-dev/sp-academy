// exercises/DragAndDrop.jsx
"use client";
import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Draggable item component
const DraggableItem = ({ id, text, index }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ITEM",
    item: { id, text, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`cursor-move rounded border bg-white p-2 ${isDragging ? "opacity-50" : "opacity-100"} hover:bg-gray-50`}
    >
      {text}
    </div>
  );
};

// Droppable zone component
const DropZone = ({ onDrop, children, index, isOccupied }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "ITEM",
    drop: (item) => onDrop(item, index),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`flex min-h-[60px] items-center justify-center rounded border-2 border-dashed p-4 ${isOver ? "bg-gray-100" : "bg-white"} ${isOccupied ? "border-gray-300" : "border-gray-200"}`}
    >
      {children || <span className="text-gray-400">Drop here</span>}
    </div>
  );
};

const DragAndDrop = ({ exercise, onComplete }) => {
  const [sourceItems, setSourceItems] = useState(() => {
    const correctAnswer = JSON.parse(exercise.correctAnswer);
    return correctAnswer
      .map((text, index) => ({ id: `item-${index}`, text }))
      .sort(() => Math.random() - 0.5);
  });

  const [targetItems, setTargetItems] = useState(
    Array(JSON.parse(exercise.correctAnswer).length).fill(null),
  );

  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const handleDrop = (item, targetIndex) => {
    const sourceIndex = sourceItems.findIndex((i) => i?.id === item.id);
    if (sourceIndex === -1) return;

    const newSourceItems = [...sourceItems];
    const newTargetItems = [...targetItems];

    // Remove from source
    newSourceItems[sourceIndex] = null;
    // Add to target
    newTargetItems[targetIndex] = item;

    setSourceItems(newSourceItems);
    setTargetItems(newTargetItems);
  };

  const handleSubmit = () => {
    setAttempts((prev) => prev + 1);

    const currentAnswer = targetItems
      .filter((item) => item !== null)
      .map((item) => item.text);

    const correctAnswer = JSON.parse(exercise.correctAnswer);
    const isCorrect =
      JSON.stringify(currentAnswer) === JSON.stringify(correctAnswer);

    setFeedback({
      message: isCorrect ? "Correct!" : "Try again!",
      type: isCorrect ? "success" : "error",
    });

    if (isCorrect) {
      onComplete(exercise.id, {
        completed: true,
        score: Math.max(100 - attempts * 10, 0),
        attempts,
      });
    }
  };

  const handleReset = () => {
    const correctAnswer = JSON.parse(exercise.correctAnswer);
    setSourceItems(
      correctAnswer
        .map((text, index) => ({ id: `item-${index}`, text }))
        .sort(() => Math.random() - 0.5),
    );
    setTargetItems(Array(correctAnswer.length).fill(null));
    setFeedback(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="mx-auto max-w-2xl p-6">
        <h3 className="mb-4 text-xl font-semibold">{exercise.question}</h3>

        {/* Available items */}
        <div className="mb-6">
          <h4 className="mb-2 text-lg font-medium">Available Items:</h4>
          <div className="flex flex-wrap gap-2">
            {sourceItems.map(
              (item, index) =>
                item && (
                  <DraggableItem
                    key={item.id}
                    id={item.id}
                    text={item.text}
                    index={index}
                  />
                ),
            )}
          </div>
        </div>

        {/* Drop zones */}
        <div className="mb-6">
          <h4 className="mb-2 text-lg font-medium">Your Answer:</h4>
          <div className="grid gap-2">
            {targetItems.map((item, index) => (
              <DropZone
                key={index}
                index={index}
                onDrop={handleDrop}
                isOccupied={!!item}
              >
                {item && (
                  <DraggableItem id={item.id} text={item.text} index={index} />
                )}
              </DropZone>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`mb-4 rounded p-3 ${
              feedback.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Submit
          </button>
          <button
            onClick={handleReset}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Reset
          </button>
        </div>

        {/* Progress */}
        <div className="mt-4 text-sm text-gray-600">
          Attempts: {attempts}
          {feedback?.type === "success" && (
            <span className="ml-4">
              Score: {Math.max(100 - attempts * 10, 0)}
            </span>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default DragAndDrop;
