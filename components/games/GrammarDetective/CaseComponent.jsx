import React from "react";

export default function CaseComponent({ caseData, onAnswerSelected }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerClick = (index) => {
    setSelectedAnswer(index);
    onAnswerSelected(index === caseData.correctAnswerIndex);
    setShowExplanation(true);
  };

  return (
    <div className="mb-4 rounded-lg border p-4">
      <h3 className="mb-2 text-xl font-semibold">{caseData.caseTitle}</h3>
      <p className="mb-4">{caseData.criminalClue}</p>
      <div className="space-y-2">
        {caseData.choices.map((choice, index) => (
          <Button
            key={index}
            onClick={() => handleAnswerClick(index)}
            disabled={selectedAnswer !== null}
            className={`w-full text-left ${
              selectedAnswer !== null && index === caseData.correctAnswerIndex
                ? "bg-green-500 hover:bg-green-500"
                : selectedAnswer === index
                  ? "bg-red-500 hover:bg-red-500"
                  : ""
            }`}
          >
            {choice}
          </Button>
        ))}
      </div>
      {showExplanation && (
        <div className="mt-4 rounded-lg bg-gray-100 p-4">
          <p className="text-sm text-gray-700">{caseData.explanation}</p>
        </div>
      )}
    </div>
  );
}
