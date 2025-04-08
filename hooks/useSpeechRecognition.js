// hooks/useSpeechRecognition.js
import { useState, useEffect, useRef } from "react";

export function useSpeechRecognition({
  targetPhrase,
  onTranscriptChange,
  onMatchTarget,
}) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");

  useEffect(() => {
    if (
      !("SpeechRecognition" in window) &&
      !("webkitSpeechRecognition" in window)
    ) {
      setError("Speech recognition not supported. Use Chrome/Edge.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      let final = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text + " ";
          transcriptRef.current += text + " ";
        } else {
          interim = text;
        }
      }

      setTranscript(transcriptRef.current);
      setInterimTranscript(interim);

      // Call the callback with updated transcript
      onTranscriptChange?.(transcriptRef.current, interim);

      const fullTranscript = (transcriptRef.current + interim)
        .trim()
        .toLowerCase();
      if (
        recording &&
        targetPhrase &&
        fullTranscript === targetPhrase.toLowerCase()
      ) {
        onMatchTarget?.();
      }
    };

    recognitionRef.current.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setRecording(false);
    };

    recognitionRef.current.onend = () => {
      if (!recording) return;
      setRecording(false);
    };

    return () => {
      recognitionRef.current?.stop();
    };
  }, [recording, targetPhrase, onTranscriptChange, onMatchTarget]);

  const startRecording = () => {
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    transcriptRef.current = "";
    setRecording(true);
    recognitionRef.current?.start();
  };

  const stopRecording = () => {
    setRecording(false);
    recognitionRef.current?.stop();
  };

  return {
    recording,
    transcript: transcriptRef.current,
    interimTranscript,
    error,
    startRecording,
    stopRecording,
  };
}
