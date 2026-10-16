"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useSpeech } from "@/context/speech-context";
import { useSpeak } from "@/hooks/use-speak";
import { toast } from "sonner";

// --- TYPES ---
export type ExerciseType =
  | "CONVERSATION"
  | "MULTIPLE_CHOICE"
  | "SENTENCE_BUILDER"
  | "PRONUNCIATION"
  | "LISTEN_SENTENCE_BUILDER"
  | "LISTEN_PICTURE_SELECTOR";

export interface ImageOption {
  label: string;
  imageKey: string;
}

export interface PlaylistItem {
  id: string;
  type: ExerciseType;
  instruction: string;
  sourceLessonId?: string | null;
  question?: string | null;
  options?: string[] | null;
  correctAnswer?: string | string[] | null;
  scrambledWords?: string[] | null;
  targetText?: string | null;
  audioKey?: string | null;
  imageOptions?: ImageOption[] | null;
}

export interface BossPersona {
  name: string;
  persona: string;
  introMessage: string;
  avatarKey?: string | null;
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
  boss: BossPersona | null;
  messages: BossMessage[];

  // Game Mechanics
  chances: number;
  xp: number;
  score: number;
  currentIndex: number;
  totalExercises: number;
  stageStatus: StageStatus;
  hasStartedExercises: boolean;

  // Audio & UI States
  isAiProcessing: boolean;
  isProcessing: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  isSpeechLoading: boolean;
  transcript: string;

  // Actions
  startExercises: () => void;
  submitTurn: () => Promise<void>;
  submitExerciseAnswer: (answer: any) => Promise<void>;
  handleTimeOut: () => void;
  handleEndSession: () => Promise<void>;
  startRecording: () => void;
  resetRecording: () => void;
  handleReplay: (text: string) => Promise<void>;
  playExerciseAudio: (
    audioKey?: string | null,
    fallbackText?: string | null,
  ) => Promise<void>;
  resolveAssetUrl: (key?: string | null) => string;
}

const BossFoundationContext = createContext<
  BossFoundationContextType | undefined
>(undefined);

const LANGUAGE_CODES: Record<string, string> = {
  FRENCH: "fr-FR",
  SPANISH: "es-ES",
  GERMAN: "de-DE",
  ITALIAN: "it-IT",
};

const forSpeech = (text: string) =>
  text
    .replace(/\*[^*]+\*/g, "")
    .replace(/[«»]/g, "")
    .replace(
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu,
      "",
    )
    .replace(/\s{2,}/g, " ")
    .trim();

export const resolveAssetUrl = (key?: string | null): string => {
  if (!key) return "";
  if (
    key.startsWith("http://") ||
    key.startsWith("https://") ||
    key.startsWith("/")
  )
    return key;
  const baseUrl = (
    process.env.NEXT_PUBLIC_S3_CDN_URL ||
    process.env.NEXT_PUBLIC_ASSET_URL ||
    ""
  ).replace(/\/$/, "");
  return baseUrl ? `${baseUrl}/${key}` : `/${key}`;
};

function checkDeterministicAnswer(
  item: PlaylistItem,
  userAnswer: any,
): boolean {
  if (
    item.type === "MULTIPLE_CHOICE" ||
    item.type === "LISTEN_PICTURE_SELECTOR"
  ) {
    return String(userAnswer).trim() === String(item.correctAnswer).trim();
  }
  if (
    item.type === "SENTENCE_BUILDER" ||
    item.type === "LISTEN_SENTENCE_BUILDER"
  ) {
    if (!Array.isArray(userAnswer) || !Array.isArray(item.correctAnswer))
      return false;
    return (
      userAnswer.length === item.correctAnswer.length &&
      userAnswer.every(
        (word, idx) => word.trim() === item.correctAnswer![idx].trim(),
      )
    );
  }
  return false;
}

