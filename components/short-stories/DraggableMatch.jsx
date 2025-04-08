// components/short-stories/DraggableMatch.jsx
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { Card } from "@/components/ui/card";

export function DraggableMatch({ pairs, onMatch, exerciseId }) {
  const [leftItems] = useState(
    pairs.map((pair) => ({ id: pair.left, text: pair.left })),
  );
  const [rightItems, setRightItems] = useState(
    // Shuffle the right items array
    pairs
      .map((pair) => ({ id: pair.right, text: pair.right, correct: pair.left }))
      .sort(() => Math.random() - 0.5),
  );
  const [activeId, setActiveId] = useState(null);
  const [matches, setMatches] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setRightItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update matches
        const newMatches = {};
        leftItems.forEach((leftItem, index) => {
          newMatches[leftItem.id] = newItems[index].id;
        });
        setMatches(newMatches);
        onMatch(exerciseId, newMatches);

        return newItems;
      });
    }
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:flex-row">
      {/* Left column (French words) */}
      <div className="flex-1">
        <h4 className="mb-4 text-lg font-semibold text-purple-700">
          French Words
        </h4>
        <div className="space-y-2">
          {leftItems.map((item, index) => (
            <Card key={item.id} className="border-purple-200 bg-purple-50 p-3">
              <p className="font-medium">{item.text}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Right column (Draggable English translations) */}
      <div className="flex-1">
        <h4 className="mb-4 text-lg font-semibold text-blue-700">
          English Translations
        </h4>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={rightItems}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {rightItems.map((item) => (
                <SortableItem key={item.id} id={item.id}>
                  <Card className="cursor-move border-blue-200 bg-blue-50 p-3">
                    <p className="font-medium">{item.text}</p>
                  </Card>
                </SortableItem>
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <Card className="border-blue-300 bg-blue-100 p-3 shadow-lg">
                <p className="font-medium">
                  {rightItems.find((item) => item.id === activeId)?.text}
                </p>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
