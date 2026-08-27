"use client";

import { useSpeech } from "@/context/speech-context";
import { useSpeak } from "@/hooks/use-speak";
import React, { useState, useEffect, useRef } from "react";


const MODES = ["INTRODUCTION", "SPECIFIC", "RANDOM", "ARGUMENTATIVE"];
const MAX_TIME_SECONDS = 180; // 3 minutes

export default function FreestyleComponent({ 
  nativeLanguage, 
  targetLanguage 
}: { 
  nativeLanguage: string; 
  targetLanguage: string; 
}) {
  const [selectedMode, setSelectedMode] = useState<string>("RANDOM");
  const [specificTopic, setSpecificTopic] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME_SECONDS);
  
  // Chat History: store user and AI messages
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  
  const { startRecording, stopRecording, isRecording, transcript, resetSpeechState } = useSpeech();
  const { speak, isPlaying, stop: stopAudio } = useSpeak();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Timer Management ---
  useEffect(() => {
    if (sessionActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && sessionActive) {
      endSession();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionActive, timeLeft]);

  // --- Handlers ---
  const startSession = async () => {
    // 💡 MOBILE FIX: To ensure iOS allows audio later, play a tiny silent sound immediately on user click
    const silentAudio = new Audio("data:audio/mp3;base64,//MkxAA..."); 
    silentAudio.play().catch(() => {});

    setSessionActive(true);
    setTimeLeft(MAX_TIME_SECONDS);
    setMessages([]);
    
    // Optional: Make DeepSeek generate an opening statement based on the mode
    handleAiTurn(selectedMode, specificTopic, true); 
  };

  const endSession = async () => {
    setSessionActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    stopRecording();
    stopAudio();

    // Compile everything to send to your review Lambda
    const fullTranscript = messages.map(m => `[${m.role.toUpperCase()}]: ${m.text}`).join("\n");
    
    await fetch("/api/freestyle/review", {
      method: "POST",
      body: JSON.stringify({
        mode: selectedMode,
        topic: specificTopic,
        targetLanguage,
        nativeLanguage,
        messages,
        fullTranscript,
        duration: MAX_TIME_SECONDS - timeLeft
      })
    });

    alert("Session complete! We are analyzing your freestyle via Lambda.");
  };

  // Called when user finishes speaking their turn
  const submitTurn = async () => {
    const audioBlob = await stopRecording();
    const userText = transcript.trim();
    if (!userText) return;

    // Save User message
    const updatedMessages = [...messages, { role: "user", text: userText }];
    setMessages(updatedMessages);
    resetSpeechState();

    // Pass context to AI
    handleAiTurn(selectedMode, specificTopic, false, updatedMessages);
  };

  // Calls DeepSeek, gets AI text, and calls Fish Audio TTS
  const handleAiTurn = async (mode: string, topic: string, isOpening = false, chatHistory: any[] = []) => {
    try {
      const res = await fetch("/api/freestyle/chat", {
        method: "POST",
        body: JSON.stringify({ mode, topic, targetLanguage, nativeLanguage, chatHistory, isOpening })
      });
      const data = await res.json();
      const aiText = data.text;

      setMessages((prev) => [...prev, { role: "assistant", text: aiText }]);
      
      // Play Fish Audio TTS
      await speak(aiText, targetLanguage);

    } catch (err) {
      console.error("AI turn failed", err);
    }
  };

  // Format Timer (MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border">
      <h2 className="text-2xl font-bold mb-4">Freestyle Arena (3 Mins)</h2>

      {!sessionActive ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`p-4 rounded-lg border-2 ${
                  selectedMode === mode ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {selectedMode === "SPECIFIC" && (
            <input
              type="text"
              placeholder="What do you want to talk about? (e.g., Booking a hotel)"
              value={specificTopic}
              onChange={(e) => setSpecificTopic(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          )}

          <button onClick={startSession} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">
            Start Freestyle
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center text-lg font-semibold text-red-600">
            <span>Time Remaining:</span>
            <span>{formatTime(timeLeft)}</span>
          </div>

          <div className="h-64 overflow-y-auto border p-4 bg-gray-50 rounded-lg space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`p-3 rounded-lg max-w-[80%] ${m.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-white border'}`}>
                {m.text}
              </div>
            ))}
            {isPlaying && <div className="text-gray-400 text-sm italic">AI is speaking...</div>}
            {isRecording && <div className="text-blue-400 text-sm italic">You are speaking: {transcript}</div>}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => isRecording ? submitTurn() : startRecording(targetLanguage)}
              disabled={isPlaying}
              className={`flex-1 p-3 rounded-lg text-white font-bold ${
                isRecording ? "bg-green-500" : "bg-blue-500"
              } ${isPlaying ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isRecording ? "Submit Response" : "Hold & Speak"}
            </button>

            <button onClick={endSession} className="bg-red-500 text-white p-3 rounded-lg font-bold">
              End Early
            </button>
          </div>
        </div>
      )}
    </div>
  );
}