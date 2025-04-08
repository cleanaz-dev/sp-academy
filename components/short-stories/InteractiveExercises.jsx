// components/short-stories/InteractiveExercises.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Award } from "lucide-react";
import { DraggableMatch } from "./DraggableMatch";
import SentenceOrderExercise from "./SentenceOrderExercise";
// import ImageSentenceBuilder from "./ImageSentenceBuilder";

// Separate component for exercise feedback
const ExerciseFeedback = ({ exercise, userAnswer, isCorrect }) => {
  if (!isCorrect) return null;

  return (
    <div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-4 rounded-lg bg-green-50 p-4"
    >
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="h-5 w-5" />
        <span>Correct! Well done!</span>
      </div>
    </div>
  );
};

// Separate component for progress and controls
const ProgressAndControls = ({
  showResults,
  currentScore,
  totalExercises,
  progressPercentage,
  onSubmit,
}) => {
  return (
    <div className="sticky bottom-4 rounded-lg border bg-white p-4 shadow-lg">
      <div className="flex flex-col space-y-4">
        {showResults && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Progress</span>
              <span className="text-sm font-medium">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            onClick={onSubmit}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {showResults ? "Try Again" : "Check Answers"}
          </Button>
        </div>

        {showResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center space-x-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4"
          >
            <Award className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-lg font-bold">
                Final Score: {currentScore} out of {totalExercises}
              </p>
              <p className="text-sm text-gray-600">
                {progressPercentage >= 80
                  ? "Excellent work!"
                  : progressPercentage >= 60
                    ? "Good job!"
                    : "Keep practicing!"}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default function InteractiveExercises({ exercises }) {
  const [currentScore, setCurrentScore] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleMatch = (exerciseId, matches) => {
    setAnswers((prev) => ({ ...prev, [exerciseId]: matches }));
  };

  const checkAnswer = (exercise, userAnswer) => {
    switch (exercise.type) {
      case "multiple-choice":
      case "fill-in-blanks":
        return userAnswer === exercise.correctAnswer;

      case "matching":
        const matches = userAnswer || {};
        return exercise.pairs.every(
          (pair) => matches[pair.left] === pair.right,
        );

      case "sentence-order":
        const currentOrder = userAnswer.map((part) =>
          exercise.parts.indexOf(part),
        );
        return (
          JSON.stringify(currentOrder) === JSON.stringify(exercise.correctOrder)
        );

      case "image-sentence":
        return exercise.expectedElements.every((element) =>
          userAnswer.toLowerCase().includes(element.toLowerCase()),
        );

      default:
        return false;
    }
  };

  const handleSubmit = () => {
    if (showResults) {
      // Reset everything for "Try Again"
      setShowResults(false);
      setCurrentScore(0);

      // Reset answers for all types of exercises
      setAnswers((prev) => {
        const resetAnswers = {};
        exercises.forEach((exercise) => {
          if (
            exercise.type === "multiple-choice" ||
            exercise.type === "fill-in-blanks"
          ) {
            resetAnswers[exercise.id] = ""; // Clear multiple-choice and fill-in-blanks
          } else if (exercise.type === "matching") {
            resetAnswers[exercise.id] = {}; // Clear matching answers
          } else if (exercise.type === "sentence-order") {
            resetAnswers[exercise.id] = []; // Clear sentence-order answers
          }
          // Add other exercise types as needed...
        });
        return resetAnswers;
      });

      return;
    }

    // Check answers and calculate the score
    let score = 0;
    exercises.forEach((exercise) => {
      const userAnswer = answers[exercise.id];
      if (checkAnswer(exercise, userAnswer)) {
        score++;
      }
    });

    setCurrentScore(score);
    setShowResults(true);
  };

  const renderExercise = (exercise) => {
    switch (exercise.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium text-gray-800">
              {exercise.question}
            </p>
            <RadioGroup
              value={answers[exercise.id] || ""} // Ensure that the value is empty if it's reset
              onValueChange={(value) =>
                setAnswers((prev) => ({ ...prev, [exercise.id]: value }))
              }
              className="space-y-2"
            >
              {exercise.options.map((option, idx) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors ${
                    answers[exercise.id] === option
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-200"
                  }`}
                >
                  <RadioGroupItem value={option} id={`${exercise.id}-${idx}`} />
                  <Label
                    className="flex-grow cursor-pointer"
                    htmlFor={`${exercise.id}-${idx}`}
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "fill-in-blanks":
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium text-gray-800">
              {exercise.question}
            </p>
            <Input
              value={answers[exercise.id] || ""} // Reset the input value
              type="text"
              placeholder="Type your answer here..."
              className="w-full p-3"
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [exercise.id]: e.target.value,
                }))
              }
            />
          </div>
        );

      case "matching":
        return (
          <DraggableMatch
            pairs={exercise.pairs}
            onMatch={(matches) => handleMatch(exercise.id, matches)}
            exerciseId={exercise.id}
          />
        );

      case "sentence-order":
        return (
          <SentenceOrderExercise
            exercise={exercise}
            onAnswer={(id, answer) =>
              setAnswers((prev) => ({ ...prev, [id]: answer }))
            }
            showResults={showResults}
          />
        );

      // case "image-sentence":
      //   return (
      //     <ImageSentenceBuilder
      //       exercise={exercise}
      //       onAnswer={(id, answer) =>
      //         setAnswers((prev) => ({ ...prev, [id]: answer }))
      //       }
      //       showResults={showResults}
      //     />
      //   );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800">Practice Exercises</h3>
        <p className="mt-2 text-gray-600">
          Complete these exercises to test your understanding
        </p>
      </div>

      {exercises.map((exercise, index) => (
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                    {exercise.type.replace("-", " ").toUpperCase()}
                  </span>
                  <span className="text-gray-500">Question {index + 1}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderExercise(exercise)}

              {showResults && (
                <ExerciseFeedback
                  exercise={exercise}
                  userAnswer={answers[exercise.id]}
                  isCorrect={checkAnswer(exercise, answers[exercise.id])}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <ProgressAndControls
        showResults={showResults}
        currentScore={currentScore}
        totalExercises={exercises.length}
        progressPercentage={(currentScore / exercises.length) * 100}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
