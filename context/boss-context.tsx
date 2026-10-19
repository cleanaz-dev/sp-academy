"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useSpeech } from "@/context/speech-context";
import { useSpeak } from "@/hooks/use-speak";
import { toast } from "sonner";

export type ExerciseType =
  | "CONVERSATION"
  | "MULTIPLE_CHOICE"
  | "SENTENCE_BUIL"
  | "SENTENCE_BUILDER"
  | "PRONUNCIATION"
  | "LISTEN_SENTENCE_BUILDER"
  | "LISTEN_PICTURE_SELECTOR";

export type BossMood = "default" | "happy" | "sad" | "angry";

export interface BossAvatar {
  default?: string | null;
  happy?: string | null;
  sad?: string | null;
  angry?: string | null;
}

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
  appearance?: string | null;
  sceneDescription?: string | null;
  avatarKey?: string | null;
  coverUrl?: string | null;
  avatar?: BossAvatar | null;
}

export interface BossMessage {
  id: number | string;
  role: "assistant" | "user" | "exercise" | "system";
  text?: string;
  translation?: string;
  exercise?: PlaylistItem;
  status?: "pending" | "correct" | "incorrect";
  mood?: BossMood;
  isAnalyzingPronunciation?: boolean;
}

export type StageStatus = "PLAYING" | "PASSED" | "FAILED";

interface BossFoundationContextType {
  session: any;
  boss: BossPersona | null;
  messages: BossMessage[];

  bossMood: BossMood;
  bossAvatarUrl: string;
  bossCoverUrl: string;
  getBossAvatarUrl: (mood?: BossMood) => string;

  chances: number;
  xp: number;
  score: number;
  currentIndex: number;
  totalExercises: number;
  stageStatus: StageStatus;
  hasStartedExercises: boolean;

  isAiProcessing: boolean;
  isProcessing: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  isSpeechLoading: boolean;
  transcript: string;

  startExercises: () => void;
  submitTurn: () => Promise<void>;
  submitExerciseAnswer: (answer: any) => Promise<void>;
  handleTimeOut: () => void;
  handleEndSession: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => Promise<void>;
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

const NEXT_EXERCISE_PAUSE_MS = 900;
const FALLBACK_AVATAR =
  "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=boss";

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

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
    key.startsWith("/") ||
    key.startsWith("blob:")
  ) {
    return key;
  }

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
    item.type === "SENTENCE_BUIL" ||
    item.type === "LISTEN_SENTENCE_BUILDER"
  ) {
    if (
      !Array.isArray(userAnswer) ||
      !Array.isArray(item.correctAnswer)
    ) {
      return false;
    }

    return (
      userAnswer.length === item.correctAnswer.length &&
      userAnswer.every(
        (word, index) =>
          String(word).trim() ===
          String(item.correctAnswer?.[index]).trim(),
      )
    );
  }

  return false;
}

