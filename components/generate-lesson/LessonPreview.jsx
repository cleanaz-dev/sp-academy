"use client";
import { Card } from "@/components/old-ui/card";
import { Button } from "@/components/old-ui/button";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Skeleton } from "@/components/old-ui/skeleton";
import { useState, useEffect, useRef } from "react";
import LessonChat from "./LessonChat";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Lecture components
import {
  Goals,
  Topic,
  Flashcard,
  Dialogue,
  AudioModule,
  ConjugationTable,
  ConjugationTableWrapper,
  ConversationWithAi,
  Pronunciation,
  Vocab,
  SpeakingModule,
  Table,
  Summary,
} from "./lecture-components";

// Exercise components
import {
  AudioExercise,
  DragDropExercise,
  FillInTheBlankExercise,
  ImageExercise,
  MatchingExercise,
  VerbSceneIllustrator,
} from "./exercise-components";

export default function LessonPreview({
  content,
  isLoading,
  setIsLoading = () => {},
  onClear = () => {},
}) {
  const [previewContent, setPreviewContent] = useState(null);
  const exerciseRefs = useRef([]);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  // Check if all exercises are correct
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const allCorrect = exerciseRefs.current.every(
        (ref) => ref?.checkValidity() === true,
      );
      if (allCorrect) {
        setSubmitError("");
        console.log("All exercises are correct. Submitting...");
        await new Promise((resolve) => {
          setTimeout(() => {
            console.log("Submission completed successfully");
            resolve();
          }, 2000);
        });
      } else {
        setSubmitError(
          "Not all exercises are completed. Please complete all to continue.",
        );
      }
    } catch (error) {
      setSubmitError("An error occurred during submission");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const componentMap = {
    goals: Goals,
    topic: Topic,
    flashcard: Flashcard,
    dialogue: Dialogue,
    audio: AudioModule,
    conjugationTable: ConjugationTable,
    conjugationGroup: ConjugationTableWrapper,
    conversationWithAi: ConversationWithAi,
    pronunciation: Pronunciation,
    table: Table,
    vocab: Vocab,
    summary: Summary,
    speakingModule: SpeakingModule,
    alert: ({ children }) => (
      <div className="my-4 border-l-4 border-red-500 bg-red-100 p-4 text-red-700">
        ⚠️ {children}
      </div>
    ),
    info: ({ children }) => (
      <div className="my-4 border-l-4 border-blue-500 bg-blue-100 p-4 text-blue-700">
        ℹ️ {children}
      </div>
    ),
    tip: ({ children }) => (
      <div className="my-4 border-l-4 border-green-500 bg-green-100 p-4 text-green-700">
        💡 {children}
      </div>
    ),
    note: ({ children }) => (
      <div className="my-4 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
        📝 Note: {children}
      </div>
    ),
  };

  const exerciseMap = {
    audio_based: AudioExercise,
    drag_and_drop: DragDropExercise,
    fill_in_blank: FillInTheBlankExercise,
    image_word_input: ImageExercise,
    matching_pairs: MatchingExercise,
    verb_scene_illustrator: VerbSceneIllustrator,
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[275px]" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      );
    }

    if (
      !content ||
      (!content.lecture &&
        (!content.exercises || content.exercises.length === 0))
    ) {
      return (
        <div className="text-gray-500">
          Lesson preview will appear here after generation.
        </div>
      );
    }

    const blocks = content.lecture ? content.lecture.split(/\n\n+/) : [];
    let conjugationTables = [];
    const sections = []; // Collect sections for LessonChat

    const addSection = (id, content, element) => {
      sections.push({ id, content });
      return (
        <div key={id} data-section-id={id} data-section-content={content}>
          {element}
        </div>
      );
    };

    const renderedBlocks = blocks.map((block, index) => {
      const componentMatch = block.match(/\[([\w]+)\]\s*({[\s\S]*})/);
      const sectionId = `block-${index}`;

      if (componentMatch) {
        const [fullMatch, componentName, jsonContent] = componentMatch;
        const Component = componentMap[componentName];
        if (Component) {
          try {
            const props = JSON.parse(jsonContent);
            if (componentName === "conjugationTable") {
              conjugationTables.push(props);
              const nextBlock = blocks[index + 1];
              const isNextConjugationTable =
                nextBlock?.match(/\[conjugationTable\]/);
              if (!isNextConjugationTable && conjugationTables.length > 0) {
                const tablesToRender = [...conjugationTables];
                conjugationTables = [];
                return addSection(
                  `conj-group-${index}`,
                  JSON.stringify(tablesToRender),
                  <ConjugationTableWrapper
                    key={`conj-group-${index}`}
                    tables={tablesToRender}
                  />,
                );
              }
              return null;
            }
            return addSection(
              `component-${index}`,
              jsonContent,
              <Component key={`component-${index}`} {...props} />,
            );
          } catch (e) {
            console.error(`Error parsing JSON for ${componentName}:`, e);
            return (
              <div
                key={`error-${index}`}
                className="rounded border border-red-300 p-2 text-red-500"
              >
                Error rendering {componentName}: {e.message}
                <pre className="mt-2 overflow-auto text-xs">{jsonContent}</pre>
              </div>
            );
          }
        }
        return (
          <div key={`unknown-${index}`} className="p-2 text-orange-500">
            Unknown component: {componentName}
          </div>
        );
      }

      return addSection(
        `md-${index}`,
        block,
        <Markdown
          key={`md-${index}`}
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1
                className="mb-4 text-center text-3xl font-bold text-blue-500"
                {...props}
              />
            ),
            h2: ({ node, ...props }) => (
              <h2
                className="mb-3 mt-6 text-center text-2xl font-semibold text-blue-600"
                {...props}
              />
            ),
            p: ({ node, ...props }) => (
              <p className="mb-3 leading-relaxed text-gray-800" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-semibold text-red-600" {...props} />
            ),
            table: ({ node, ...props }) => (
              <div className="my-4 overflow-x-auto">
                <table
                  className="min-w-full border-collapse border border-gray-200"
                  {...props}
                />
              </div>
            ),
            img: ({ node, ...props }) => (
              <div className="relative my-4 w-full">
                <img
                  src={props.src}
                  alt={props.alt}
                  className="h-auto w-full rounded-lg"
                  onError={(e) => {
                    e.target.src = "/images/fallback-image.png";
                  }}
                />
              </div>
            ),
          }}
        >
          {block}
        </Markdown>,
      );
    });

    if (content.exercises && content.exercises.length > 0) {
      renderedBlocks.push(
        <div key="exercises-section" className="mt-8">
          <h2 className="mb-3 mt-6 text-center text-2xl font-semibold text-blue-600">
            Exercises
          </h2>
          {content.exercises.map((exercise, index) => {
            const ExerciseComponent = exerciseMap[exercise.type];
            const sectionId = `exercise-${index}`;
            if (ExerciseComponent) {
              const exerciseContent = JSON.stringify(exercise);
              sections.push({ id: sectionId, content: exerciseContent });
              console.log("Sections", sections);
              return (
                <div
                  className="mx-auto my-10 max-w-xl"
                  key={sectionId}
                  data-section-id={sectionId}
                  data-section-content={exerciseContent}
                >
                  <ExerciseComponent
                    exercise={exercise}
                    ref={(el) => (exerciseRefs.current[index] = el)}
                  />
                </div>
              );
            }
            return (
              <div key={`unknown-exercise-${index}`}>
                Unsupported exercise type: {exercise.type}
              </div>
            );
          })}
        </div>,
      );
    }

    return (
      <>
        {renderedBlocks}
        <LessonChat sections={sections} />
      </>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Card className="bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-medium text-gray-900">
              Lesson Preview
            </h2>
            <div className="max-h-[800px] overflow-y-auto rounded-lg border p-4">
              <div className="prose prose-sm max-w-none">{renderContent()}</div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClear}
                  disabled={!content || isLoading}
                >
                  Clear Preview
                </Button>
                <Button type="button" onClick={handleSubmit} variant="ghost">
                  {isSubmitting ? "Looks Good 👍🏽" : "Test Exercises"}
                </Button>
              </div>
              <div>
                <Button
                  type="button"
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  Save & Submit Lesson
                </Button>
              </div>
            </div>
            {submitError && (
              <p className="mt-2 text-sm text-red-600">{submitError}</p>
            )}
          </Card>
        </div>
      </main>
    </DndProvider>
  );
}
