import { Languages, Activity, Loader2, Target, Wind } from "lucide-react";

export function FreestyleChatBubble({ message }: { message: any }) {
  const isUser = message.role === "user";

  // Safely extract Azure Pronunciation metrics based on your exact JSON payload
  const azureData = message.pronunciationScore?.NBest?.[0];
  const overallScore = azureData?.PronScore;
  const accuracyScore = azureData?.AccuracyScore;
  const fluencyScore = azureData?.FluencyScore;

  // Helper to colorize the score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-500 bg-red-50";
  };

  return (
    <div className={`flex flex-col w-full ${isUser ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {/* Main Chat Bubble */}
      <div
        className={`max-w-[85%] p-4 rounded-3xl shadow-sm text-[15px] leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
        }`}
      >
        {message.text}
      </div>

      {/* AI Translation Subtitle */}
      {!isUser && message.translation && (
        <div className="text-xs text-gray-500 mt-2 ml-2 flex items-center gap-1.5 font-medium">
          <Languages className="w-3.5 h-3.5 text-indigo-400" /> 
          {message.translation}
        </div>
      )}

      {/* User Pronunciation Score Display */}
      {isUser && (
        <div className="mt-2 mr-2">
          {message.isAnalyzingPronunciation ? (
            <span className="text-blue-500 flex items-center gap-1.5 text-xs font-semibold bg-blue-50 px-3 py-1.5 rounded-full">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Scoring pronunciation...
            </span>
          ) : overallScore !== undefined ? (
            <div className="flex flex-col gap-1.5 items-end">
              {/* Overall Score Badge */}
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-white/50 ${getScoreColor(overallScore)}`}>
                <Activity className="w-3.5 h-3.5" /> 
                Pronunciation: {overallScore.toFixed(1)}/100
              </div>
              
              {/* Detailed Metrics (Accuracy & Fluency) */}
              <div className="flex gap-2 text-[10px] font-semibold text-gray-500 mr-1">
                {accuracyScore !== undefined && (
                  <span className="flex items-center gap-1" title="Accuracy">
                    <Target className="w-3 h-3 text-gray-400" /> {accuracyScore}
                  </span>
                )}
                {fluencyScore !== undefined && (
                  <span className="flex items-center gap-1" title="Fluency">
                    <Wind className="w-3 h-3 text-gray-400" /> {fluencyScore}
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