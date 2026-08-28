"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Clock, Square, Mic, Send, Volume2, Loader2 } from "lucide-react";

import { useSpeech } from "@/context/speech-context";
import { useSpeak } from "@/hooks/use-speak";
import { FreestyleSessionConfig } from "./freestyle-wrapper";
import { convertBlobToWav } from "@/lib/audio-utils";
import { FreestyleChatBubble } from "./freestye-chat-bubble";

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
          ...session, // full config: mode, topic, level, nativeLanguage, targetLanguage, voiceGender, aiAvatarUrl, id
          sessionId: session.id, // route destructures `sessionId`, not `id`
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

      if (!res.ok) {
        throw new Error("Pronunciation assessment failed");
      }

      const scoreData = await res.json();

      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,

                // Keep the complete pronunciation response
                // so FreestyleChatBubble can render:
                // score
                // accuracyScore
                // fluencyScore
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

      // This tells FreestyleChatBubble to show
      // "Scoring pronunciation..." immediately.
      isAnalyzingPronunciation: !!audioBlob,

      // Will be populated by analyzePronunciation()
      // once the API returns the scores.
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

      if (!res.ok) {
        throw new Error("Failed to get AI response");
      }

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
    <div className="relative flex h-full max-h-[85vh] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
      {/* Header */}
      <div className="z-10 flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-indigo-100 bg-gray-100">
            <Image
              src={session.aiAvatarUrl}
              alt="AI Avatar"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h3 className="font-bold capitalize text-gray-900">
              {session.mode.toLowerCase()} Mode
            </h3>

            <p className="text-xs font-medium capitalize text-gray-500">
              {session.voiceGender} Tutor
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono font-bold tracking-wider transition-colors ${
            timeLeft < 30
              ? "animate-pulse bg-red-50 text-red-600"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          <Clock className="h-4 w-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/50 p-6">
        {/* Chat messages are now rendered ONLY by FreestyleChatBubble */}
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
            <div className="max-w-[85%] rounded-3xl rounded-br-sm bg-blue-500 p-4 text-[15px] text-white opacity-90 shadow-inner">
              {transcript}

              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}

        {/* AI Typing / TTS Loading Indicator */}
        {(isAiProcessing || isPlaying || isSpeechLoading) && (
          <div className="flex items-start gap-2 duration-300 animate-in fade-in zoom-in">
            <div className="flex items-center gap-3 rounded-3xl rounded-bl-sm border border-gray-100 bg-white p-4 shadow-sm">
              {isPlaying ? (
                <>
                  <Volume2 className="h-5 w-5 animate-pulse text-indigo-500" />

                  <span className="text-sm font-medium text-gray-500">
                    Speaking...
                  </span>
                </>
              ) : (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />

                  <span className="text-sm font-medium text-gray-500">
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
      <div className="z-10 flex items-center justify-between border-t border-gray-100 bg-white bg-white/80 p-4 px-6 backdrop-blur-md">
        <button
          onClick={handleEndSession}
          className="rounded-2xl p-4 text-red-400 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <Square className="h-6 w-6 fill-current" />
        </button>

        <div className="flex flex-1 justify-center">
          {isRecording ? (
            <button
              onClick={submitTurn}
              className="animate-bounce rounded-full bg-green-500 p-5 text-white shadow-[0_0_40px_rgba(34,197,94,0.4)]"
            >
              <Send className="h-8 w-8" />
            </button>
          ) : (
            <button
              onClick={() => startRecording(session.targetLanguage)}
              disabled={isPlaying || isAiProcessing || isSpeechLoading}
              className={`rounded-full p-6 transition-all duration-300 ${
                isPlaying || isAiProcessing || isSpeechLoading
                  ? "scale-95 cursor-not-allowed bg-gray-200 text-gray-400"
                  : "bg-indigo-600 text-white shadow-[0_10px_40px_rgba(79,70,229,0.3)] hover:scale-110 hover:bg-indigo-700"
              }`}
            >
              <Mic
                className={`h-8 w-8 ${isRecording ? "animate-pulse" : ""}`}
              />
            </button>
          )}
        </div>

        <div className="w-14"></div>
      </div>
    </div>
  );
}