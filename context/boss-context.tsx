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

export type ExerciseType =
  | "CONVERSATION"
  | "MULTIPLE_CHOICE"
  | "SENTENCE_BUIL"
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
  id: number | string;
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

  const sessionStartTime = useRef(Date.now());

  /*
   * Immediate refs are used as locks because React state updates are async.
   * They prevent two submissions/timeouts from entering the result pipeline.
   */
  const resultPipelineRef = useRef(false);
  const startExercisesRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const mountedRef = useRef(true);

  /*
   * Incrementing this invalidates an older async sequence.
   * For example, pressing "skip intro" invalidates the intro speech sequence.
   */
  const sequenceRef = useRef(0);

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

  /**
   * Plays a native Audio element and resolves only when:
   * - playback emits `ended`,
   * - playback emits `error`, or
   * - playback is interrupted and emits `pause`.
   *
   * The pause handler ignores the pause event produced after natural ending.
   */
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

        const handleEnded = () => {
          finish();
        };

        const handleError = () => {
          fail();
        };

        const handlePause = () => {
          /*
           * A natural ending may also produce a pause event.
           * In that case `audio.ended` is true, so ended handles it.
           */
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

      /*
       * useSpeak.speak must resolve on actual audio ended/interruption,
       * not merely after the TTS request returns.
       */
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

      void stopRecording();
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
    [onEnd, session?.id, stopAudio, stopRecording],
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

  /*
   * Initialization:
   * 1. Add intro message.
   * 2. Speak intro.
   * 3. Do not inject an exercise until the user starts.
   */
  useEffect(() => {
    mountedRef.current = true;
    const sequence = ++sequenceRef.current;

    const startStage = async () => {
      const welcomeMessage: BossMessage = {
        id: `intro-${Date.now()}`,
        role: "assistant",
        text: introMessage,
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
        /*
         * An interruption is expected when the user presses skip/start.
         */
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
    /*
     * Immediate guard: multiple clicks cannot inject exercise zero twice.
     */
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

  /**
   * Central result pipeline:
   *
   * 1. Acquire immediate ref lock.
   * 2. Mark exercise correct/incorrect.
   * 3. Add reaction message.
   * 4. Start and await speech until ended/interrupted.
   * 5. Apply score/chance result.
   * 6. Wait for an intentional pause.
   * 7. Inject the next exercise.
   */
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
          /*
           * Add the reaction to the UI before speech starts.
           */
          setMessages((previous) => [
            ...previous,
            {
              id: `reaction-${Date.now()}-${exerciseId}`,
              role: "assistant",
              text: reaction,
            },
          ]);

          /*
           * This await must represent actual playback completion or
           * interruption. If useSpeak does not currently behave that
           * way, update it as shown after this file.
           */
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
            await handleEndSession(false);
            return;
          }
        }

        const nextIndex = currentIndexRef.current + 1;

        currentIndexRef.current = nextIndex;
        setCurrentIndex(nextIndex);

        /*
         * Short intentional silence after the reaction has finished.
         */
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
        /*
         * If speech was deliberately interrupted, continuing is safe.
         * Actual speech failures also should not permanently block the game.
         */
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

        /*
         * Only the sequence that acquired the lock may release it.
         */
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
      /*
       * Check and acquire the immediate lock before any await.
       */
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
        await stopRecording();
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

        /*
         * Release the request lock immediately before handing ownership
         * to processResult. processResult reacquires it synchronously.
         */
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
      stopRecording,
    ],
  );

  const submitTurn = useCallback(async () => {
    if (
      resultPipelineRef.current ||
      stageStatusRef.current !== "PLAYING"
    ) {
      return;
    }

    /*
     * Acquire before stopRecording() because that operation is async.
     */
    resultPipelineRef.current = true;

    const currentItem = playlist[currentIndexRef.current];

    if (!currentItem) {
      resultPipelineRef.current = false;
      return;
    }

    try {
      const audioBlob = await stopRecording();
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
    playlist,
    processResult,
    resetSpeechState,
    stopRecording,
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

    /*
     * processResult acquires the lock synchronously before its first await.
     */
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

          startSpeech(bcp47Language);
        },
        resetRecording: resetSpeechState,
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