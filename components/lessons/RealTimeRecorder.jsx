"use client";

import { useState, useEffect, useRef } from "react";

export default function RealTimeRecorder() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);
  const [scores, setScores] = useState(null);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const transcriptRef = useRef(""); // Add this ref to track transcript
  const MAX_DURATION = 30000;

  // Predefined phrase to match against
  const targetPhrase = "My day is going well thank you";

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
          transcriptRef.current += text + " "; // Update the ref
        } else {
          interim = text;
        }
      }

      setTranscript(transcriptRef.current);
      setInterimTranscript(interim);

      const fullTranscript = (transcriptRef.current + interim)
        .trim()
        .toLowerCase();
      if (recording && fullTranscript === targetPhrase.toLowerCase()) {
        stopRecording();
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
      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop();
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript("");
      setInterimTranscript("");
      setScores(null);
      setRecording(true);
      transcriptRef.current = ""; // Reset the transcript ref
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
    recognitionRef.current.stop();

    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    // Wait for audio data and final transcription
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (audioChunksRef.current.length === 0) {
      setError("No audio data captured");
      return;
    }

    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    if (audioBlob.size === 0) {
      setError("Audio Blob is empty");
      return;
    }

    // Use the ref value for the final transcript
    const finalTranscript = transcriptRef.current.trim();
    if (!finalTranscript) {
      setError("No transcription captured");
      return;
    }

    const formData = new FormData();
    formData.append("user_audio_file", audioBlob, "recording.webm");
    formData.append("text", finalTranscript);
    formData.append("dialect", "en-us");

    console.log("Sending FormData:", {
      user_audio_file: {
        size: audioBlob.size,
        type: audioBlob.type,
        name: "recording.webm",
      },
      text: finalTranscript,
      dialect: "en-us",
    });

    try {
      const response = await fetch("/api/analyze-speechace", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setScores(result.data.text_score);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to send recording: " + error.message);
      console.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h2 className="mb-6 text-center text-2xl font-bold">
        Speech Assessment Tool
      </h2>

      {error && (
        <div className="mb-6 rounded bg-red-100 p-3 text-red-700">{error}</div>
      )}

      <div className="mb-6 rounded bg-white p-4 shadow">
        <h3 className="mb-2 text-lg font-semibold">Say This Phrase:</h3>
        <PhraseDisplay
          target={targetPhrase}
          spoken={transcript + interimTranscript}
        />
      </div>

      <div className="mb-6 flex justify-center space-x-4">
        <button
          onClick={startRecording}
          disabled={recording}
          className={`rounded px-6 py-2 font-medium text-white ${
            recording ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } transition-colors`}
        >
          {recording ? "Recording..." : "Start Recording"}
        </button>
        <button
          onClick={stopRecording}
          disabled={!recording}
          className={`rounded px-6 py-2 font-medium text-white ${
            !recording ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
          } transition-colors`}
        >
          Stop
        </button>
      </div>

      {scores && (
        <div className="rounded bg-white p-4 shadow">
          <h3 className="mb-4 text-lg font-semibold">Pronunciation Scores:</h3>

          {/* Word-level scores */}
          <div className="mb-6">
            <h4 className="mb-2 font-medium text-gray-700">Word Scores:</h4>
            <div className="space-y-2">
              {scores.word_score_list.map((wordScore, index) => (
                <WordScoreCard key={index} wordScore={wordScore} />
              ))}
            </div>
          </div>
          {/* Overall scores */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ScoreCard
              title="IELTS"
              score={scores.ielts_score.pronunciation}
              max="9"
            />
            <ScoreCard
              title="PTE"
              score={scores.pte_score.pronunciation}
              max="90"
            />
            <ScoreCard
              title="Speechace"
              score={scores.speechace_score.pronunciation}
              max="100"
            />
            <ScoreCard
              title="TOEIC"
              score={scores.toeic_score.pronunciation}
              max="200"
            />
            <div className="sm:col-span-2">
              <ScoreCard
                title="CEFR Level"
                score={scores.cefr_score.pronunciation}
              />
            </div>
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-sm text-gray-600">
        Max duration: {MAX_DURATION / 1000}s • Best in Chrome/Edge
      </p>
    </div>
  );
}

// PhraseDisplay Component
function PhraseDisplay({ target, spoken }) {
  const targetWords = target.toLowerCase().split(" ");
  const spokenWords = spoken.toLowerCase().split(" ").filter(Boolean);

  return (
    <p className="text-lg">
      {targetWords.map((word, index) => {
        const isMatched = spokenWords
          .slice(0, index + 1)
          .join(" ")
          .includes(word);
        return (
          <span
            key={index}
            className={`mr-2 ${
              isMatched ? "font-medium text-blue-600" : "text-gray-400"
            }`}
          >
            {word}
          </span>
        );
      })}
    </p>
  );
}

// ScoreCard Component
function ScoreCard({ title, score, max }) {
  return (
    <div className="rounded border bg-gray-50 p-3">
      <h4 className="font-medium text-gray-700">{title}</h4>
      <p className="text-xl font-bold text-blue-600">
        {score}
        {max && (
          <span className="text-sm font-normal text-gray-500"> /{max}</span>
        )}
      </p>
    </div>
  );
}

function WordScoreCard({ wordScore }) {
  return (
    <div className="rounded border bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">{wordScore.word}</span>
        <span
          className={`text-sm font-semibold ${
            wordScore.quality_score >= 90
              ? "text-green-600"
              : wordScore.quality_score >= 70
                ? "text-yellow-600"
                : "text-red-600"
          }`}
        >
          {wordScore.quality_score}%
        </span>
      </div>

      {/* Phone scores (optional) */}
      <div className="mt-2 text-sm">
        <div className="grid grid-cols-3 gap-2">
          {wordScore.phone_score_list.map((phoneScore, index) => (
            <div key={index} className="text-gray-600">
              <span className="font-medium">{phoneScore.phone}</span>:{" "}
              {phoneScore.quality_score}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
