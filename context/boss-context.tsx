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
export type ExerciseType = "CONVERSATION" | "MULTIPLE_CHOICE" | "SENTENCE_BUILDER" | "PRONUNCIATION";

export interface PlaylistItem {
  id: string;
  type: ExerciseType;
  instruction: string; // e.g., "Translate this sentence"
  question?: string;
  options?: string[];
  correctAnswer?: string | string[];
  scrambledWords?: string[];
  targetText?: string;
}

export interface BossMessage {
  id: number;
  role: "assistant" | "user" | "exercise" | "system";
  text?: string;
  translation?: string;
  exercise?: PlaylistItem; 
  status?: "pending" | "correct" | "incorrect";
  isAnalyzingPronunciation?: boolean;
}

export type StageStatus = "PLAYING" | "PASSED" | "FAILED";

interface BossFoundationContextType {
  session: any;
  messages: BossMessage[];
  
  // Game Mechanics
  chances: number;
  xp: number;
  currentIndex: number;
  stageStatus: StageStatus;
  
  // Audio & UI States
  isAiProcessing: boolean;
  isProcessing: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  isSpeechLoading: boolean;
  transcript: string;

  // Actions
  submitTurn: () => Promise<void>; // For CONVERSATION / voice input
  submitExerciseAnswer: (answer: any) => Promise<void>; // For Tap-to-select
  handleTimeOut: () => void; // Triggered when the UI timer hits 0
  handleEndSession: () => Promise<void>;
  startRecording: () => void;
  handleReplay: (text: string) => Promise<void>;
}

