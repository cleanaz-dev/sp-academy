"use client";

import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from "react";
import type * as sdk from "microsoft-cognitiveservices-speech-sdk";

import { getAzureSpeechToken } from "@/app/actions/azure-speech";
import { PronunciationScore, evaluatePronunciation } from "../lib/azure/index";

interface PronunciationContextProps {
  isRecording: boolean;
  score: PronunciationScore | null;
  error: string | null;
  assessSpeech: (text: string, targetLanguage: string) => Promise<void>;
  cancelAssessment: () => void;
  reset: () => void;
}

const PronunciationContext = createContext<PronunciationContextProps | undefined>(undefined);

export const PronunciationProvider = ({ children }: { children: ReactNode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognizerRef = useRef<sdk.SpeechRecognizer | null>(null);

  const assessSpeech = useCallback(async (text: string, targetLanguage: string) => {
    try {
      setScore(null);
      setError(null);
      const token = await getAzureSpeechToken();
      setIsRecording(true);

      const result = await evaluatePronunciation(text, targetLanguage, token, (recognizer) => {
        recognizerRef.current = recognizer;
      });

      setScore(result);
    } catch (err: any) {
      setError(err.message || err.toString());
    } finally {
      recognizerRef.current = null;
      setIsRecording(false);
    }
  }, []);

  const cancelAssessment = useCallback(() => {
    recognizerRef.current?.close();
    recognizerRef.current = null;
    setIsRecording(false);
  }, []);

  const reset = useCallback(() => {
    setScore(null);
    setError(null);
    setIsRecording(false);
  }, []);

  return (
    <PronunciationContext.Provider value={{ isRecording, score, error, assessSpeech, cancelAssessment, reset }}>
      {children}
    </PronunciationContext.Provider>
  );
};

export const usePronunciation = () => {
  const context = useContext(PronunciationContext);
  if (!context) throw new Error("usePronunciation must be used within a PronunciationProvider");
  return context;
};