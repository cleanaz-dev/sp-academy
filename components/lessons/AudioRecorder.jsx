"use client";

import { useState, useRef } from "react";

export default function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [results, setResults] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = handleStop;
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // Stop recording and process audio
  const handleStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
    setRecording(false);
    mediaRecorderRef.current.stream
      .getTracks()
      .forEach((track) => track.stop());

    // Send to API
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    try {
      const response = await fetch("/api/analyze-pronunciation", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error sending audio to API:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div>
      <h2>Pronunciation Analyzer</h2>
      <button onClick={startRecording} disabled={recording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        Stop Recording
      </button>

      {results && (
        <div>
          <h3>Results:</h3>
          <p>Transcription: {results.transcription}</p>
          <p>Pronunciation Score: {results.pronunciationScore}</p>
          <p>Accuracy Score: {results.accuracyScore}</p>
          <p>Fluency Score: {results.fluencyScore}</p>
          <p>Completeness Score: {results.completenessScore}</p>
        </div>
      )}
    </div>
  );
}
