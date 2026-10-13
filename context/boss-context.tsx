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
import { toast } from "sonner";

// --- TYPES ---
export type ExerciseType = "MULTIPLE_CHOICE" | "SENTENCE_BUILDER" | "PRONUNCIATION" | "IMAGE_MATCH";

export interface BossExercise {
  id: string;
  type: ExerciseType;
  instruction: string;
  question?: string;
  options?: string[];
  scrambledWords?: string[];
  targetText?: string;
}

export interface BossMessage {
  id: number;
  role: "assistant" | "user" | "exercise";
  text?: string;
  translation?: string;
  exercise?: BossExercise; 
  status?: "pending" | "correct" | "incorrect";
  isAnalyzingPronunciation?: boolean;
  pronunciationScore?: any;
}

interface BossFoundationContextType {
  session: any; // Contains standard config + scenarioData (the Boss JSON)
  messages: BossMessage[];
  isAiProcessing: boolean;
  canRetry: boolean;
  isProcessing: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  isSpeechLoading: boolean;
  transcript: string;

  submitTurn: () => Promise<void>;
  submitExerciseAnswer: (exerciseId: string, answer: any) => Promise<void>;
  handleRetry: () => void;
  handleEndSession: () => Promise<void>;
  startRecording: () => void;
  handleReplay: (text: string) => Promise<void>;
}

const BossFoundationContext = createContext<BossFoundationContextType | undefined>(undefined);

// Emojis show in the chat bubble but must not reach text-to-speech
const forSpeech = (text: string) =>
  text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();

export function BossFoundationProvider({
  session,
  onEnd,
  children,
}: {
  session: any;
  onEnd: () => void;
  children: ReactNode;
}) {
  const [messages, setMessages] = useState<BossMessage[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
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

  // Retry is available while recording, or once there's a user turn
  const canRetry = isRecording || messages.some((m) => m.role === "user");

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
    const toastId = toast.loading("Saving Boss Battle...", {
      description: "Calculating your final score.",
    });

    try {
      // 🚨 NEW ROUTE: Boss specific review
      const res = await fetch("/api/foundation/boss/review", {
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

      toast.success("Boss Defeated!", {
        id: toastId,
        description: "Your results have been saved.",
      });

      onEnd();
    } catch (err) {
      console.error("Failed to submit boss session:", err);
      toast.error("Uh oh! Something went wrong.", {
        id: toastId,
        description: "We couldn't save your progress. Please try again.",
      });
      isSubmittingRef.current = false;
    }
  };

  const handleAiTurn = async (isOpening = false, chatHistory: BossMessage[] = []) => {
    setIsAiProcessing(true);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      // 🚨 NEW ROUTE: Boss specific chat
      const res = await fetch("/api/foundation/boss/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...session, 
          chatHistory, 
          isOpening,
          scenarioData: session.scenarioData // Pass the boss JSON to the AI
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Network/API failure");

      const data = await res.json();

      if (!data || !data.text || data.text.trim() === "") {
        throw new Error("AI returned empty text");
      }

      const newAiMessage: BossMessage = {
        id: Date.now(),
        role: "assistant",
        text: data.text,
        translation: data.translation,
        exercise: data.exercise, // The AI might append an exercise to this turn!
      };

      setMessages((prev) => [...prev, newAiMessage]);
      setIsAiProcessing(false);

      await speak(forSpeech(data.text), session.targetLanguage, 1.0, session.voiceGender);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error(`Boss AI Turn failed:`, err);
      setIsAiProcessing(false);
      toast.error("Connection failed", { description: "Please try speaking again." });
    }
  };

  // 🚨 NEW METHOD: Submitting a mini-game answer
  const submitExerciseAnswer = async (exerciseId: string, userAnswer: any) => {
    setIsAiProcessing(true);
    
    try {
      // 🚨 NEW ROUTE: Boss exercise evaluation
      const res = await fetch("/api/foundation/boss/evaluate-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId,
          userAnswer,
          scenarioData: session.scenarioData,
          chatHistory: messages
        }),
      });
      
      const data = await res.json();
      
      // Expected Data: { isCorrect: boolean, text: string, nextExercise?: BossExercise }

      // 1. Mark the exercise in the chat as visually correct/incorrect
      setMessages((prev) => prev.map((m) => 
        m.exercise?.id === exerciseId 
          ? { ...m, status: data.isCorrect ? "correct" : "incorrect" } 
          : m
      ));

      // 2. Append the AI's verbal reaction (and potentially the next exercise)
      const newAiMessage: BossMessage = {
        id: Date.now(),
        role: "assistant",
        text: data.text,
        exercise: data.nextExercise // If present, the UI will render the next block
      };
      
      setMessages((prev) => [...prev, newAiMessage]);
      
      // 3. Speak the reaction
      await speak(forSpeech(data.text), session.targetLanguage, 1.0, session.voiceGender);

    } catch (err) {
      console.error("Failed to evaluate exercise", err);
      toast.error("Evaluation failed", { description: "Could not check your answer." });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const submitTurn = async () => {
    const audioBlob = await stopRecording();
    const userText = transcript.trim();

    if (!userText) return;

    const newMsgId = Date.now();
    const newMsg: BossMessage = {
      id: newMsgId,
      role: "user",
      text: userText,
      isAnalyzingPronunciation: !!audioBlob,
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    resetSpeechState();

    handleAiTurn(false, updatedMessages);

    // Run pronunciation assessment in background (Optional for boss)
    if (audioBlob) {
      analyzePronunciation(audioBlob, userText, newMsgId);
    }
  };

  const analyzePronunciation = async (audioBlob: Blob, text: string, messageId: number) => {
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
            ? { ...m, pronunciationScore: scoreData, isAnalyzingPronunciation: false }
            : m
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isAnalyzingPronunciation: false } : m))
      );
    }
  };

  const handleRetry = () => {
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
    <BossFoundationContext.Provider
      value={{
        session,
        messages,
        isAiProcessing,
        canRetry,
        isProcessing,
        isRecording,
        isPlaying,
        isSpeechLoading,
        transcript,
        submitTurn,
        submitExerciseAnswer, // <-- New Function Exported
        handleRetry,
        handleEndSession,
        startRecording: () => startSpeech(session.targetLanguage),
        handleReplay: (text: string) =>
          speak(forSpeech(text), session.targetLanguage, 1.0, session.voiceGender),
      }}
    >
      {children}
    </BossFoundationContext.Provider>
  );
}

export function useBossFoundation() {
  const context = useContext(BossFoundationContext);
  if (context === undefined) {
    throw new Error("useBossFoundation must be used within a BossFoundationProvider");
  }
  return context;
}