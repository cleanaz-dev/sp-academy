"use client";
import { VolumeX, Mic } from "lucide-react";
import { useState } from "react";
import { Tooltip } from "react-tooltip";

export const AudioModule = ({ text, language }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakText = (text, language) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 1;
      utterance.pitch = 1;

      // Start speaking
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);

      // Handle when speech ends
      utterance.onend = () => {
        setIsSpeaking(false);
      };

      // Handle errors
      utterance.onerror = () => {
        setIsSpeaking(false);
        alert("An error occurred while speaking.");
      };
    } else {
      alert("Your browser does not support the Web Speech API.");
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={isSpeaking ? stopSpeaking : () => speakText(text, language)}
        className={`rounded-full p-3 transition-all focus:outline-none ${
          isSpeaking
            ? "animate-pulse bg-blue-500 text-white shadow-lg"
            : "bg-white text-slate-800 shadow-md hover:bg-blue-50 hover:text-blue-500"
        }`}
        aria-label={isSpeaking ? "Stop speaking" : "Speak text"}
        data-tooltip-id="speech-button-tooltip"
        data-tooltip-content={isSpeaking ? "Stop Speaking" : "Speak Text"}
      >
        {isSpeaking ? (
          <VolumeX className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" /> // Use a microphone icon for a more professional look
        )}
      </button>

      {/* Tooltip */}
      <Tooltip id="speech-button-tooltip" place="top" className="z-50" />
    </>
  );
};
