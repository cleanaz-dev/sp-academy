"use client";

import { Square, Mic, Send, RotateCcw } from "lucide-react";
import { useFreestyle } from "@/context/freestyle-context";

export function FreestyleControls() {
  const {
    isRecording,
    isProcessing,
    canRetry,
    retriesLeft,
    handleEndSession,
    startRecording,
    submitTurn,
    handleRetry,
  } = useFreestyle();

  return (
    <div className="z-10 flex items-center justify-between border-t border-gray-100 bg-white p-4">
      <button
        onClick={handleEndSession}
        className="flex h-12 w-12 items-center justify-center rounded-xl text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
        title="End Session"
      >
        <Square className="h-5 w-5 fill-current" />
      </button>

      <div className="flex flex-1 justify-center">
        {isRecording ? (
          <button
            onClick={submitTurn}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            <Send className="h-6 w-6 ml-1" />
          </button>
        ) : (
          <button
            onClick={startRecording}
            disabled={isProcessing}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 ${
              isProcessing
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : "bg-indigo-600 text-white shadow-md hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg active:translate-y-0"
            }`}
          >
            <Mic className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="flex h-12 w-12 items-center justify-center">
        <button
          onClick={handleRetry}
          disabled={!canRetry}
          className={`flex flex-col items-center justify-center transition-colors ${
            !canRetry
              ? "cursor-not-allowed text-gray-300"
              : "text-amber-500 hover:text-amber-600 hover:scale-105 active:scale-95"
          }`}
          title={`Retry (${retriesLeft} left)`}
        >
          <RotateCcw className="h-5 w-5" />
          <span className="text-[10px] font-bold mt-1">{retriesLeft} left</span>
        </button>
      </div>
    </div>
  );
}