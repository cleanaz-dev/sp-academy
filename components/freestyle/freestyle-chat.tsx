"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  Clock, 
  Square, 
  Mic, 
  Send, 
  Volume2, 
  Loader2 
} from "lucide-react";

import { useSpeech } from "@/context/speech-context";
import { useSpeak } from "@/hooks/use-speak";
import { FreestyleSessionConfig } from "./freestyle-wrapper";
import { convertBlobToWav } from "@/lib/audio-utils";
import { FreestyleChatBubble } from "./freestye-chat-bubble";
import { FreestyleSuggestionsPanel } from "./freestyle-suggestions-panel";

// Mock data: When ready, replace this with a state variable populated by your AI API
const MOCK_SUGGESTIONS = [
  "Could you repeat that a bit more slowly?",
  "What does that mean in English?",
  "I'm not sure how to say it, but...",
  "Can we talk about a different topic?",
  "Let me think about that for a second.",
];

export default function FreestyleChat({
  session,
  onEnd,
}: {
  session: FreestyleSessionConfig;
  onEnd: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(180);
  const [messages, setMessages] = useState<any[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Future proofing: When you build the AI generation, you can store it here
  // const [suggestions, setSuggestions] = useState<string[]>(MOCK_SUGGESTIONS);

  const {
    startRecording,
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, transcript, isAiProcessing]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleEndSession();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft]);

  // Initial greeting
  useEffect(() => {
    handleAiTurn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEndSession = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    stopRecording();
    stopAudio();

    try {
      await fetch("/api/freestyle/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...session,
          sessionId: session.id, 
          messages,
          duration: 180 - timeLeft,
        }),
      });
    } catch (err) {
      console.error("Failed to submit session for review:", err);
    }

    onEnd();
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
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                pronunciationScore: scoreData,
                isAnalyzingPronunciation: false,
              }
            : message,
        ),
      );
    } catch (err) {
      console.error("Pronunciation assessment failed", err);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                isAnalyzingPronunciation: false,
              }
            : message,
        ),
      );
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

    if (audioBlob) {
      analyzePronunciation(audioBlob, userText, newMsgId);
    }

    handleAiTurn(false, updatedMessages);
  };

  const handleAiTurn = async (isOpening = false, chatHistory: any[] = []) => {
    setIsAiProcessing(true);

    try {
      const res = await fetch("/api/freestyle/chat", {
        method: "POST",
        body: JSON.stringify({
          ...session,
          chatHistory,
          isOpening,
        }),
      });

      if (!res.ok) throw new Error("Failed to get AI response");

      const data = await res.json();

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
      await speak(data.text, session.targetLanguage, 1.0, session.voiceGender);
    } catch (err) {
      console.error(err);
      setIsAiProcessing(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleReplay = (text: string) => {
    speak(text, session.targetLanguage, 1.0, session.voiceGender);
  };

  return (
    <div className="flex h-full max-h-[85vh] w-full gap-6">
      {/* MAIN CHAT AREA (3/4 Width) */}
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
              <Image
                src={session.aiAvatarUrl}
                alt="AI Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold capitalize text-gray-900">
                {session.mode.toLowerCase()} Mode
              </h3>
              <p className="text-xs font-medium capitalize text-gray-500">
                {session.voiceGender} Tutor
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium tracking-wide transition-colors ${
              timeLeft < 30
                ? "animate-pulse bg-red-50 text-red-600"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/30 p-6">
          {messages.map((message) => (
            <FreestyleChatBubble
              key={message.id}
              message={message}
              onReplay={message.role === "assistant" ? handleReplay : undefined}
            />
          ))}

          {/* Live Transcript Bubble */}
          {isRecording && transcript && (
            <div className="flex flex-col items-end animate-in slide-in-from-bottom-2">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 p-3 px-5 text-[15px] text-white shadow-sm">
                {transcript}
                <span className="animate-pulse">...</span>
              </div>
            </div>
          )}

          {/* AI Typing / TTS Loading Indicator */}
          {(isAiProcessing || isPlaying || isSpeechLoading) && (
            <div className="flex items-start gap-2 duration-300 animate-in fade-in zoom-in">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-gray-100 bg-white p-3 px-4 shadow-sm">
                {isPlaying ? (
                  <>
                    <Volume2 className="h-4 w-4 animate-pulse text-indigo-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Speaking...
                    </span>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Thinking...
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Footer Controls */}
        <div className="z-10 flex items-center justify-between border-t border-gray-100 bg-white p-4">
          <button
            onClick={handleEndSession}
            className="flex h-12 w-12 items-center justify-center rounded-xl text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
            title="End Session"
          >
            <Square className="h-5 w-5 fill-current" />
          </button>

          <div className="flex flex-1 justify-center">
            {isRecording ? (
              <button
                onClick={submitTurn}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                <Send className="h-6 w-6 ml-1" />
              </button>
            ) : (
              <button
                onClick={() => startRecording(session.targetLanguage)}
                disabled={isPlaying || isAiProcessing || isSpeechLoading}
                className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 ${
                  isPlaying || isAiProcessing || isSpeechLoading
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : "bg-indigo-600 text-white shadow-md hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg active:translate-y-0"
                }`}
              >
                <Mic className="h-6 w-6" />
              </button>
            )}
          </div>

          <div className="w-12"></div>
        </div>
      </div>

      {/* SUGGESTIONS PANEL (1/4 Width) */}
      <FreestyleSuggestionsPanel suggestions={MOCK_SUGGESTIONS} />
    </div>
  );
}