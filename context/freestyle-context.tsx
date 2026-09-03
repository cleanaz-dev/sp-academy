"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import { useSpeech } from "@/context/speech-context";
import { useSpeak } from "@/hooks/use-speak";
import { convertBlobToWav } from "@/lib/audio-utils";
import { FreestyleSessionConfig } from "@/components/freestyle/freestyle-wrapper";
import { toast } from "sonner";
import { SuggestionData } from "@/components/freestyle/freestyle-suggestions-panel"; // adjust import path if needed

interface FreestyleContextType {
  session: FreestyleSessionConfig;
  messages: any[];
  isAiProcessing: boolean;
  retriesLeft: number;
  canRetry: boolean;
  isProcessing: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  isSpeechLoading: boolean;
  transcript: string;
  suggestions: SuggestionData | null;
  isSuggestionsLoading: boolean;
  submitTurn: () => Promise<void>;
  handleRetry: () => void;
  handleEndSession: () => Promise<void>;
  startRecording: () => void;
  handleReplay: (text: string) => void;
}

const FreestyleContext = createContext<FreestyleContextType | undefined>(
  undefined,
);

export function FreestyleProvider({
  session,
  onEnd,
  children,
}: {
  session: FreestyleSessionConfig;
  onEnd: () => void;
  children: ReactNode;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [retriesLeft, setRetriesLeft] = useState(3);

  // New States for Suggestions
  const [suggestions, setSuggestions] = useState<SuggestionData | null>(null);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [accumulatedMistakes, setAccumulatedMistakes] = useState<any[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionStartTime = useRef<number>(Date.now());
  const isSubmittingRef = useRef(false);

  const {
    startRecording: startSpeech,
    stopRecording,
    isRecording,
    transcript,
    resetSpeechState,
  } = useSpeech();
  const {
    speak,
    isPlaying,
    isLoading: isSpeechLoading,
    stop: stopAudio,
  } = useSpeak();

  const isProcessing = isPlaying || isAiProcessing || isSpeechLoading;
  const canRetry =
    retriesLeft > 0 && (isRecording || messages.some((m) => m.role === "user"));

  // Initial greeting
  useEffect(() => {
    handleAiTurn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEndSession = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    stopRecording();
    stopAudio();

    const duration = Math.round((Date.now() - sessionStartTime.current) / 1000);
    const toastId = toast.loading("Saving session...", {
      description: "Sending your conversation to the AI for review.",
    });

    try {
      const res = await fetch("/api/freestyle/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...session,
          sessionId: session.id,
          messages,
          mistakes: accumulatedMistakes,
          duration,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      toast.success("Session Complete!", {
        id: toastId,
        description: "Your review is being generated in the background.",
      });

      onEnd();
    } catch (err) {
      console.error("Failed to submit session for review:", err);
      toast.error("Uh oh! Something went wrong.", {
        id: toastId,
        description: "We couldn't save your session. Please try again.",
      });
      isSubmittingRef.current = false;
    }
  };

  // 🚨 3. NEW MINI-JOB: Evaluates grammar in the background
  const evaluateUserTurn = async (userText: string, messageId: number, pronunciationData: any = null) => {
  try {
    const res = await fetch("/api/freestyle/evaluate-turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userText,
        targetLanguage: session.targetLanguage,
        nativeLanguage: session.nativeLanguage,
        level: session.level,
        pronunciationData, // 👈 PASS THIS TO YOUR ENDPOINT
      }),
    });

      if (!res.ok) return;

      const data = await res.json();

      if (data.hasMistakes && data.corrections?.length > 0) {
        // Tag the corrections with the messageId so we know exactly when they happened
        const taggedMistakes = data.corrections.map((correction: any) => ({
          ...correction,
          userMessageId: messageId,
          timestamp: Date.now(),
        }));

        setAccumulatedMistakes((prev) => [...prev, ...taggedMistakes]);
      }
    } catch (err) {
      console.error("Background evaluation failed silently:", err);
    }
  };

  const analyzePronunciation = async (
    audioBlob: Blob,
    text: string,
    messageId: number,
  ) => {
    try {
      const wavBlob = await convertBlobToWav(audioBlob);
      const formData = new FormData();
      formData.append("audio", wavBlob, "recording.wav");
      formData.append("transcript", text);
      formData.append("language", session.targetLanguage);

      const res = await fetch("/api/pronunciation-assessment", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Pronunciation assessment failed");

      const scoreData = await res.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                pronunciationScore: scoreData,
                isAnalyzingPronunciation: false,
              }
            : m,
        ),
      );

      return scoreData;
    } catch (err) {
      console.error("Pronunciation assessment failed", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, isAnalyzingPronunciation: false } : m,
        ),
      );
      return null;
    }
  };

  // 🚨 New Function to Fetch Suggestions in the background
  const generateSuggestions = async (updatedHistory: any[]) => {
    setIsSuggestionsLoading(true);
    try {
      const res = await fetch("/api/freestyle/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLanguage: session.targetLanguage,
          nativeLanguage: session.nativeLanguage,
          chatHistory: updatedHistory,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (e) {
      console.error("Failed to fetch suggestions", e);
    } finally {
      setIsSuggestionsLoading(false);
    }
  };

  // 🚨 Updated Retry Loop with Suggestions Trigger
  const handleAiTurn = async (isOpening = false, chatHistory: any[] = []) => {
    setIsAiProcessing(true);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    let attempt = 0;
    const maxRetries = 3;

    while (attempt < maxRetries) {
      attempt++;
      try {
        const res = await fetch("/api/freestyle/chat", {
          method: "POST",
          body: JSON.stringify({ ...session, chatHistory, isOpening }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) throw new Error("Network/API failure");

        const data = await res.json();

        if (!data || !data.text || data.text.trim() === "") {
          throw new Error("AI returned empty text");
        }

        // Create the new message object
        const newAiMessage = {
          id: Date.now(),
          role: "assistant",
          text: data.text,
          translation: data.translation,
        };

        // Push to messages
        setMessages((prev) => [...prev, newAiMessage]);
        setIsAiProcessing(false);

        // 🚨 Fetch suggestions in the background right now
        generateSuggestions([...chatHistory, newAiMessage]);

        // 🚨 Play the voice (this happens at the exact same time as generating hints)
        await speak(
          data.text,
          session.targetLanguage,
          1.0,
          session.voiceGender,
        );

        return; // Exit on success
      } catch (err: any) {
        if (err.name === "AbortError") return;

        console.error(`AI Turn attempt ${attempt} failed:`, err);

        if (attempt >= maxRetries) {
          setIsAiProcessing(false);
          toast.error("Connection failed", {
            description: "Please try speaking again.",
          });

          if (!isOpening) {
            setMessages((prev) => {
              const newMsgs = [...prev];
              if (newMsgs[newMsgs.length - 1]?.role === "user") {
                newMsgs.pop();
              }
              return newMsgs;
            });
          }
          return;
        }
      }
    }
  };

const submitTurn = async () => {
    const audioBlob = await stopRecording();
    const userText = transcript.trim();

    if (!userText) return;

    // Clear old suggestions while user is submitting
    setSuggestions(null);

    const newMsgId = Date.now();
    const newMsg = {
      id: newMsgId,
      role: "user",
      text: userText,
      isAnalyzingPronunciation: !!audioBlob,
      pronunciationScore: undefined,
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    resetSpeechState();

    // 1. Instantly get AI response (No UI blocking)
    handleAiTurn(false, updatedMessages);

    // 2. Chain Pronunciation -> Evaluation in the background 
    (async () => {
      let pronunData = null;
      if (audioBlob) {
        pronunData = await analyzePronunciation(audioBlob, userText, newMsgId);
      }
      await evaluateUserTurn(userText, newMsgId, pronunData);
    })();
  };

  const handleRetry = () => {
    if (retriesLeft <= 0) return;
    setRetriesLeft((prev) => prev - 1);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    stopAudio();
    setIsAiProcessing(false);

    if (isRecording) {
      stopRecording();
      resetSpeechState();
    } else {
      setMessages((prev) => {
        const lastUserIndex = prev.map((m) => m.role).lastIndexOf("user");
        return lastUserIndex !== -1 ? prev.slice(0, lastUserIndex) : prev;
      });
    }
  };

  return (
    <FreestyleContext.Provider
      value={{
        session,
        messages,
        isAiProcessing,
        retriesLeft,
        canRetry,
        isProcessing,
        isRecording,
        isPlaying,
        isSpeechLoading,
        transcript,
        suggestions,
        isSuggestionsLoading,
        submitTurn,
        handleRetry,
        handleEndSession,
        startRecording: () => startSpeech(session.targetLanguage),
        handleReplay: (text: string) =>
          speak(text, session.targetLanguage, 1.0, session.voiceGender),
      }}
    >
      {children}
    </FreestyleContext.Provider>
  );
}

export function useFreestyle() {
  const context = useContext(FreestyleContext);
  if (context === undefined) {
    throw new Error("useFreestyle must be used within a FreestyleProvider");
  }
  return context;
}