export function BossFoundationProvider({
  session,
  onEnd,
  preloadedKeys, // <--- ADD THIS
  preloadedUrls, // <--- ADD THIS
  children,
}: {
  session: any;
  onEnd: () => void;
  preloadedKeys: (string | undefined)[];
  preloadedUrls: string[];
  children: ReactNode;
}) {
  const [messages, setMessages] = useState<BossMessage[]>([]);
  const [chances, setChances] = useState(3);
  const [xp, setXp] = useState(0);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stageStatus, setStageStatus] = useState<StageStatus>("PLAYING");
  const [hasStartedExercises, setHasStartedExercises] = useState(false);

  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const sessionStartTime = useRef<number>(Date.now());
  const isSubmittingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentIndexRef = useRef(0);
  const chancesRef = useRef(3);
  const scoreRef = useRef(0);
  const stageStatusRef = useRef<StageStatus>("PLAYING");

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  useEffect(() => {
    chancesRef.current = chances;
  }, [chances]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    stageStatusRef.current = stageStatus;
  }, [stageStatus]);

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

  const bcp47Language =
    LANGUAGE_CODES[session?.targetLanguage] ||
    session?.targetLanguage ||
    "fr-FR";
  const scenarioData = (session?.scenarioData as any) || {};
  const boss: BossPersona | null = scenarioData.boss || session?.boss || null;
  const playlist: PlaylistItem[] =
    scenarioData.exerciseBank ||
    scenarioData.playlist ||
    session?.exerciseBank ||
    session?.playlist ||
    [];
  const introMessage =
    boss?.introMessage ||
    scenarioData.introMessage ||
    session?.introMessage ||
    "Let's begin your milestone challenge.";

  const resolveAssetUrl = useCallback((key?: string | null): string => {
    if (!key) return "";
    // If it's already a full URL, just return it
    if (key.startsWith("http://") || key.startsWith("https://") || key.startsWith("blob:")) return key;

    // Convert null to undefined so TypeScript allows the indexOf check
    const index = preloadedKeys.indexOf(key ?? undefined);
    
    if (index !== -1 && preloadedUrls[index]) {
      return preloadedUrls[index];
    }

    // Fallback just in case
    const baseUrl = (process.env.NEXT_PUBLIC_S3_CDN_URL || process.env.NEXT_PUBLIC_ASSET_URL || "").replace(/\/$/, "");
    return baseUrl ? `${baseUrl}/${key}` : `/${key}`;
  }, [preloadedKeys, preloadedUrls]);

  const playExerciseAudio = useCallback(
    async (audioKey?: string | null, fallbackText?: string | null) => {
      if (audioKey) {
        try {
          if (audioRef.current) audioRef.current.pause();

          // 2. This will now use your preloaded S3 URL instantly!
          const url = resolveAssetUrl(audioKey);

          const audio = new Audio(url);
          audioRef.current = audio;
          await audio.play();
          return;
        } catch (err) {
          console.warn("AudioKey playback failed, falling back to TTS:", err);
        }
      }
      if (fallbackText) {
        await speak(
          forSpeech(fallbackText),
          bcp47Language,
          1.0,
          session?.voiceGender,
        );
      }
    },
    [bcp47Language, session?.voiceGender, speak, resolveAssetUrl],
  );

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    let mounted = true;
    const startStage = async () => {
      const welcomeMsg: BossMessage = {
        id: Date.now(),
        role: "assistant",
        text: introMessage,
      };
      setMessages([welcomeMsg]);
      await speak(
        forSpeech(introMessage),
        bcp47Language,
        1.0,
        session?.voiceGender,
      );
      // NOTE: We no longer auto-trigger presentNextPlaylistItem(0) here!
    };
    startStage();
    return () => {
      mounted = false;
      audioRef.current?.pause();
    };
  }, []);

  // --- 2. GAME LOOP LOGIC ---
  const presentNextPlaylistItem = useCallback(
    (index: number) => {
      if (index >= playlist.length) {
        setStageStatus("PASSED");
        handleEndSession(true);
        return;
      }
      const currentItem = playlist[index];
      const exerciseMsg: BossMessage = {
        id: Date.now() + index,
        role: "assistant",
        text: currentItem.instruction,
        exercise: currentItem,
        status: "pending",
      };
      setMessages((prev) => [...prev, exerciseMsg]);

      if (
        currentItem.type === "LISTEN_SENTENCE_BUILDER" ||
        currentItem.type === "LISTEN_PICTURE_SELECTOR" ||
        (currentItem.type === "PRONUNCIATION" && currentItem.targetText)
      ) {
        playExerciseAudio(currentItem.audioKey, currentItem.targetText);
      }
    },
    [playlist, playExerciseAudio],
  );

  // --- START BUTTON ACTION ---
  const startExercises = useCallback(() => {
    stopAudio(); // Stop Madame Dubois from talking if they skip
    setHasStartedExercises(true);
    presentNextPlaylistItem(0);
  }, [stopAudio, presentNextPlaylistItem]);

  const submitExerciseAnswer = async (userAnswer: any) => {
    if (stageStatusRef.current !== "PLAYING" || isAiProcessing) return;
    if (isRecording) {
      await stopRecording();
      resetSpeechState();
    }
    setIsAiProcessing(true);
    const idx = currentIndexRef.current;
    const currentItem = playlist[idx];

    try {
      const localIsCorrect = checkDeterministicAnswer(currentItem, userAnswer);
      const res = await fetch("/api/foundation/boss/evaluate-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: currentItem,
          userAnswer,
          isCorrect: localIsCorrect,
          bossPersona: boss,
          targetLanguage: bcp47Language,
        }),
      });
      if (!res.ok) throw new Error("Evaluation endpoint failed");
      const data = await res.json();
      const finalIsCorrect =
        typeof data.isCorrect === "boolean" ? data.isCorrect : !!localIsCorrect;
      const reactionText =
        data.text || (finalIsCorrect ? "Bien." : "Non, ce n'est pas exact.");
      await processResult(finalIsCorrect, reactionText, currentItem.id);
    } catch (err) {
      console.error("Evaluation failed", err);
      toast.error("Network error, please try again.");
    } finally {
      setIsAiProcessing(false);
    }
  };