export function BossFoundationProvider({
  session,
  onEnd,
  preloadedKeys,
  preloadedUrls,
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
  const [stageStatus, setStageStatus] =
    useState<StageStatus>("PLAYING");
  const [hasStartedExercises, setHasStartedExercises] =
    useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [bossMood, setBossMood] = useState<BossMood>("default");

  const sessionStartTime = useRef(Date.now());

  const resultPipelineRef = useRef(false);
  const startExercisesRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const mountedRef = useRef(true);
  const sequenceRef = useRef(0);

  // Holds the recorded audioBlob when the user clicks "Done Speaking" before "Submit"
  const recordedBlobRef = useRef<Blob | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentIndexRef = useRef(0);
  const chancesRef = useRef(3);
  const xpRef = useRef(0);
  const scoreRef = useRef(0);
  const stageStatusRef = useRef<StageStatus>("PLAYING");

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    chancesRef.current = chances;
  }, [chances]);

  useEffect(() => {
    xpRef.current = xp;
  }, [xp]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    stageStatusRef.current = stageStatus;
  }, [stageStatus]);

  const {
    startRecording: startSpeech,
    stopRecording: stopSpeechRecording,
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

  const isProcessing =
    isPlaying || isAiProcessing || isSpeechLoading;

  const bcp47Language =
    LANGUAGE_CODES[session?.targetLanguage] ||
    session?.targetLanguage ||
    "fr-FR";

  const scenarioData = (session?.scenarioData as any) || {};
  const boss: BossPersona | null =
    scenarioData.boss || session?.boss || null;

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

  const resolveAssetUrl = useCallback(
    (key?: string | null): string => {
      if (!key) return "";

      if (
        key.startsWith("http://") ||
        key.startsWith("https://") ||
        key.startsWith("/") ||
        key.startsWith("blob:")
      ) {
        return key;
      }

      const index = preloadedKeys.indexOf(key);

      if (index !== -1 && preloadedUrls[index]) {
        return preloadedUrls[index];
      }

      const baseUrl = (
        process.env.NEXT_PUBLIC_S3_CDN_URL ||
        process.env.NEXT_PUBLIC_ASSET_URL ||
        ""
      ).replace(/\/$/, "");

      return baseUrl ? `${baseUrl}/${key}` : `/${key}`;
    },
    [preloadedKeys, preloadedUrls],
  );

  // Derive the 4 avatar S3 keys from boss.avatar (or fallback to coverUrl folder path)
  const avatarKeyMap = useMemo(() => {
    const derivedPrefix = boss?.coverUrl
      ? boss.coverUrl
          .replace(/^boss\/covers\//, "boss/avatars/")
          .replace(/\/cover\.png$/, "")
      : null;

    return {
      default:
        boss?.avatar?.default ??
        boss?.avatarKey ??
        (derivedPrefix ? `${derivedPrefix}/default.png` : null),
      happy:
        boss?.avatar?.happy ??
        (derivedPrefix ? `${derivedPrefix}/happy.png` : null),
      sad:
        boss?.avatar?.sad ??
        (derivedPrefix ? `${derivedPrefix}/sad.png` : null),
      angry:
        boss?.avatar?.angry ??
        (derivedPrefix ? `${derivedPrefix}/angry.png` : null),
    };
  }, [boss]);

  const getBossAvatarUrl = useCallback(
    (mood: BossMood = "default"): string => {
      const key = avatarKeyMap[mood] || avatarKeyMap.default;
      return key ? resolveAssetUrl(key) || FALLBACK_AVATAR : FALLBACK_AVATAR;
    },
    [avatarKeyMap, resolveAssetUrl],
  );

  const bossAvatarUrl = useMemo(
    () => getBossAvatarUrl(bossMood),
    [getBossAvatarUrl, bossMood],
  );

  const bossCoverUrl = useMemo(
    () => (boss?.coverUrl ? resolveAssetUrl(boss.coverUrl) : ""),
    [boss?.coverUrl, resolveAssetUrl],
  );

  // Stop recording handler that preserves the audioBlob for when the user clicks "Submit"
  const handleStopRecording = useCallback(async () => {
    try {
      const blob = await stopSpeechRecording();
      if (blob) {
        recordedBlobRef.current = blob;
      }
    } catch (err) {
      console.warn("Error stopping speech recording:", err);
    }
  }, [stopSpeechRecording]);

  const handleResetRecording = useCallback(() => {
    recordedBlobRef.current = null;
    resetSpeechState();
  }, [resetSpeechState]);

  const playNativeAudioUntilSettled = useCallback(
    async (url: string): Promise<void> => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      await new Promise<void>((resolve, reject) => {
        let settled = false;

        const cleanup = () => {
          audio.removeEventListener("ended", handleEnded);
          audio.removeEventListener("error", handleError);
          audio.removeEventListener("pause", handlePause);
        };

        const finish = () => {
          if (settled) return;
          settled = true;
          cleanup();

          if (audioRef.current === audio) {
            audioRef.current = null;
          }

          resolve();
        };

        const fail = () => {
          if (settled) return;
          settled = true;
          cleanup();

          if (audioRef.current === audio) {
            audioRef.current = null;
          }

          reject(new Error("Audio playback failed."));
        };

        const handleEnded = () => finish();
        const handleError = () => fail();
        const handlePause = () => {
          if (!audio.ended) {
            finish();
          }
        };

        audio.addEventListener("ended", handleEnded, { once: true });
        audio.addEventListener("error", handleError, { once: true });
        audio.addEventListener("pause", handlePause);

        audio.play().catch(fail);
      });
    },
    [],
  );

  const playExerciseAudio = useCallback(
    async (
      audioKey?: string | null,
      fallbackText?: string | null,
    ): Promise<void> => {
      if (audioKey) {
        try {
          const url = resolveAssetUrl(audioKey);
          await playNativeAudioUntilSettled(url);
          return;
        } catch (error) {
          console.warn(
            "Audio playback failed, falling back to TTS:",
            error,
          );
        }
      }

      const speechText = fallbackText
        ? forSpeech(fallbackText)
        : "";

      if (!speechText) return;

      await speak(
        speechText,
        bcp47Language,
        1.0,
        session?.voiceGender,
      );
    },
    [
      bcp47Language,
      playNativeAudioUntilSettled,
      resolveAssetUrl,
      session?.voiceGender,
      speak,
    ],
  );

  const handleEndSession = useCallback(
    async (passed = false) => {
      if (isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      resultPipelineRef.current = true;
      sequenceRef.current += 1;

      void stopSpeechRecording();
      stopAudio();

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      const duration = Math.round(
        (Date.now() - sessionStartTime.current) / 1000,
      );

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
            xp: xpRef.current,
            score: scoreRef.current,
            duration,
            chancesRemaining: chancesRef.current,
          }),
        });

        toast.success(
          passed ? "Milestone Passed!" : "Milestone Failed",
          { id: toastId },
        );

        onEnd();
      } catch (error) {
        console.error("Failed to submit boss session:", error);
        toast.error("Failed to save progress.", { id: toastId });

        isSubmittingRef.current = false;
        resultPipelineRef.current = false;
      }
    },
    [onEnd, session?.id, stopAudio, stopSpeechRecording],
  );

  const presentNextPlaylistItem = useCallback(
    (index: number) => {
      if (
        !mountedRef.current ||
        stageStatusRef.current !== "PLAYING"
      ) {
        return;
      }

      if (index >= playlist.length) {
        stageStatusRef.current = "PASSED";
        setStageStatus("PASSED");
        setBossMood("happy");
        void handleEndSession(true);
        return;
      }

      const currentItem = playlist[index];

      const exerciseMessage: BossMessage = {
        id: `exercise-${currentItem.id}-${index}`,
        role: "assistant",
        text: currentItem.instruction,
        exercise: currentItem,
        status: "pending",
      };

      setMessages((previous) => [
        ...previous,
        exerciseMessage,
      ]);

      if (
        currentItem.type === "LISTEN_SENTENCE_BUILDER" ||
        currentItem.type === "LISTEN_PICTURE_SELECTOR" ||
        (currentItem.type === "PRONUNCIATION" &&
          currentItem.targetText)
      ) {
        void playExerciseAudio(
          currentItem.audioKey,
          currentItem.targetText,
        );
      }
    },
    [handleEndSession, playExerciseAudio, playlist],
  );

  useEffect(() => {
    mountedRef.current = true;
    const sequence = ++sequenceRef.current;

    const startStage = async () => {
      const welcomeMessage: BossMessage = {
        id: `intro-${Date.now()}`,
        role: "assistant",
        text: introMessage,
        mood: "default",
      };

      setMessages([welcomeMessage]);

      try {
        await speak(
          forSpeech(introMessage),
          bcp47Language,
          1.0,
          session?.voiceGender,
        );
      } catch (error) {
        console.warn("Intro speech ended or was interrupted:", error);
      }

      if (
        !mountedRef.current ||
        sequence !== sequenceRef.current
      ) {
        return;
      }
    };

    void startStage();

    return () => {
      mountedRef.current = false;
      sequenceRef.current += 1;
      resultPipelineRef.current = true;

      stopAudio();

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, [
    bcp47Language,
    introMessage,
    session?.voiceGender,
    speak,
    stopAudio,
  ]);

  const startExercises = useCallback(() => {
    if (
      startExercisesRef.current ||
      stageStatusRef.current !== "PLAYING"
    ) {
      return;
    }

    startExercisesRef.current = true;
    sequenceRef.current += 1;

    stopAudio();

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setHasStartedExercises(true);
    presentNextPlaylistItem(0);
  }, [presentNextPlaylistItem, stopAudio]);

  const processResult = useCallback(
    async (
      isCorrect: boolean,
      aiReactionText: string,
      exerciseId: string,
    ) => {
      if (
        resultPipelineRef.current ||
        stageStatusRef.current !== "PLAYING"
      ) {
        return;
      }

      resultPipelineRef.current = true;
      setIsAiProcessing(true);

      const sequence = ++sequenceRef.current;

      // Update boss facial expression immediately based on answer & remaining lives
      const nextMood: BossMood = isCorrect
        ? "happy"
        : chancesRef.current - 1 <= 1
          ? "angry"
          : "sad";
      setBossMood(nextMood);

      try {
        setMessages((previous) =>
          previous.map((message) =>
            message.exercise?.id === exerciseId
              ? {
                  ...message,
                  status: isCorrect
                    ? "correct"
                    : "incorrect",
                }
              : message,
          ),
        );

        const reaction = aiReactionText?.trim();

        if (reaction) {
          setMessages((previous) => [
            ...previous,
            {
              id: `reaction-${Date.now()}-${exerciseId}`,
              role: "assistant",
              text: reaction,
              mood: nextMood,
            },
          ]);

          await speak(
            forSpeech(reaction),
            bcp47Language,
            1.0,
            session?.voiceGender,
          );
        }

        if (
          !mountedRef.current ||
          sequence !== sequenceRef.current ||
          stageStatusRef.current !== "PLAYING"
        ) {
          return;
        }

        if (isCorrect) {
          const nextXp = xpRef.current + 50;
          const nextScore = scoreRef.current + 1;

          xpRef.current = nextXp;
          scoreRef.current = nextScore;

          setXp(nextXp);
          setScore(nextScore);
        } else {
          const nextChances = chancesRef.current - 1;

          chancesRef.current = nextChances;
          setChances(nextChances);

          if (nextChances <= 0) {
            stageStatusRef.current = "FAILED";
            setStageStatus("FAILED");
            setBossMood("angry");
            await handleEndSession(false);
            return;
          }
        }

        const nextIndex = currentIndexRef.current + 1;

        currentIndexRef.current = nextIndex;
        setCurrentIndex(nextIndex);

        await wait(NEXT_EXERCISE_PAUSE_MS);

        if (
          !mountedRef.current ||
          sequence !== sequenceRef.current ||
          stageStatusRef.current !== "PLAYING"
        ) {
          return;
        }

        presentNextPlaylistItem(nextIndex);
      } catch (error) {
        console.warn(
          "Reaction playback failed or was interrupted:",
          error,
        );

        if (
          mountedRef.current &&
          sequence === sequenceRef.current &&
          stageStatusRef.current === "PLAYING"
        ) {
          if (isCorrect) {
            const nextXp = xpRef.current + 50;
            const nextScore = scoreRef.current + 1;

            xpRef.current = nextXp;
            scoreRef.current = nextScore;

            setXp(nextXp);
            setScore(nextScore);
          } else {
            const nextChances = chancesRef.current - 1;

            chancesRef.current = nextChances;
            setChances(nextChances);

            if (nextChances <= 0) {
              stageStatusRef.current = "FAILED";
              setStageStatus("FAILED");
              setBossMood("angry");
              await handleEndSession(false);
              return;
            }
          }

          const nextIndex = currentIndexRef.current + 1;

          currentIndexRef.current = nextIndex;
          setCurrentIndex(nextIndex);

          await wait(NEXT_EXERCISE_PAUSE_MS);

          if (
            mountedRef.current &&
            sequence === sequenceRef.current &&
            stageStatusRef.current === "PLAYING"
          ) {
            presentNextPlaylistItem(nextIndex);
          }
        }
      } finally {
        if (mountedRef.current) {
          setIsAiProcessing(false);
        }

        if (sequence === sequenceRef.current) {
          resultPipelineRef.current = false;
        }
      }
    },
    [
      bcp47Language,
      handleEndSession,
      presentNextPlaylistItem,
      session?.voiceGender,
      speak,
    ],
  );

  const submitExerciseAnswer = useCallback(
    async (userAnswer: any) => {
      if (
        resultPipelineRef.current ||
        stageStatusRef.current !== "PLAYING"
      ) {
        return;
      }

      const index = currentIndexRef.current;
      const currentItem = playlist[index];

      if (!currentItem) return;

      resultPipelineRef.current = true;

      if (isRecording) {
        await stopSpeechRecording();
        resetSpeechState();
      }

      setIsAiProcessing(true);

      try {
        const localIsCorrect = checkDeterministicAnswer(
          currentItem,
          userAnswer,
        );

        const response = await fetch(
          "/api/foundation/boss/evaluate-exercise",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              exercise: currentItem,
              userAnswer,
              isCorrect: localIsCorrect,
              bossPersona: boss,
              targetLanguage: bcp47Language,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Evaluation endpoint failed.");
        }

        const data = await response.json();

        const finalIsCorrect =
          typeof data.isCorrect === "boolean"
            ? data.isCorrect
            : localIsCorrect;

        const reactionText =
          data.text ||
          (finalIsCorrect
            ? "Bien."
            : "Non, ce n'est pas exact.");

        resultPipelineRef.current = false;

        await processResult(
          finalIsCorrect,
          reactionText,
          currentItem.id,
        );
      } catch (error) {
        console.error("Evaluation failed:", error);
        toast.error("Network error, please try again.");
        resultPipelineRef.current = false;
        setIsAiProcessing(false);
      }
    },
    [
      bcp47Language,
      boss,
      isRecording,
      playlist,
      processResult,
      resetSpeechState,
      stopSpeechRecording,
    ],
  );

  const submitTurn = useCallback(async () => {
    if (
      resultPipelineRef.current ||
      stageStatusRef.current !== "PLAYING"
    ) {
      return;
    }

    resultPipelineRef.current = true;

    const currentItem = playlist[currentIndexRef.current];

    if (!currentItem) {
      resultPipelineRef.current = false;
      return;
    }

    try {
      // Use the blob captured when "Done Speaking" was clicked, or stop recording now if still active
      let audioBlob = recordedBlobRef.current;
      if (!audioBlob && isRecording) {
        audioBlob = await stopSpeechRecording();
      }
      recordedBlobRef.current = null;

      const userText = transcript.trim();

      if (!userText && !audioBlob) {
        resultPipelineRef.current = false;
        return;
      }

      setMessages((previous) => [
        ...previous,
        {
          id: `user-${Date.now()}`,
          role: "user",
          text: userText,
          isAnalyzingPronunciation: Boolean(audioBlob),
        },
      ]);

      resetSpeechState();
      setIsAiProcessing(true);

      let finalIsCorrect = false;

      if (audioBlob) {
        const formData = new FormData();

        formData.append("audio", audioBlob);
        formData.append(
          "transcript",
          currentItem.targetText || userText || "bonjour",
        );
        formData.append("language", bcp47Language);

        const azureResponse = await fetch(
          "/api/foundation/boss/pronunciation",
          {
            method: "POST",
            body: formData,
          },
        );

        if (azureResponse.ok) {
          const azureData = await azureResponse.json();
          const azurePassed = azureData.score >= 50;

          const cleanTarget = (
            currentItem.targetText || ""
          )
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, "");

          const cleanUser = userText
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, "");

          const textPassed =
            cleanUser.length > 2 &&
            cleanTarget.length > 0 &&
            (cleanUser.includes(cleanTarget) ||
              cleanTarget.includes(cleanUser));

          finalIsCorrect = azurePassed || textPassed;
        } else {
          console.warn(
            "Azure failed, falling back to generous mode.",
          );
          finalIsCorrect = true;
        }
      } else {
        finalIsCorrect = true;
      }

      const llmResponse = await fetch(
        "/api/foundation/boss/evaluate-voice",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exercise: currentItem,
            userText,
            isCorrect: finalIsCorrect,
            bossPersona: boss,
          }),
        },
      );

      if (!llmResponse.ok) {
        throw new Error("Voice evaluation endpoint failed.");
      }

      const data = await llmResponse.json();

      resultPipelineRef.current = false;

      await processResult(
        typeof data.isCorrect === "boolean"
          ? data.isCorrect
          : finalIsCorrect,
        data.text ||
          (finalIsCorrect
            ? "Bien."
            : "Non, ce n'est pas exact."),
        currentItem.id,
      );
    } catch (error) {
      console.error("Failed to evaluate voice turn:", error);
      toast.error("Could not evaluate your answer. Please try again.");
      resultPipelineRef.current = false;
      setIsAiProcessing(false);
    }
  }, [
    bcp47Language,
    boss,
    isRecording,
    playlist,
    processResult,
    resetSpeechState,
    stopSpeechRecording,
    transcript,
  ]);

  const handleTimeOut = useCallback(() => {
    if (
      resultPipelineRef.current ||
      stageStatusRef.current !== "PLAYING"
    ) {
      return;
    }

    const currentItem = playlist[currentIndexRef.current];
    if (!currentItem) return;

    void processResult(
      false,
      "Trop lent ! Time is up.",
      currentItem.id,
    );
  }, [playlist, processResult]);

  const handleReplay = useCallback(
    async (text: string) => {
      const cleanText = forSpeech(text);
      if (!cleanText) return;

      await speak(
        cleanText,
        bcp47Language,
        1.0,
        session?.voiceGender,
      );
    },
    [bcp47Language, session?.voiceGender, speak],
  );

  return (
    <BossFoundationContext.Provider
      value={{
        session,
        boss,
        messages,
        bossMood,
        bossAvatarUrl,
        bossCoverUrl,
        getBossAvatarUrl,
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
          handleEndSession(
            stageStatusRef.current === "PASSED",
          ),
        startRecording: () => {
          if (
            resultPipelineRef.current ||
            stageStatusRef.current !== "PLAYING"
          ) {
            return;
          }
          recordedBlobRef.current = null;
          startSpeech(bcp47Language);
        },
        stopRecording: handleStopRecording,
        resetRecording: handleResetRecording,
        handleReplay,
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

  if (context === undefined) {
    throw new Error(
      "useBossFoundation must be used within a BossFoundationProvider",
    );
  }

  return context;
}