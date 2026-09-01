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

    // 1. Show a loading toast immediately
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
          duration,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      // 2. Update to Success!
      toast.success("Session Complete!", {
        id: toastId, // This replaces the loading toast
        description: "Your review is being generated in the background.",
      });

      onEnd();
    } catch (err) {
      console.error("Failed to submit session for review:", err);

      // 3. Update to Error
      toast.error("Uh oh! Something went wrong.", {
        id: toastId,
        description: "We couldn't save your session. Please try again.",
      });

      isSubmittingRef.current = false;
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
    } catch (err) {
      console.error("Pronunciation assessment failed", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, isAnalyzingPronunciation: false } : m,
        ),
      );
    }
  };

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

        // 🚨 Catches the AI dropping or returning blank text
        if (!data || !data.text || data.text.trim() === "") {
          throw new Error("AI returned empty text");
        }

        // Success: Push the message to the chat
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "assistant",
            text: data.text,
            translation: data.translation,
          },
        ]);

        setIsAiProcessing(false);

        // Play the voice
        await speak(
          data.text,
          session.targetLanguage,
          1.0,
          session.voiceGender,
        );

        // Exit the function entirely on success
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return; // User manually stopped it

        console.error(`AI Turn attempt ${attempt} failed:`, err);

        // If it failed 3 times, reset properly so the user can speak again without it breaking
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
        // Loops back instantly for the next retry
      }
    }
  };

  const submitTurn = async () => {
    const audioBlob = await stopRecording();
    const userText = transcript.trim();

    if (!userText) return;

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

    if (audioBlob) analyzePronunciation(audioBlob, userText, newMsgId);
    handleAiTurn(false, updatedMessages);
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
