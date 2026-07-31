"use client";

import React, { createContext, useContext, useState, useRef, ReactNode, useCallback } from "react";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

export const LANGUAGES: Record<string, string> = {
  "en-US": "🇺🇸 English",
  "fr-FR": "🇫🇷 French",
  "es-ES": "🇪🇸 Spanish",
};

interface SpeechContextType {
  language: string;
  setLanguage: (lang: string) => void;
  isRecording: boolean;
  transcript: string;
  audioBlob: Blob | null;
  audioStream: MediaStream | null;
  error: string | null;
  startRecording: (overrideLanguage?: string) => Promise<void>; 
  stopRecording: () => Promise<Blob | null>;
  resetSpeechState: () => void;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

export function SpeechProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState("en-US");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deepgramConnectionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const mimeTypeRef = useRef<string>("audio/webm");
  const finalTranscriptRef = useRef<string>(""); // 🟢 Tracks full accumulated text

  const getSupportedMimeType = (): string => {
    const supportedTypes = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/mp4;codecs=mp4a",
      "audio/aac",
    ];

    for (const type of supportedTypes) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "audio/webm";
  };

  const startRecording = async (overrideLanguage?: string) => {
    resetSpeechState();

    const activeLanguage = overrideLanguage || language;
    if (overrideLanguage) {
      setLanguage(overrideLanguage);
    }

    if (typeof window !== "undefined" && !window.isSecureContext) {
      setError("Recording requires an HTTPS connection.");
      return;
    }

    try {
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
      setAudioStream(stream);

      const tokenResponse = await fetch("/api/deepgram/stt-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLanguage: activeLanguage }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to authenticate STT session.");
      }

      const { token } = await tokenResponse.json();
      if (!token) throw new Error("No authorization token returned.");

      const deepgram = createClient(token);
      
      const connection = deepgram.listen.live({
        model: "nova-3",
        language: activeLanguage,
        smart_format: true,
        interim_results: true,
        endpointing: 500,
      });

      deepgramConnectionRef.current = connection;

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 16000,
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (e) => {
        if (e.data.size > 0 && connection.getReadyState() === 1) {
          const arrayBuffer = await e.data.arrayBuffer();
          connection.send(arrayBuffer);
          audioChunksRef.current.push(e.data);
        }
      };

      connection.on(LiveTranscriptionEvents.Open, () => {
        mediaRecorder.start(250);
        setIsRecording(true);

        audioIntervalRef.current = setInterval(() => {
          if (connection.getReadyState() === 1) {
            connection.keepAlive();
          }
        }, 5000);
      });

      // 🟢 UPDATED: Accumulate finalized transcript + show live interim
      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const receivedTranscript = data.channel?.alternatives?.[0]?.transcript;

        if (receivedTranscript && receivedTranscript.trim() !== "") {
          if (data.is_final) {
            finalTranscriptRef.current = finalTranscriptRef.current
              ? `${finalTranscriptRef.current.trim()} ${receivedTranscript.trim()}`
              : receivedTranscript.trim();
            
            setTranscript(finalTranscriptRef.current);
          } else {
            setTranscript(
              finalTranscriptRef.current
                ? `${finalTranscriptRef.current} ${receivedTranscript.trim()}`
                : receivedTranscript.trim()
            );
          }
        }
      });

      connection.on(LiveTranscriptionEvents.Error, (err) => {
        console.error("Deepgram Error:", err);
        setError(`Transcription Error: ${err.message || "Unknown error"}`);
        stopRecording();
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        setIsRecording(false);
      });

    } catch (err: any) {
      console.error("Failed to start recording:", err);
      let msg = "Failed to start recording.";
      if (err.name === "NotAllowedError") msg = "🎤 Permission denied. Please allow microphone access.";
      else if (err.name === "NotFoundError") msg = "🎤 No microphone device found.";
      else if (err.message) msg = err.message;
      
      setError(msg);
      setIsRecording(false);
    }
  };

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      setIsRecording(false);

      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }

      if (deepgramConnectionRef.current) {
        try {
          deepgramConnectionRef.current.finish();
        } catch (e) {
          console.warn("Deepgram finish error:", e);
        }
        deepgramConnectionRef.current = null;
      }

      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.onstop = () => {
          const finalBlob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current });
          setAudioBlob(finalBlob);
          resolve(finalBlob);
        };
        mediaRecorderRef.current.stop();
      } else {
        const finalBlob = audioChunksRef.current.length > 0 
          ? new Blob(audioChunksRef.current, { type: mimeTypeRef.current }) 
          : null;
        setAudioBlob(finalBlob);
        resolve(finalBlob);
      }
    });
  }, [audioStream]);

  const resetSpeechState = () => {
    setTranscript("");
    setError(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
    finalTranscriptRef.current = ""; // 🟢 Reset accumulated text
  };

  return (
    <SpeechContext.Provider
      value={{
        language,
        setLanguage,
        isRecording,
        transcript,
        audioBlob,
        audioStream,
        error,
        startRecording,
        stopRecording,
        resetSpeechState,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeech() {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error("useSpeech must be used within a SpeechProvider");
  }
  return context;
}

