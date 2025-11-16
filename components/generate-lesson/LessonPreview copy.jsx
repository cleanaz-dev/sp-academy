"use client";
import { Card } from "@/components/old-ui/card";
import { Button } from "@/components/old-ui/button";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Skeleton } from "@/components/old-ui/skeleton";
import { useState, useEffect, useRef, useCallback } from "react";
import { generateMockLessonContent } from "./mockLessonContent";
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
} from "./lecture-components";

// Exercise components
import {
  AudioExercise,
  DragDropExercise,
  FillInTheBlankExercise,
  ImageExercise,
  MatchingExercise,
} from "./exercise-components";

export default function LessonPreview({
  content = null,
  isLoading = false,
  setIsLoading = () => {},
  onClear = () => {},
}) {
  const [previewContent, setPreviewContent] = useState(null);
  const exerciseRefs = useRef([]);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);

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
        setSubmitError("Not all exercises are completed. Please fix errors.");
      }
    } catch (error) {
      setSubmitError("An error occurred during submission");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!content) {
      setPreviewContent(null);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const mockContent = generateMockLessonContent(content);
      setPreviewContent(mockContent);
      setIsLoading(false);
    }, 500);
  }, [content, setIsLoading]);

  const componentMap = {
    goals: Goals,
    topic: Topic,
    flashcard: Flashcard,
    dialogue: Dialogue,
    audio: AudioModule,
    conjugationTable: ConjugationTable,
    conjugationGroup: ConjugationTableWrapper, // We'll use this for grouped tables
    conversationWithAi: ConversationWithAi,
    pronunciation: Pronunciation,
    vocab: Vocab,
    speakingModule: SpeakingModule,
  };

  const exerciseMap = {
    audio_based: AudioExercise,
    drag_and_drop: DragDropExercise,
    fill_in_blank: FillInTheBlankExercise,
    image_word_input: ImageExercise,
    matching_pairs: MatchingExercise,
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

    if (!previewContent) {
      return (
        <div className="text-gray-500">
          Lesson preview will appear here after generation.
        </div>
      );
    }

    const blocks = previewContent.split("\n\n").filter((block) => block.trim());
    let conjugationTables = [];

    return blocks.map((block, index) => {
      const componentMatch = block.match(/:::component::(\w+):::([\s\S]*)/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        const componentContent = componentMatch[2];

        if (componentName === "conjugationTable") {
          try {
            const props = JSON.parse(componentContent);
            conjugationTables.push(props);
            const nextBlock = blocks[index + 1];
            const isNextConjugationTable =
              nextBlock && nextBlock.match(/:::component::conjugationTable:::/);
            if (!isNextConjugationTable && conjugationTables.length > 0) {
              const tablesToRender = [...conjugationTables];
              conjugationTables = [];

              return (
                <ConjugationTableWrapper key={index} tables={tablesToRender} />
              );
            }
            return null;
          } catch (e) {
            console.error("Failed to parse conjugation table:", e);
            return null;
          }
        }

        const componentMap = {
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
          audio: ({ text, language }) => (
            <AudioModule text={text} language={language} />
          ),
          flashcard: ({ front, back }) => (
            <Flashcard front={front} back={back} />
          ),
          pronunciation: ({ title, items }) => (
            <Pronunciation title={title} items={items} />
          ),
          conjugationTable: ({
            verbs,
            tense,
            conjugation,
            englishTranslations,
          }) => (
            <ConjugationTable
              verbs={verbs}
              tense={tense}
              conjugation={conjugation}
              englishTranslations={englishTranslations}
            />
          ),
          conversationWithAi: ({ conversationPartners, initialPrompt }) => (
            <ConversationWithAi
              conversationPartners={conversationPartners}
              initialPrompt={initialPrompt}
            />
          ),
          goals: ({ title, hook, objectives, explanation }) => (
            <Goals
              title={title}
              hook={hook}
              objectives={objectives}
              explanation={explanation}
            />
          ),
          dialogue: ({ title, lines, analysis }) => (
            <Dialogue title={title} lines={lines} analysis={analysis} />
          ),
          vocab: ({ title, items, context }) => (
            <Vocab title={title} items={items} context={context} />
          ),
          topic: ({ french, english }) => (
            <Topic french={french} english={english} />
          ),
          speakingModule: ({ textPrompt, language }) => (
            <SpeakingModule textPrompt={textPrompt} language={language} />
          ),
          exercises: ({ title, type, ...props }) => {
            // Map exercise type to specific component

            const exerciseMap = {
              audio_based: AudioExercise,
              fill_in_blank: FillInTheBlankExercise,
              drag_and_drop: DragDropExercise,
              matching_pairs: MatchingExercise,
              image_word_input: ImageExercise,
            };

            const ExerciseComponent = exerciseMap[type];

            if (!ExerciseComponent) {
              return <div key={index}>Unsupported exercise type: {type}</div>;
            }

            // Add order prop for display and ref for validation
            const exerciseData = {
              title,
              ...props, // Includes question, scrambledWords, correctAnswer, feedback, etc.
              order: index,
            };
            return (
              <div className="mx-auto my-10 max-w-xl">
                <ExerciseComponent
                  key={index}
                  exercise={exerciseData}
                  ref={(el) => (exerciseRefs.current[index] = el)}
                />
              </div>
            );
          },
        };

        const Component = componentMap[componentName];
        if (Component) {
          try {
            const props = JSON.parse(componentContent);
            return <Component key={index} {...props} />;
          } catch (e) {
            console.error(`Failed to parse ${componentName}:`, e);
            return <div key={index}>Error rendering {componentName}</div>;
          }
        }
      }

      return (
        <Markdown
          key={index}
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
                className="mb-3 mt-6 text-center text-2xl font-semibold text-green-600"
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
                    e.target.onerror = null;
                    e.target.src = "path/to/fallback-image.png";
                  }}
                />
              </div>
            ),
          }}
        >
          {block}
        </Markdown>
      );
    });
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
            <div className="mt-4 flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClear}
                disabled={!previewContent || isLoading}
              >
                Clear Preview
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-indigo-500 text-white hover:bg-indigo-600"
              >
                {isSubmitting ? "Submitting...." : "Submit Exercises"}
              </Button>
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
