"use client";

import { useState, useRef, useEffect } from "react";
import DragDropExercise from "./DragDropExercise";
import FillInTheBlankExercise from "./FillInTheBlankExercise";
import AudioExercise from "./AudioExercise";
import MatchingExercise from "./MatchingExercise";
import ImageExercise from "./ImageExercise";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ExerciseHandler({ exercises }) {
  const router = useRouter();
  const { exercise: exerciseArray } = exercises;
  // Create refs for each exercise component
  const exerciseRefs = useRef([]);
  useEffect(() => {
    exerciseRefs.current = Array(exerciseArray.length).fill(null);
  }, [exerciseArray]);
  // Track completed exercises and total correct
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const EXERCISE_COMPONENTS = {
    drag_and_drop: DragDropExercise,
    fill_in_blank: FillInTheBlankExercise,
    audio_based: AudioExercise,
    matching_pairs: MatchingExercise,
    image_word_input: ImageExercise,
  };

  // Function to check all exercises
  const validateAllExercises = async () => {
    let correctCount = 0;
    const newCompleted = new Set();

    exerciseRefs.current.forEach((ref, index) => {
      if (ref?.checkValidity?.()) {
        newCompleted.add(exerciseArray[index].id);
        correctCount++;
      }
    });

    setCompletedExercises(newCompleted);
    setTotalCorrect(correctCount);
    return correctCount === exercises.length;
  };

  // New submission handler
  const handleSubmitProgress = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/lessons/exercise/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exerciseIds: Array.from(completedExercises),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        console.log("Progress saved successfully");
      } else {
        throw new Error(data.message || "Unknown error occurred");
      }
    } catch (error) {
      setSubmitError(error.message || "Failed to save progress");
    } finally {
      setIsSubmitting(false);
      router.push(`/courses/${exercises.courseId}`);
    }
  };

  return (
    <main className="bg-gray-50">
      <header className="mb-8 animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="mb-4 flex items-center gap-4 text-4xl font-bold">
            {exercises.title}
            <NotebookPen strokeWidth={1.5} className="size-8 drop-shadow-xl" />
          </h1>
          <p className="font-bold"></p>
          <p className="text-sm opacity-90">{exercises.description}</p>
          <p className="text-sm font-semibold tracking-widest opacity-90">
            {exerciseArray.length} interactive exercises
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-md space-y-8 py-10 md:max-w-4xl">
        <div className="sticky top-0 z-10 rounded-lg bg-white p-4 shadow-md">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">Progress:</span>
                <span className="text-blue-600">
                  {totalCorrect}/{exerciseArray.length} correct
                </span>
              </div>

              <button
                onClick={validateAllExercises}
                className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
              >
                Check Answers
              </button>
            </div>

            {totalCorrect < 5 && (
              <div className="text-sm text-muted-foreground">
                Please complete all exercises correctly to submit
              </div>
            )}

            {totalCorrect === 5 && (
              <Button
                type="button"
                onClick={handleSubmitProgress}
                disabled={isSubmitting}
                className={`rounded-lg px-4 py-2 text-white ${
                  isSubmitting
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Exercises"}
              </Button>
            )}

            {submitError && (
              <div className="text-sm text-red-600">{submitError}</div>
            )}
          </div>
        </div>

        {exerciseArray.map((exercise, index) => {
          const ExerciseComponent = EXERCISE_COMPONENTS[exercise.type];

          if (!ExerciseComponent) {
            console.warn(
              `No component found for exercise type: ${exercise.type}`,
            );
            return null;
          }

          return (
            <ExerciseComponent
              key={exercise.id}
              ref={(el) => (exerciseRefs.current[index] = el)}
              exercise={mapExerciseData(exercise)}
              isCompleted={completedExercises.has(exercise.id)}
            />
          );
        })}
      </div>
    </main>
  );
}

// Helper function to transform DB exercise structure
function mapExerciseData(dbExercise) {
  const { additionalData, ...rest } = dbExercise;
  return {
    ...rest,
    ...(additionalData || {}),
  };
}
