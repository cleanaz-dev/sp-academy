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
import { FoundationSuggestionData } from "@/components/freestyle/freestyle-suggestions-panel";

// How many times the learner may reveal a suggestion per session
const MAX_SUGGESTIONS = 3;

// Emojis show in the chat bubble but must not reach text-to-speech
const forSpeech = (text: string) =>
  text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();

interface FoundationContextType {
  session: FreestyleSessionConfig;
  messages: any[];
  isAiProcessing: boolean;
  canRetry: boolean;
  isProcessing: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  isSpeechLoading: boolean;
  transcript: string;

  // suggestions
  suggestions: FoundationSuggestionData | null;
  isSuggestionsLoading: boolean;
  isSuggestionVisible: boolean;
  suggestionsLeft: number;
  canSuggest: boolean;
  handleGetSuggestion: () => void;

  submitTurn: () => Promise<void>;
  handleRetry: () => void;
  handleEndSession: () => Promise<void>;
  startRecording: () => void;
  handleReplay: (text: string) => Promise<void>;

  dismissSuggestion: () => void;
}

const FoundationContext = createContext<FoundationContextType | undefined>(
  undefined,
);

export function FoundationProvider({
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
  const [accumulatedMistakes, setAccumulatedMistakes] = useState<any[]>([]);

  // --- Suggestions state ---
  // `suggestions` = hint for the LATEST AI message (fetched in the background during the AI turn)
  // `isSuggestionVisible` = has the learner spent a use to reveal it
  // `suggestionsUsed` = reveals spent this session (max MAX_SUGGESTIONS)
  const [suggestions, setSuggestions] =
    useState<FoundationSuggestionData | null>(null);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
  const [suggestionsUsed, setSuggestionsUsed] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionStartTime = useRef<number>(Date.now());
  const isSubmittingRef = useRef(false);
  const suggestionRequestIdRef = useRef(0); // ignores late responses from older AI turns
  const usedSuggestionRef = useRef(false); // did this turn use a hint

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

  // Retry is unlimited: available while recording, or once there's a user turn to redo
  const canRetry = isRecording || messages.some((m) => m.role === "user");

  const suggestionsLeft = MAX_SUGGESTIONS - suggestionsUsed;
  const canSuggest =
    suggestionsLeft > 0 &&
    !!suggestions &&
    !isSuggestionVisible &&
    !isAiProcessing;

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
      // 🚨 UPDATED ROUTE: /api/foundation/freestyle/review
      const res = await fetch("/api/foundation/freestyle/review", {
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

  const evaluateUserTurn = async (
  userText: string,
  messageId: number,
  pronunciationData: any = null,
  usedSuggestion = false,
) => {
  try {
    const res = await fetch("/api/foundation/freestyle/evaluate-turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userText,
        targetLanguage: session.targetLanguage,
        nativeLanguage: session.nativeLanguage,
        level: session.level,
        pronunciationData,
        usedSuggestion,
      }),
    });

      if (!res.ok) return;

      const data = await res.json();

      if (data.hasMistakes && data.corrections?.length > 0) {
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

      // (We leave this route as-is since it just uses Azure Speech SDK and doesn't rely on prompts)
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

  // Runs in the background while the AI's reply is being spoken.
  // Only stores the result; the learner spends a use when they tap the lightbulb.
  const generateSuggestions = async (updatedHistory: any[]) => {
    const requestId = ++suggestionRequestIdRef.current;
    setIsSuggestionsLoading(true);
    try {
      // 🚨 UPDATED ROUTE: /api/foundation/freestyle/suggestions
      const res = await fetch("/api/foundation/freestyle/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLanguage: session.targetLanguage,
          nativeLanguage: session.nativeLanguage,
          chatHistory: updatedHistory,
        }),
      });

      // A newer AI turn started while we were waiting, so drop this result
      if (requestId !== suggestionRequestIdRef.current) return;

      if (res.ok) {
        const data = await res.json();
        if (data?.starter) setSuggestions(data);
      }
    } catch (e) {
      console.error("Failed to fetch suggestions", e);
    } finally {
      if (requestId === suggestionRequestIdRef.current) {
        setIsSuggestionsLoading(false);
      }
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
        // 🚨 UPDATED ROUTE: /api/foundation/freestyle/chat
        const res = await fetch("/api/foundation/freestyle/chat", {
          method: "POST",
          body: JSON.stringify({ ...session, chatHistory, isOpening }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) throw new Error("Network/API failure");

        const data = await res.json();

        if (!data || !data.text || data.text.trim() === "") {
          throw new Error("AI returned empty text");
        }

        const newAiMessage = {
          id: Date.now(),
          role: "assistant",
          text: data.text,
          translation: data.translation,
        };

        setMessages((prev) => [...prev, newAiMessage]);
        setIsAiProcessing(false);

        // New AI message = new turn: put the header back to the intro
        // and fetch a fresh suggestion for this message.
        setSuggestions(null);
setIsSuggestionVisible(false);
usedSuggestionRef.current = false;
generateSuggestions([...chatHistory, newAiMessage]);

        await speak(
          forSpeech(data.text),
          session.targetLanguage,
          1.0,
          session.voiceGender,
        );

        return;
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

  const usedSuggestion = usedSuggestionRef.current;

  const newMsgId = Date.now();
  const newMsg = {
    id: newMsgId,
    role: "user",
    text: userText,
    usedSuggestion,
    isAnalyzingPronunciation: !!audioBlob,
    pronunciationScore: undefined,
  };

  const updatedMessages = [...messages, newMsg];
  setMessages(updatedMessages);
  setIsSuggestionVisible(false); // bubble leaves once they answer
  resetSpeechState();

  handleAiTurn(false, updatedMessages);

  (async () => {
    let pronunData = null;
    if (audioBlob) {
      pronunData = await analyzePronunciation(audioBlob, userText, newMsgId);
    }
    await evaluateUserTurn(userText, newMsgId, pronunData, usedSuggestion);
  })();
};

  // Unlimited retries. Suggestions are left untouched: after a retry the
  // learner is answering the same AI message, so its hint (and whether they
  // already revealed it) still applies.
const handleRetry = () => {
  if (abortControllerRef.current) abortControllerRef.current.abort();
  stopAudio();
  setIsAiProcessing(false);

  if (usedSuggestionRef.current && suggestions) {
    setIsSuggestionVisible(true);
  }

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

const handleGetSuggestion = () => {
  if (!canSuggest) return;
  setSuggestionsUsed((n) => n + 1);
  usedSuggestionRef.current = true;
  setIsSuggestionVisible(true);
};

// Hides the bubble only. The use is NOT refunded and the turn stays flagged.
const dismissSuggestion = () => setIsSuggestionVisible(false);

  

  return (
    <FoundationContext.Provider
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
        suggestions,
        isSuggestionsLoading,
        isSuggestionVisible,
        suggestionsLeft,
        canSuggest,
        handleGetSuggestion,
        submitTurn,
        handleRetry,
        handleEndSession,
        dismissSuggestion,
        startRecording: () => startSpeech(session.targetLanguage),
        handleReplay: (text: string) =>
          speak(forSpeech(text), session.targetLanguage, 1.0, session.voiceGender),
      }}
    >
      {children}
    </FoundationContext.Provider>
  );
}

// 🚨 UPDATED HOOK EXPORT
export function useFoundation() {
  const context = useContext(FoundationContext);
  if (context === undefined) {
    throw new Error("useFoundation must be used within a FoundationProvider");
  }
  return context;
}