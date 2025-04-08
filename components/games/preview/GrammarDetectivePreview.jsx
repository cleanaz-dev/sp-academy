export default function GrammarDetectivePreview({ gameData }) {
  return (
    <div className="space-y-6">
      {gameData.cases?.map((caseData, index) => (
        <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
          {/* Case Header */}
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">
              Case #{caseData.caseNumber}
            </span>
            <h3 className="text-lg font-semibold text-gray-800">
              {caseData.caseTitle}
            </h3>
          </div>

          {/* Crime Scene */}
          <div className="mb-4 rounded-lg bg-red-50 p-3">
            <p className="font-medium text-red-600">
              🕵️‍♂️ Crime Scene Report:{" "}
              <span className="font-normal">{caseData.incorrectSentence}</span>
            </p>
          </div>

          {/* Detective's Clue */}
          {caseData.clue && (
            <div className="mb-4 rounded-lg bg-yellow-50 p-3">
              <p className="text-sm text-yellow-700">
                🔍 Detective's Clue: {caseData.clue}
              </p>
            </div>
          )}

          {/* Suspect Lineup */}
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-gray-700">
              Suspect Lineup (Choose the correct version):
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {caseData.choices.map((choice, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-3 ${
                    i === caseData.correctAnswerIndex
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{i + 1}.</span>
                    <span className="font-medium text-gray-800">{choice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {/* Forensic Explanation */}
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                🔬 Forensic Analysis:{" "}
                <span className="font-medium">{caseData.explanation}</span>
              </p>
            </div>

            {/* Criminal Clue */}
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-sm text-amber-800">
                💡 Criminal Clue:{" "}
                <span className="font-medium">{caseData.criminalClue}</span>
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Final Mystery Preview */}
      {gameData.finalMystery && (
        <div className="mt-8 rounded-lg border bg-purple-50 p-4">
          <h3 className="mb-4 text-lg font-semibold">
            🔦 Final Mystery Preview
          </h3>
          <div className="mb-4">
            <p className="mb-2 text-sm text-gray-600">
              Generated Mystery Image Prompt:
            </p>
            <p className="rounded border bg-white p-2 text-gray-700">
              "{gameData.finalMystery.imagePrompt}"
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {gameData.finalMystery.choices.map((choice, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 ${
                  i === gameData.finalMystery.correctAnswerIndex
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{i + 1}.</span>
                  <span className="font-medium text-gray-800">{choice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
