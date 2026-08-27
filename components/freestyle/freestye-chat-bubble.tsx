import { Languages, Activity, Loader2, Target, Wind } from "lucide-react";

export function FreestyleChatBubble({ message }: { message: any }) {
  const isUser = message.role === "user";

  // ✅ CORRECT
  const overallScore = message.pronunciationScore?.score;
  const accuracyScore = message.pronunciationScore?.accuracyScore;
  const fluencyScore = message.pronunciationScore?.fluencyScore;
  // Helper to colorize the score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-500 bg-red-50";
  };

  return (
    <div
      className={`flex w-full flex-col ${isUser ? "items-end" : "items-start"} duration-300 animate-in fade-in slide-in-from-bottom-2`}
    >
      {/* Main Chat Bubble */}
      <div
        className={`max-w-[85%] rounded-3xl p-4 text-[15px] leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-sm bg-blue-600 text-white"
            : "rounded-bl-sm border border-gray-100 bg-white text-gray-800"
        }`}
      >
        {message.text}
      </div>

      {/* AI Translation Subtitle */}
      {!isUser && message.translation && (
        <div className="ml-2 mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <Languages className="h-3.5 w-3.5 text-indigo-400" />
          {message.translation}
        </div>
      )}

      {/* User Pronunciation Score Display */}
      {isUser && (
        <div className="mr-2 mt-2">
          {message.isAnalyzingPronunciation ? (
            <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scoring
              pronunciation...
            </span>
          ) : overallScore !== undefined ? (
            <div className="flex flex-col items-end gap-1.5">
              {/* Overall Score Badge */}
              <div
                className={`flex items-center gap-1.5 rounded-full border border-white/50 px-3 py-1.5 text-xs font-bold shadow-sm ${getScoreColor(overallScore)}`}
              >
                <Activity className="h-3.5 w-3.5" />
                Pronunciation: {overallScore.toFixed(1)}/100
              </div>

              {/* Detailed Metrics (Accuracy & Fluency) */}
              <div className="mr-1 flex gap-2 text-[10px] font-semibold text-gray-500">
                {accuracyScore !== undefined && (
                  <span className="flex items-center gap-1" title="Accuracy">
                    <Target className="h-3 w-3 text-gray-400" /> {accuracyScore}
                  </span>
                )}
                {fluencyScore !== undefined && (
                  <span className="flex items-center gap-1" title="Fluency">
                    <Wind className="h-3 w-3 text-gray-400" /> {fluencyScore}
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