const BossFoundationContext = createContext<BossFoundationContextType | undefined>(undefined);

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
  session: any; // Must contain scenarioData.playlist
  onEnd: () => void;
  children: ReactNode;
}) {
  // Game State
  const [messages, setMessages] = useState<BossMessage[]>([]);
  const [chances, setChances] = useState(3);
  const [xp, setXp] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stageStatus, setStageStatus] = useState<StageStatus>("PLAYING");

  // Processing State
  const [isAiProcessing, setIsAiProcessing] = useState(false);
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

  const { speak, isPlaying, isLoading: isSpeechLoading, stop: stopAudio } = useSpeak();
  const isProcessing = isPlaying || isAiProcessing || isSpeechLoading;

  // Derived properties from JSON
  const playlist: PlaylistItem[] = session?.scenarioData?.playlist || [];
  const introMessage = session?.scenarioData?.introMessage || "Let's begin your milestone challenge.";

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    startStage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startStage = async () => {
    // Welcome message
    const welcomeMsg: BossMessage = {
      id: Date.now(),
      role: "assistant",
      text: introMessage,
    };
    setMessages([welcomeMsg]);
    await speak(forSpeech(introMessage), session.targetLanguage, 1.0, session.voiceGender);
    
    // Trigger the first item on the playlist
    setTimeout(() => {
      presentNextPlaylistItem(0);
    }, 500);
  };

  // --- 2. GAME LOOP LOGIC ---
  const presentNextPlaylistItem = (index: number) => {
    if (index >= playlist.length) {
      setStageStatus("PASSED");
      handleEndSession(true);
      return;
    }

    const currentItem = playlist[index];
    
    const exerciseMsg: BossMessage = {
      id: Date.now(),
      role: "assistant",
      text: currentItem.instruction,
      exercise: currentItem,
      status: "pending"
    };

    setMessages((prev) => [...prev, exerciseMsg]);
    speak(forSpeech(currentItem.instruction), session.targetLanguage, 1.0, session.voiceGender);
  };

  // --- 3. EVALUATION (TAP-TO-SELECT) ---
  const submitExerciseAnswer = async (userAnswer: any) => {
    if (stageStatus !== "PLAYING") return;
    setIsAiProcessing(true);
    
    const currentItem = playlist[currentIndex];
    
    try {
      // 🚨 Call backend for AI flavor reaction & validation
      const res = await fetch("/api/foundation/boss/evaluate-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: currentItem,
          userAnswer,
          targetLanguage: session.targetLanguage
        }),
      });
      
      const data = await res.json();
      // Expects: { isCorrect: boolean, text: string (e.g., "Good job!" or "Wrong!") }

      processResult(data.isCorrect, data.text, currentItem.id);

    } catch (err) {
      console.error("Evaluation failed", err);
      toast.error("Network error, please try again.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  // --- 4. EVALUATION (VOICE / CONVERSATION) ---
  const submitTurn = async () => {
    if (stageStatus !== "PLAYING") return;
    
    const audioBlob = await stopRecording();
    const userText = transcript.trim();
    if (!userText) return;

    // Record user text visually
    const newMsgId = Date.now();
    setMessages((prev) => [...prev, { id: newMsgId, role: "user", text: userText, isAnalyzingPronunciation: !!audioBlob }]);
    resetSpeechState();
    setIsAiProcessing(true);

    const currentItem = playlist[currentIndex];

    try {
      const res = await fetch("/api/foundation/boss/evaluate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: currentItem,
          userText,
          targetLanguage: session.targetLanguage,
        }),
      });

      const data = await res.json();
      processResult(data.isCorrect, data.text, currentItem.id);
      
    } catch (err) {
      console.error("Failed to evaluate voice turn", err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // --- 5. TIME OUT MECHANIC ---
  const handleTimeOut = () => {
    if (stageStatus !== "PLAYING") return;
    const currentItem = playlist[currentIndex];
    
    // Automatically fail this item
    processResult(false, "Too slow! You ran out of time.", currentItem.id);
  };

  // --- 6. STATE MUTATION (Lives & XP) ---
  const processResult = async (isCorrect: boolean, aiReactionText: string, exerciseId: string) => {
    // 1. Mark the visual bubble as correct/incorrect
    setMessages((prev) => prev.map((m) => 
      m.exercise?.id === exerciseId ? { ...m, status: isCorrect ? "correct" : "incorrect" } : m
    ));

    // 2. Output the AI reaction
    setMessages((prev) => [...prev, { id: Date.now(), role: "assistant", text: aiReactionText }]);
    await speak(forSpeech(aiReactionText), session.targetLanguage, 1.0, session.voiceGender);

    // 3. Update Game State
    if (isCorrect) {
      setXp((prev) => prev + 50);
    } else {
      const newChances = chances - 1;
      setChances(newChances);
      
      if (newChances <= 0) {
        setStageStatus("FAILED");
        handleEndSession(false);
        return;
      }
    }

    // 4. Move to next exercise (if not dead)
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setTimeout(() => presentNextPlaylistItem(nextIndex), 1000);
  };

  // --- 7. SESSION ENDING ---
  const handleEndSession = async (passed = false) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    stopRecording();
    stopAudio();

    const duration = Math.round((Date.now() - sessionStartTime.current) / 1000);
    const toastId = toast.loading("Saving Milestone...", {
      description: "Calculating your final score.",
    });

    try {
      await fetch("/api/foundation/boss/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          passed,
          xp,
          duration,
          chancesRemaining: chances
        }),
      });

      toast.success(passed ? "Milestone Passed!" : "Milestone Failed", { id: toastId });
      onEnd();
    } catch (err) {
      console.error("Failed to submit boss session:", err);
      toast.error("Failed to save progress.", { id: toastId });
      isSubmittingRef.current = false;
    }
  };

  return (
    <BossFoundationContext.Provider
      value={{
        session,
        messages,
        chances,
        xp,
        currentIndex,
        stageStatus,
        isAiProcessing,
        isProcessing,
        isRecording,
        isPlaying,
        isSpeechLoading,
        transcript,
        submitTurn,
        submitExerciseAnswer,
        handleTimeOut,
        handleEndSession: () => handleEndSession(stageStatus === "PASSED"),
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