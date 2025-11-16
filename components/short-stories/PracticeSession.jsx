// components/practice-vocabulary/PracticeSession.jsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/old-ui/button";
import { Progress } from "@/components/old-ui/progress";
import { toast } from "sonner";

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

export default function PracticeSession({
  sessionId,
  words,
  language,
  storyTitle,
}) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorder = useRef(null);
  const audioContext = useRef(null);
  const audioChunks = useRef([]);

  const currentWord = words[currentWordIndex];

  const startRecording = async () => {
    try {
      setError(null);

      if (isMobileDevice()) {
        // Mobile-specific code
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        mediaRecorder.current = new MediaRecorder(stream);
        audioChunks.current = [];

        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.current.push(event.data);
          }
        };

        mediaRecorder.current.onstop = async () => {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());

          if (audioChunks.current.length > 0) {
            await assessPronunciation();
          } else {
            setError("No audio data recorded");
            toast.error("No audio data recorded");
          }
        };

        mediaRecorder.current.start();
        setIsRecording(true);
        toast.success("Recording started");
      } else {
        // Desktop-specific code
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            sampleSize: 16,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        audioContext.current = new (window.AudioContext ||
          window.webkitAudioContext)({
          sampleRate: 16000,
        });

        mediaRecorder.current = new MediaRecorder(stream, {
          mimeType: "audio/webm",
          audioBitsPerSecond: 128000,
        });

        audioChunks.current = [];

        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.current.push(event.data);
          }
        };

        mediaRecorder.current.onstop = async () => {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());

          if (audioChunks.current.length > 0) {
            await assessPronunciation();
          } else {
            setError("No audio data recorded");
            toast.error("No audio data recorded");
          }
        };

        mediaRecorder.current.start(100);
        setIsRecording(true);
        toast.success("Recording started");
      }
    } catch (error) {
      const errorMessage =
        "Error accessing microphone. Please ensure you have granted permission.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
      setIsRecording(false);
      toast.info("Recording stopped");
    }
  };

  const assessPronunciation = async () => {
    const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("referenceText", currentWord.originalWord);
    formData.append("language", language);

    console.log("Sending Assessment:", {
      word: currentWord.originalWord,
      language: language,
    });

    try {
      const response = await fetch("/api/word-assessment", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Assessment Result:", result);

      if (result.match && result.accuracyScore >= 80) {
        toast.success(`Great pronunciation! 
          Score: ${result.accuracyScore.toFixed(1)}
          Pronunciation: ${result.pronunciationScore.toFixed(1)}
          Fluency: ${result.fluencyScore.toFixed(1)}
        `);
        moveToNextWord();
      } else {
        let errorMessage = "Try again. ";
        if (!result.match) {
          errorMessage += `Expected "${currentWord.originalWord}" but heard "${result.recognizedText}". `;
        }
        errorMessage += `
          Score: ${result.accuracyScore.toFixed(1)}
          Pronunciation: ${result.pronunciationScore.toFixed(1)}
          Fluency: ${result.fluencyScore.toFixed(1)}
        `;
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("Error assessing pronunciation");
      console.error("Assessment Error:", error);
    }
  };

  const moveToNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      setProgress(((currentWordIndex + 1) / words.length) * 100);
    } else {
      toast.success("Practice session completed!");
      // Handle session completion
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{storyTitle}</h2>
        <Progress value={progress} className="w-full" />
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <div className="text-center text-3xl font-bold">
          {currentWord.originalWord}
        </div>
        {currentWord.originalContext && (
          <p className="text-center italic text-gray-600">
            "{currentWord.originalContext}"
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          className={isRecording ? "bg-red-500 hover:bg-red-600" : ""}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
      </div>

      {error && <p className="text-center text-red-500">{error}</p>}
    </div>
  );
}
