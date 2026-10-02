"use client";

import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from "react";
import type * as sdk from "microsoft-cognitiveservices-speech-sdk";

import { getAzureSpeechToken } from "@/app/actions/azure-speech";
import { PronunciationScore, evaluatePronunciation } from "../lib/azure/index";

export type AssessmentStatus = "idle" | "listening" | "analyzing";

interface PronunciationContextProps {
  status: AssessmentStatus;
  isRecording: boolean;
  score: PronunciationScore | null;
  error: string | null;
  assessSpeech: (text: string, targetLanguage: string) => Promise<void>;
  cancelAssessment: () => void;
  reset: () => void;
}

const PronunciationContext = createContext<PronunciationContextProps | undefined>(undefined);

export const PronunciationProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AssessmentStatus>("idle");
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognizerRef = useRef<sdk.SpeechRecognizer | null>(null);

  const assessSpeech = useCallback(async (text: string, targetLanguage: string) => {
    try {
      setScore(null);
      setError(null);
      setStatus("listening");

      const token = await getAzureSpeechToken();

      const result = await evaluatePronunciation(
        text,
        targetLanguage,
        token,
        (recognizer) => {
          recognizerRef.current = recognizer;
        },
        () => {
          // Called when silence is detected
          setStatus("analyzing");
        }
      );

      setScore(result);
    } catch (err: any) {
      setError(typeof err === "string" ? err : err.message || err.toString());
    } finally {
      recognizerRef.current = null;
      setStatus("idle");
    }
  }, []);

  const cancelAssessment = useCallback(() => {
    recognizerRef.current?.close();
    recognizerRef.current = null;
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    setScore(null);
    setError(null);
    setStatus("idle");
  }, []);

  return (
    <PronunciationContext.Provider
      value={{
        status,
        isRecording: status === "listening" || status === "analyzing",
        score,
        error,
        assessSpeech,
        cancelAssessment,
        reset,
      }}
    >
      {children}
    </PronunciationContext.Provider>
  );
};

export const usePronunciation = () => {
  const context = useContext(PronunciationContext);
  if (!context) throw new Error("usePronunciation must be used within a PronunciationProvider");
  return context;
};