// --- 4. EVALUATION (AZURE PRONUNCIATION + OPENAI VOICE) ---
  const submitTurn = async () => {
    if (stageStatusRef.current !== "PLAYING" || isAiProcessing) return;

    const audioBlob = await stopRecording();
    const userText = transcript.trim();
    
    if (!userText && !audioBlob) return;

    const newMsgId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: newMsgId,
        role: "user",
        text: userText,
        isAnalyzingPronunciation: !!audioBlob,
      },
    ]);
    
    resetSpeechState();
    setIsAiProcessing(true);

    const currentItem = playlist[currentIndexRef.current];

    try {
      let finalIsCorrect = false;

      // 1. Send Audio to Azure to get a pronunciation score!
      if (audioBlob) {
        const formData = new FormData();
        formData.append("audio", audioBlob);
        formData.append("transcript", currentItem.targetText || userText || "bonjour"); 
        formData.append("language", bcp47Language);

        const azureRes = await fetch("/api/foundation/boss/pronunciation", {
          method: "POST",
          body: formData,
        });

        if (azureRes.ok) {
          const azureData = await azureRes.json();
          console.log("Azure Assessment Score:", azureData.score);
          
          // Lowered to 50 for non-native speakers
          const azurePassed = azureData.score >= 50;
          
          // STT Forgiveness: Strip punctuation/accents and check if they basically nailed it
          const cleanTarget = (currentItem.targetText || "").toLowerCase().replace(/[^\w\s]/gi, '');
          const cleanUser = userText.toLowerCase().replace(/[^\w\s]/gi, '');
          const textPassed = cleanUser.length > 2 && (cleanUser.includes(cleanTarget) || cleanTarget.includes(cleanUser));

          // Pass them if EITHER Azure liked the phonemes OR the text is a dead match
          finalIsCorrect = azurePassed || textPassed;
        } else {
          console.warn("Azure failed, falling back to generous mode");
          finalIsCorrect = true; 
        }
      } else {
        finalIsCorrect = true;
      }

      // 2. Send Azure's grade to OpenAI to get Madame Dubois's reaction!
      const llmRes = await fetch("/api/foundation/boss/evaluate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: currentItem,
          userText,
          isCorrect: finalIsCorrect, // Passing the forgiving verdict
          bossPersona: boss,
        }),
      });

      const data = await llmRes.json();
      await processResult(data.isCorrect, data.text, currentItem.id);
    } catch (err) {
      console.error("Failed to evaluate voice turn", err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleTimeOut = useCallback(() => {
    if (stageStatusRef.current !== "PLAYING") return;
    const currentItem = playlist[currentIndexRef.current];
    if (!currentItem) return;
    processResult(false, "Trop lent ! Time is up.", currentItem.id);
  }, [playlist]);

  const processResult = async (
    isCorrect: boolean,
    aiReactionText: string,
    exerciseId: string,
  ) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.exercise?.id === exerciseId
          ? { ...m, status: isCorrect ? "correct" : "incorrect" }
          : m,
      ),
    );
    if (aiReactionText) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "assistant", text: aiReactionText },
      ]);
      await speak(
        forSpeech(aiReactionText),
        bcp47Language,
        1.0,
        session?.voiceGender,
      );
    }
    if (isCorrect) {
      setXp((prev) => prev + 50);
      setScore((prev) => prev + 1);
    } else {
      const newChances = chancesRef.current - 1;
      chancesRef.current = newChances;
      setChances(newChances);
      if (newChances <= 0) {
        setStageStatus("FAILED");
        handleEndSession(false);
        return;
      }
    }
    const nextIndex = currentIndexRef.current + 1;
    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);
    setTimeout(() => presentNextPlaylistItem(nextIndex), 900);
  };

  const handleEndSession = async (passed = false) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    stopRecording();
    stopAudio();
    audioRef.current?.pause();
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
          score: scoreRef.current,
          duration,
          chancesRemaining: chancesRef.current,
        }),
      });
      toast.success(passed ? "Milestone Passed!" : "Milestone Failed", {
        id: toastId,
      });
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
        boss,
        messages,
        chances,
        xp,
        score,
        currentIndex,
        totalExercises: playlist.length,
        stageStatus,
        hasStartedExercises,
        isAiProcessing,
        isProcessing,
        isRecording,
        isPlaying,
        isSpeechLoading,
        transcript,
        startExercises,
        submitTurn,
        submitExerciseAnswer,
        handleTimeOut,
        handleEndSession: () =>
          handleEndSession(stageStatusRef.current === "PASSED"),
        startRecording: () => startSpeech(bcp47Language),
        resetRecording: resetSpeechState,
        handleReplay: (text: string) =>
          speak(forSpeech(text), bcp47Language, 1.0, session?.voiceGender),
        playExerciseAudio,
        resolveAssetUrl,
      }}
    >
      {children}
    </BossFoundationContext.Provider>
  );
}

export function useBossFoundation() {
  const context = useContext(BossFoundationContext);
  if (context === undefined)
    throw new Error(
      "useBossFoundation must be used within a BossFoundationProvider",
    );
  return context;
}
