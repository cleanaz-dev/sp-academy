import { useState } from "react";
import CaseComponent from "./CaseComponent";
import FinalMysteryComponent from "./FinalMysteryComponent";

export default function GameComponent({ gameData }) {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const handleCaseAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore((prevScore) => prevScore + 10);
    }
    if (currentCaseIndex < gameData.cases.length - 1) {
      setCurrentCaseIndex((prevIndex) => prevIndex + 1);
    } else {
      setGameCompleted(true);
    }
  };

  const handleFinalMysteryAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore((prevScore) => prevScore + 50); // Bonus points for final mystery
    }
    setGameCompleted(true);
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-3xl font-bold">{gameData.data.title}</h1>
      <p className="mb-4 text-lg">{gameData.data.description}</p>
      <div className="mb-8">
        <p className="text-sm text-gray-600">Rules: {gameData.data.rules}</p>
      </div>

      {!gameCompleted ? (
        <>
          <CaseComponent
            caseData={gameData.cases[currentCaseIndex]}
            onAnswerSelected={handleCaseAnswer}
          />
          <div className="mt-4">
            <p className="text-lg font-semibold">Score: {score}</p>
          </div>
        </>
      ) : (
        <>
          <FinalMysteryComponent
            finalMystery={gameData.finalMystery}
            onAnswerSelected={handleFinalMysteryAnswer}
          />
          <div className="mt-4">
            <p className="text-lg font-semibold">Final Score: {score}</p>
          </div>
        </>
      )}
    </div>
  );
}
