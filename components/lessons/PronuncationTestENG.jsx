"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../old-ui/button";
import { Mic, Check } from "lucide-react";

export default function PronunciationTestENG({ targetText }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);
  const [scores, setScores] = useState(null);
  const [processing, setProcessing] = useState(false); // New state for processing

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const transcriptRef = useRef("");
  const MAX_DURATION = 30000;

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

      const fullTranscript = (transcriptRef.current + interim)
        .trim()
        .toLowerCase();
      if (recording && fullTranscript === targetText.toLowerCase()) {
        stopRecording();
      }
    };

    recognitionRef.current.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setRecording(false);
      setProcessing(false);
    };

    recognitionRef.current.onend = () => {
      if (!recording) return;
      setRecording(false);
    };

    return () => {
      recognitionRef.current?.stop();
      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop();
      }
    };
  }, [recording, targetText]);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript("");
      setInterimTranscript("");
      setScores(null);
      setProcessing(false);
      setRecording(true);
      transcriptRef.current = "";
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.start(1000);
      recognitionRef.current.start();

      setTimeout(() => recording && stopRecording(), MAX_DURATION);
    } catch (err) {
      setError("Failed to start recording: " + err.message);
      setRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !recognitionRef.current) return;

    setRecording(false);
    setProcessing(true); // Start processing state
    recognitionRef.current.stop();

    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (audioChunksRef.current.length === 0) {
      setError("No audio data captured");
      setProcessing(false);
      return;
    }

    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    if (audioBlob.size === 0) {
      setError("Audio Blob is empty");
      setProcessing(false);
      return;
    }

    const finalTranscript = transcriptRef.current.trim();
    if (!finalTranscript) {
      setError("No transcription captured");
      setProcessing(false);
      return;
    }

    const formData = new FormData();
    formData.append("user_audio_file", audioBlob, "recording.webm");
    formData.append("text", finalTranscript);
    formData.append("dialect", "en-us");

    try {
      const response = await fetch("/api/analyze-speechace", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setScores(result.data.text_score);
        const audio = new Audio(
          "https://spoonfed-audiofiles.s3.us-east-1.amazonaws.com/success_notification+(2).mp3",
        );
        audio.play().catch((err) => console.log("Audio play failed:", err));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to send recording: " + error.message);
      console.error(error);
    } finally {
      setProcessing(false); // End processing state
    }
  };

  return (
    <div className="rounded bg-white p-4 shadow">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <PhraseDisplay
            target={targetText}
            spoken={transcript + interimTranscript}
            scores={scores}
          />
        </div>
        <div className="relative">
          {!recording && !scores && !processing ? (
            <Button
              type="button"
              onClick={startRecording}
              disabled={recording}
              className="flex items-center justify-center rounded-full bg-blue-600 p-6 font-medium text-white transition-colors hover:bg-blue-700"
              style={{ width: "64px", height: "64px" }}
            >
              <Mic className="size-6" />
            </Button>
          ) : recording ? (
            <Button
              type="button"
              onClick={stopRecording}
              disabled={!recording}
              className="flex items-center justify-center rounded-full bg-red-600 p-6 font-medium text-white transition-colors hover:bg-red-700"
              style={{ width: "64px", height: "64px" }}
            >
              <Mic className="size-6 animate-pulse" />
            </Button>
          ) : processing ? (
            <Button
              type="button"
              disabled
              className="relative flex items-center justify-center rounded-full bg-gray-600 p-6 font-medium text-white transition-colors"
              style={{ width: "64px", height: "64px" }}
            >
              <Mic className="size-6" />
              <span className="absolute inset-0 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled
              className="animate-scaleCheck flex items-center justify-center rounded-full bg-green-600 p-6 font-medium text-white transition-colors"
              style={{ width: "64px", height: "64px" }}
            >
              <Check className="size-6" />
            </Button>
          )}
        </div>
      </div>
      {error && <div className="mt-2 text-sm text-red-700">{error}</div>}
    </div>
  );
}

function PhraseDisplay({ target, spoken, scores }) {
  const targetWords = target.toLowerCase().split(" ");
  const spokenWords = spoken.toLowerCase().split(" ").filter(Boolean);

  return (
    <div>
      <h2 className="text-lg font-semibold">Practice</h2>
      <p className="text-lg">
        {targetWords.map((word, index) => {
          const isMatched = spokenWords
            .slice(0, index + 1)
            .join(" ")
            .includes(word);
          return (
            <span
              key={index}
              className={`mr-2 ${isMatched ? "font-medium text-blue-600" : "text-gray-400"}`}
            >
              {word}
            </span>
          );
        })}
      </p>
      {scores && (
        <p className="mt-2 font-semibold text-green-600">
          Score: {scores.speechace_score.pronunciation}/100
        </p>
      )}
    </div>
  );
}

// Add this CSS in your global CSS file or a <style> tag in your component
const customStyles = `
  @keyframes scaleCheck {
    0% { transform: scale(1); }
    50% { transform: scale(1.25); }
    100% { transform: scale(1); }
  }
  .animate-scaleCheck {
    animation: scaleCheck 0.5s ease-in-out;
  }
`;
