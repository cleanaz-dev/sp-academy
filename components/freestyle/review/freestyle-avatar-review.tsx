"use client";

interface Props {
  isSpeaking: boolean;
}

export function FreestyleAvatarReview({ isSpeaking }: Props) {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl transition-all duration-500 ${
          isSpeaking ? "scale-110 shadow-2xl ring-4 ring-indigo-200" : ""
        }`}
      >
        <span className="text-5xl">🎙️</span>
      </div>

      {isSpeaking && (
        <>
          <div className="absolute -bottom-3 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping" />
        </>
      )}
    </div>
  );
}