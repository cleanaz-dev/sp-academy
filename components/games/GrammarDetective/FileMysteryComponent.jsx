import React from "react";

export default function FileMysteryComponent({
  finalMystery,
  onAnswerSelected,
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerClick = (index) => {
    setSelectedAnswer(index);
    onAnswerSelected(index === finalMystery.correctAnswerIndex);
    setShowExplanation(true);
  };

  return (
    <div className="mb-4 rounded-lg border p-4">
      <h3 className="mb-2 text-xl font-semibold">Final Mystery</h3>
      <p className="mb-4">{finalMystery.question}</p>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {finalMystery.imagePrompts.map((prompt, index) => (
          <div key={index} className="rounded-lg border p-2">
            <img
              src={`https://via.placeholder.com/150?text=Image+${index + 1}`}
              alt={prompt}
              className="h-auto w-full rounded-lg"
            />
            <p className="mt-2 text-center text-sm">{prompt}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {finalMystery.choices.map((choice, index) => (
          <Button
            key={index}
            onClick={() => handleAnswerClick(index)}
            disabled={selectedAnswer !== null}
            className={`w-full text-left ${
              selectedAnswer !== null &&
              index === finalMystery.correctAnswerIndex
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
          <p className="text-sm text-gray-700">{finalMystery.explanation}</p>
        </div>
      )}
    </div>
  );
}
