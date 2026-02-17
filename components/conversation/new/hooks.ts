import { useState, useEffect, useRef, useCallback } from "react";
import {
  Suggestion,
  UseSuggestionsReturn,
  Message,
  VoiceGender,
  Corrections,
} from "./types";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { useMobileDetection } from "@/hooks/use-mobile-detection";

export const useSuggestions = (
  conversationHistory: Message[],
): UseSuggestionsReturn => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = async () => {
    if (conversationHistory.length === 0) {
      setError("No conversation history available");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/conversation/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: conversationHistory,
          targetLanguage: "French", // Pass these from your context
          nativeLanguage: "English",
        }),
      });
      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      setError("Failed to fetch suggestions");
    } finally {
      setIsLoading(false);
    }
  };
 const clearSuggestions = () => {
    setSuggestions([]);
  };

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    clearSuggestions,
    conversationHistory,
  };
};

interface UseConversationProps {
  id: string;
  title: string;
  targetLanguage: string;
  nativeLanguage: string;
  vocabulary: string[];
  dialogue: string;
  user: { id: string };
}

export const useConversation = ({
  id,
  title,
  targetLanguage,
  nativeLanguage,
  vocabulary,
  dialogue,
  user,
}: UseConversationProps) => {
  // State (moved from component)
  const [voiceGender, setVoiceGender] = useState<VoiceGender>("female");
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [conversationRecordId, setConversationRecordId] = useState<
    string | null
  >(null);
  const [translationResult, setTranslationResult] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [speechAceResult, setSpeechAceResult] = useState<any>(null);
  const [isAnalyzingSpeech, setIsAnalyzingSpeech] = useState(false);
  const [audioBase64Map, setAudioBase64Map] = useState<Record<string, string>>(
    {},
  );
  const MAX_CACHED_AUDIO = 10; // Keep last 10 messages

  // With:
  const deepgramConnectionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingTranscriptRef = useRef(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastAudioBlobRef = useRef<Blob | null>(null);
  const lastTranscriptRef = useRef<string | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // Mobile Detection
  const isMobile = useMobileDetection();


  interface ReplyApiResponse {
  messageTranslation: string;
  targetLanguage: string;   
  nativeLanguage: string;   
  audio: string | null;     
}

interface ScoreApiResponse {
  label?: 'Excellent' | 'Great' | 'Good' | 'OK' | 'Poor';
  score?: number;
  explanation?: string;
  improvedResponse?: string;
  corrections?: Corrections; // Uses your existing Corrections type
}

  // NEW: Cleanup function for old audio
  const cleanupOldAudio = useCallback((currentMessageIds: string[]) => {
    setAudioBase64Map((prev) => {
      const newMap: Record<string, string> = {};
      currentMessageIds.forEach((id) => {
        if (prev[id]) newMap[id] = prev[id];
      });
      return newMap;
    });
  }, []);

  // Helper functions (all moved from component)
  const scrollToBottom = useCallback(() => {
    if (conversationHistory.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationHistory]);

  const getFullLanguageCode = useCallback((lang: string) => {
    const languageMap: Record<string, string> = {
      fr: "fr-FR",
      es: "es-ES",
      en: "en-US",
    };
    return languageMap[lang] || lang;
  }, []);

  const speakPhrase = useCallback(
    (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const fullLangCode = getFullLanguageCode(targetLanguage);
      utterance.lang = fullLangCode;
      window.speechSynthesis.speak(utterance);
    },
    [targetLanguage, getFullLanguageCode],
  );

  const handleAudioPlayback = useCallback(
    async (
      audioBase64: string,
      messageId: string,
      attemptAutoPlay: boolean = true,
    ) => {
      if (isMuted) {
        console.log("🔇 Audio muted, skipping playback setup");
        return;
      }

      try {
        // Store base64 for replay button
        setAudioBase64Map((prev) => {
          const entries = Object.entries(prev);

          // Cleanup oldest if over limit (more reliable way)
          if (entries.length >= MAX_CACHED_AUDIO) {
            // Find oldest by checking keys (assuming messageId includes timestamp)
            const oldestId = entries.find(
              ([id]) => !id.includes(messageId),
            )?.[0];

            if (oldestId) {
              console.log("🧹 Cleaning up old audio:", oldestId);
              const newPrev = { ...prev };
              delete newPrev[oldestId];
              return { ...newPrev, [messageId]: audioBase64 };
            }
          }

          return { ...prev, [messageId]: audioBase64 };
        });

        // Desktop: Try auto-play
        if (attemptAutoPlay && !isMobile) {
          console.log("🖥️ Desktop: Attempting auto-play");
          const url = createAudioUrl(audioBase64);
          const audio = new Audio(url);

          try {
            await audio.play();
            console.log("✅ Desktop auto-play succeeded");

            // Auto-revoke after play
            audio.addEventListener(
              "ended",
              () => {
                URL.revokeObjectURL(url);
                console.log("🗑️ Revoked URL after playback");
              },
              { once: true },
            );

            return; // Success, exit early
          } catch (error) {
            console.log("⚠️ Desktop auto-play failed, showing button");
            URL.revokeObjectURL(url); // Immediate cleanup
          }
        }

        // Mobile or fallback: Just prepare button
        console.log("📱 Mobile: Audio ready for manual playback");
      } catch (error) {
        console.error("❌ Audio setup failed:", error);
        setError("Audio playback failed");
      }
    },
    [isMuted, isMobile, setError, MAX_CACHED_AUDIO],
  ); // ✅ Add MAX_CACHED_AUDIO to deps

  // Helper function
  const createAudioUrl = useCallback((base64: string): string => {
    const cleanBase64 = base64.replace(/^data:audio\/\w+;base64,/, "");
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  }, []);

  const getSupportedMimeType = (): string => {
    const supportedTypes = [
      "audio/webm;codecs=opus", // Best quality, but limited mobile support
      "audio/webm",
      "audio/mp4", // Good mobile support (iOS Safari, Edge)
      "audio/mp4;codecs=mp4a", // AAC codec for better compatibility
      "audio/aac",
    ];

    for (const type of supportedTypes) {
      if (
        typeof MediaRecorder !== "undefined" &&
        MediaRecorder.isTypeSupported(type)
      ) {
        console.log(`✅ Using supported mimeType: ${type}`);
        return type;
      }
    }

    console.warn("⚠️ No preferred mimeType supported, using fallback");
    return "audio/webm"; // Lowest common denominator
  };

  // Effects
  useEffect(() => {
    if (!conversationRecordId) return;

    const fetchConversationHistory = async () => {
      try {
        const response = await fetch(
          `/api/conversation/${conversationRecordId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch history");

        const data = await response.json();
        setConversationHistory(data.messages || []);
      } catch (error) {
        console.error("Error fetching conversation history:", error);
      }
    };

    fetchConversationHistory();
  }, [conversationRecordId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory, scrollToBottom]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
      }, 100);
    }
  }, [conversationHistory]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported");
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = getFullLanguageCode(targetLanguage);

    recognitionInstance.onstart = () => setIsRecording(true);
    recognitionInstance.onend = () => setIsRecording(false);
    recognitionInstance.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserMessage(transcript);
      await handleConversation(transcript);
    };
    recognitionInstance.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      recognitionInstance.stop();
    };
  }, [targetLanguage, getFullLanguageCode]);

  // Handlers
// Inside useConversation.ts

const handleConversation = async (message: string) => {
  setIsProcessing(true);
  setError(null);

  const userMessageId = `user-${Date.now()}`;
  const aiMessageId = `ai-${Date.now()}`;

  // Optimistic UI update
  const initialUserMessage: Message = {
    id: userMessageId,
    role: "user",
    content: message,
    pronunciationScore: speechAceResult,
  };

  // Typing indicator
  const typingMessage: Message = {
    id: aiMessageId,
    role: "assistant",
    content: "",
    isTyping: true,
  };

  setConversationHistory((prev) => [...prev, initialUserMessage, typingMessage]);

  try {
    if (!conversationRecordId) throw new Error("No active conversation");

    // --- PARALLEL REQUESTS ---

    // 1. Reply API
    const replyPromise = fetch("/api/conversation/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: conversationHistory,
        title,
        vocabulary,
        dialogue,
        voiceGender,
        targetLanguage,
        nativeLanguage,
      }),
    });

    // 2. Score API
    const scorePromise = fetch("/api/conversation/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: conversationHistory,
        targetLanguage,
        vocabulary,
        title,
        conversationId: id,
        userId: user.id,
      }),
    });

    // --- HANDLING RESPONSES ---

    // Handle Reply (Audio + Translation)
    const replyResponse = await replyPromise;
    if (!replyResponse.ok) throw new Error("Failed to get reply");

    const replyData: ReplyApiResponse = await replyResponse.json();

    const aiMessage: Message = {
      id: aiMessageId,
      role: "assistant",
      content: replyData.targetLanguage,
      translation: replyData.nativeLanguage,
      isTyping: false,
    };

    setConversationHistory((prev) =>
      prev.map((msg) => {
        if (msg.id === userMessageId) {
          return { ...msg, translation: replyData.messageTranslation };
        }
        if (msg.id === aiMessageId) {
          return aiMessage; // swap typing bubble with real message
        }
        return msg;
      })
    );

    setIsGeneratingAudio(true);
    if (!isMuted && replyData.audio) {
      handleAudioPlayback(replyData.audio, aiMessageId).catch((err) =>
        console.error("Audio playback error:", err)
      );
    }

    // Handle Score
    let scoreData: ScoreApiResponse = {};

    try {
      const scoreResponse = await scorePromise;
      if (scoreResponse.ok) {
        scoreData = await scoreResponse.json();
      }
    } catch (scoreError) {
      console.warn("Scoring failed, continuing without score:", scoreError);
    }

    const finalUserMessage: Message = {
      ...initialUserMessage,
      translation: replyData.messageTranslation,
      score: scoreData.score,
      label: scoreData.label ?? "OK",
      improvedResponse: scoreData.improvedResponse,
      corrections: scoreData.corrections,
    };

    setConversationHistory((prev) =>
      prev.map((msg) => {
        if (msg.id === userMessageId) {
          return finalUserMessage;
        }
        return msg;
      })
    );

    // Save history to DB
    const finalMessagesForDb = [
      ...conversationHistory,
      finalUserMessage,
      aiMessage,
    ];

    const updateResponse = await fetch("/api/conversation/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationRecordId,
        messages: finalMessagesForDb,
        pronunciationScore: speechAceResult,
      }),
    });

    if (!updateResponse.ok) console.warn("Background DB save failed");

  } catch (error) {
    console.error("Conversation Error:", error);
    setError("Failed to process conversation");
    // Remove typing indicator on error
    setConversationHistory((prev) =>
      prev.filter((msg) => msg.id !== aiMessageId)
    );
  } finally {
    setIsProcessing(false);
    setIsGeneratingAudio(false);
    setSuggestions([]);
    setTranslationResult("");
  }
};

  const handleStartConversation = async () => {
    try {
      const response = await fetch("/api/conversation/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: id, userId: user.id }),
      });

      if (!response.ok) throw new Error("Failed to start conversation");

      const data = await response.json();
      setConversationRecordId(data.conversationRecordId);
      setConversationStarted(true);
    } catch (error) {
      console.error("Error starting conversation:", error);
      setError("Failed to start conversation");
    }
  };

  const clearConversationHistory = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/conversation/${conversationRecordId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) throw new Error("Failed to clear history");

      setConversationHistory([]);
      setUserMessage("");
      localStorage.removeItem("currentConversationRecordId");
    } catch (error) {
      console.error("Error clearing history:", error);
      setError("Failed to clear conversation history");
    } finally {
      setIsDeleting(false);
      setConversationStarted(false);
    }
  };

  const getSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const recentMessages = conversationHistory.slice(-3);

      const response = await fetch("/api/conversation/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: recentMessages,
          targetLanguage,
          nativeLanguage,
        }),
      });

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error("Error getting suggestions:", error);
      setError("Failed to get suggestions");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const analyzeAndSaveConversation = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/conversation/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: conversationHistory,
          title,
          vocabulary,
          dialogue,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Success handling here
    } catch (error) {
      console.error("Error saving conversation:", error);
      setError("Failed to save conversation");
    } finally {
      setIsSaving(false);
    }
  };

  const usePhrase = (phrase: string) => {
    handleConversation(phrase);
  };

  const toggleVoiceGender = (checked: boolean) => {
    setVoiceGender(checked ? "male" : "female");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

 const analyzeSpeechAce = useCallback(async () => {
  if (!lastAudioBlobRef.current || !lastTranscriptRef.current) {
    setError("No recording available for analysis");
    return null;
  }

  setIsAnalyzingSpeech(true);
  try {
    const formData = new FormData();
    const dialect = getFullLanguageCode(targetLanguage);
    
    formData.append("audio", lastAudioBlobRef.current, "recording.webm");
    formData.append("transcript", lastTranscriptRef.current);
    formData.append("dialect", dialect);
    
    // ✅ CRITICAL FIX: Send the generic template ID for the Review DB logic
    formData.append("conversationId", id); 
    
    // Keep this if you want to link it to the specific record in the future
    if (conversationRecordId) {
      formData.append("conversationRecordId", conversationRecordId);
    }

    const response = await fetch("/api/analyze-speechace", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`SpeechAce API error: ${response.status}`);
    }

    const result = await response.json();
    setSpeechAceResult(result);
    return result; // ✅ Return result so we can use it immediately
  } catch (error) {
    console.error("❌ SpeechAce error:", error);
    setError("Failed to analyze speech");
    return null;
  } finally {
    setIsAnalyzingSpeech(false);
  }
}, [id, conversationRecordId, targetLanguage, getFullLanguageCode]);

  const stopRecording = () => {
    setIsRecording(false);

    // Stop Deepgram connection
    if (deepgramConnectionRef.current) {
      try {
        deepgramConnectionRef.current.finish();
      } catch (e) {
        console.warn("Error finishing connection:", e);
      }
      deepgramConnectionRef.current = null;
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.warn("Error stopping recorder:", e);
        }
      }
      mediaRecorderRef.current = null;
    }

    // Clear interval
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }

    // Stop all tracks to release microphone
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    // Clean up chunks
    audioChunksRef.current = [];
  };

  const toggleRecording = useCallback(async () => {
    // CRITICAL: Check for secure context first
    if (!window.isSecureContext) {
      setError(
        "⚠️ Recording requires HTTPS connection. Please use a secure connection.",
      );
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      setError(null);
      setIsRecording(true);

      try {
        // Request user permission first with proper constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            sampleSize: 16,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        const tokenResponse = await fetch("/api/deepgram/stt-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetLanguage }),
        });

        if (!tokenResponse.ok) {
          throw new Error(`Token fetch failed: ${tokenResponse.status}`);
        }

        const { token } = await tokenResponse.json();

        if (!token) {
          throw new Error("No token received from backend");
        }

        // Initialize Deepgram connection
        const deepgram = createClient(token);
        const connection = deepgram.listen.live({
          model: "nova-3",
          language: targetLanguage === "en" ? "en-US" : targetLanguage,
          smart_format: true,
          interim_results: false,
          endpointing: 500,
          filler_words: false,
        });

        deepgramConnectionRef.current = connection;

        // IMPORTANT: Get supported mimeType dynamically
        const mimeType = getSupportedMimeType();

        // For better compatibility on mobile, use a more conservative approach
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: 16000,
        });

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0 && connection.getReadyState() === 1) {
            const arrayBuffer = await event.data.arrayBuffer();
            connection.send(arrayBuffer);
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current = mediaRecorder;

        // Wire up Deepgram event handlers BEFORE starting
        connection.on(LiveTranscriptionEvents.Open, () => {
          console.log("✅ Deepgram connection opened");

          // CRITICAL: Start with timeslice for better mobile compatibility
          mediaRecorder.start(250); // Use 250ms chunks instead of 100ms

          // Keep connection alive
          audioIntervalRef.current = setInterval(() => {
            if (connection.getReadyState() === 1) {
              connection.keepAlive();
            }
          }, 5000);
        });

        connection.on(LiveTranscriptionEvents.Transcript, async (data) => {
          const transcript = data.channel?.alternatives?.[0]?.transcript;

          if (transcript?.trim() && !isProcessingTranscriptRef.current) {
            isProcessingTranscriptRef.current = true;
            console.log("📝 Transcript:", transcript);

            const audioBlob = new Blob(audioChunksRef.current, {
              type: mimeType,
            });
            lastAudioBlobRef.current = audioBlob;
            lastTranscriptRef.current = transcript;

            stopRecording();

            // 🎯 Run SpeechAce in parallel - don't await it
            analyzeSpeechAce();
            await handleConversation(transcript);
            isProcessingTranscriptRef.current = false;
          }
        });

        connection.on(LiveTranscriptionEvents.Error, (err) => {
          console.error("❌ Deepgram error:", err);
          setError(`Transcription error: ${err.message || "Unknown error"}`);
          isProcessingTranscriptRef.current = false;
          stopRecording();
          audioChunksRef.current = [];
        });

        connection.on(LiveTranscriptionEvents.Close, () => {
          console.log("🔌 Deepgram connection closed");
          setIsRecording(false);
          audioChunksRef.current = [];
        });

        // Handle stream ending
        stream.getTracks().forEach((track) => {
          track.onended = () => {
            console.log("Audio track ended unexpectedly");
            stopRecording();
          };
        });
      } catch (error) {
        console.error("❌ Failed to start recording:", error);

        // Provide user-friendly error messages
        let errorMessage = "Failed to start recording";

        if (error instanceof DOMException && error.name === "NotAllowedError") {
          errorMessage =
            "🎤 Microphone access denied. Please enable microphone permissions in your browser settings.";
        } else if (
          error instanceof DOMException &&
          error.name === "NotFoundError"
        ) {
          errorMessage = "🎤 No microphone found. Please connect a microphone.";
        } else if (
          error instanceof DOMException &&
          error.name === "SecurityError"
        ) {
          errorMessage =
            "🔒 Recording blocked for security reasons. Please use HTTPS and ensure you're on a trusted site.";
        } else if (
          error instanceof DOMException &&
          error.name === "NotSupportedError"
        ) {
          errorMessage = "❌ Audio recording not supported in this browser.";
        } else {
          errorMessage = `Recording error: ${error instanceof Error ? error.message : "Unknown error"}`;
        }

        setError(errorMessage);
        setIsRecording(false);
      }
    }
  }, [isRecording, targetLanguage, handleConversation]);

  return {
    // State
    voiceGender,
    conversationHistory,
    textInput,
    isRecording,
    isProcessing,
    isDeleting,
    isSaving,
    conversationStarted,
    conversationRecordId,
    translationResult,
    error,
    suggestions,
    isLoadingSuggestions,
    isGeneratingAudio,
    isMuted,
    userMessage,

    // Refs
    messagesEndRef,
    scrollRef,

    // Handlers
    handleConversation,
    handleStartConversation,
    toggleRecording,
    clearConversationHistory,
    getSuggestions,
    analyzeAndSaveConversation,
    usePhrase,
    speakPhrase,
    toggleVoiceGender,
    toggleMute,
    setTextInput,
    setError,
    speechAceResult,
    analyzeSpeechAce,
    isAnalyzingSpeech,
    isMobile,
    createAudioUrl,
    audioBase64Map,
  };
};
