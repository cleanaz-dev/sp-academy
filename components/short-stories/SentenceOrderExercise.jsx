// components/short-stories/SentenceOrderExercise.jsx
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

// Sortable item component
const SortableItem = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`mb-2 cursor-move select-none rounded-lg p-4 ${
        isDragging
          ? "bg-purple-100 shadow-lg"
          : "border-2 border-gray-200 bg-white hover:border-purple-300"
      } transition-colors duration-200`}
    >
      {children}
    </div>
  );
};

export default function SentenceOrderExercise({
  exercise,
  onAnswer,
  showResults,
}) {
  const [parts, setParts] = useState(exercise.parts);
  const [isCorrect, setIsCorrect] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setParts((items) => {
        const oldIndex = items.findIndex((item) => item === active.id);
        const newIndex = items.findIndex((item) => item === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Check if the order is correct
        const currentOrder = newOrder.map((part) =>
          exercise.parts.indexOf(part),
        );
        const correct =
          JSON.stringify(currentOrder) ===
          JSON.stringify(exercise.correctOrder);
        setIsCorrect(correct);

        // Send the answer to parent component
        onAnswer(exercise.id, newOrder);

        return newOrder;
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          {exercise.question}
        </h3>
        <p className="text-sm text-gray-600">
          Drag the parts to arrange them in the correct order
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={parts} strategy={verticalListSortingStrategy}>
          {parts.map((part) => (
            <SortableItem key={part} id={part}>
              {part}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      {showResults && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className={`mt-4 rounded-lg p-4 ${
            isCorrect ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <div className="flex items-center space-x-2">
            {isCorrect ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-600">Correct order!</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                <div className="text-red-600">
                  <p>Not quite right. The correct sentence is:</p>
                  <p className="mt-2 font-medium">{exercise.correctSentence}</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
