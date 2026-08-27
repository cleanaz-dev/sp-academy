"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSpeech } from "@/context/speech-context";
import { useSpeak } from "@/hooks/use-speak"; 
import { Clock, Square, Mic, Send, Volume2, Loader2, Activity, Languages } from "lucide-react";
import { FreestyleSessionConfig } from "./freestyle-wrapper";
import { convertBlobToWav } from "@/lib/audio-utils"; 
import { FreestyleChatBubble } from "./freestye-chat-bubble";

export default function FreestyleChat({ 
  session, 
  onEnd 
}: { 
  session: FreestyleSessionConfig; 
  onEnd: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(180); // 3 mins
  const [messages, setMessages] = useState<any[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  const { startRecording, stopRecording, isRecording, transcript, resetSpeechState } = useSpeech();
  const { speak, isPlaying, isLoading: isSpeechLoading, stop: stopAudio } = useSpeak();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, isAiProcessing]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      handleEndSession();
    }
    return () => clearInterval(timerRef.current!);
  }, [timeLeft]);

  // Initial greeting
  useEffect(() => {
    handleAiTurn(true);
    // eslint-disable-next-line
  }, []);

  const handleEndSession = async () => {
    clearInterval(timerRef.current!);
    stopRecording();
    stopAudio();

    await fetch("/api/freestyle/review", {
      method: "POST",
      body: JSON.stringify({ sessionId: session.id, messages, duration: 180 - timeLeft })
    });
    
    onEnd(); 
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

      if (res.ok) {
        const scoreData = await res.json();
        setMessages((prev) => prev.map((m) => 
          m.id === messageId 
            ? { ...m, pronunciationScore: scoreData, isAnalyzingPronunciation: false } 
            : m
        ));
      }
    } catch (err) {
      console.error("Pronunciation assessment failed", err);
      setMessages((prev) => prev.map((m) => 
        m.id === messageId ? { ...m, isAnalyzingPronunciation: false } : m
      ));
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
      isAnalyzingPronunciation: !!audioBlob
    };
    
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    resetSpeechState();

    if (audioBlob) {
      analyzePronunciation(audioBlob, userText, newMsgId);
    }

    handleAiTurn(false, updatedMessages);
  };

  const handleAiTurn = async (isOpening = false, chatHistory = []) => {
    setIsAiProcessing(true);
    try {
      const res = await fetch("/api/freestyle/chat", {
        method: "POST",
        body: JSON.stringify({ 
          ...session, 
          chatHistory, 
          isOpening 
        })
      });
      const data = await res.json(); 

      setMessages(prev => [...prev, { 
        id: Date.now(), role: "assistant", text: data.text, translation: data.translation 
      }]);
      
      setIsAiProcessing(false);
      await speak(data.text, session.targetLanguage, 1.0, session.voiceGender);
      
    } catch (err) {
      console.error(err);
      setIsAiProcessing(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="h-full max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative">
      
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 bg-gray-100 rounded-full overflow-hidden border-2 border-indigo-100">
            <Image src={session.aiAvatarUrl} alt="AI Avatar" fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 capitalize">{session.mode.toLowerCase()} Mode</h3>
            <p className="text-xs font-medium text-gray-500 capitalize">{session.voiceGender} Tutor</p>
          </div>
        </div>
        
        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold font-mono tracking-wider transition-colors ${timeLeft < 30 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-700'}`}>
          <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        
        {/* Render Extracted Chat Bubbles */}
        {messages.map((m) => {
          // 💡 Extract exact Azure Data Path safely
          const azureScore = m.pronunciationScore?.NBest?.[0]?.PronScore;
          const accuracyScore = m.pronunciationScore?.NBest?.[0]?.AccuracyScore;
          const fluencyScore = m.pronunciationScore?.NBest?.[0]?.FluencyScore;

          return (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-3xl shadow-sm text-[15px] leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-sm' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
              }`}>
                {m.text}
              </div>

              {/* AI Translation Subtitle */}
              {m.role === 'assistant' && m.translation && (
                <div className="text-xs text-gray-400 mt-2 ml-2 flex items-center gap-1">
                  <Languages className="w-3 h-3" /> {m.translation}
                </div>
              )}

              {/* User Pronunciation Score Badge */}
              {m.role === 'user' && (
                <div className="text-xs mt-2 mr-2 flex items-center gap-2 font-medium">
                  {m.isAnalyzingPronunciation ? (
                    <span className="text-blue-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Scoring...
                    </span>
                  ) : azureScore !== undefined ? (
                    <>
                      <span className={`flex items-center gap-1 ${
                        azureScore >= 80 ? 'text-green-500' :
                        azureScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        <Activity className="w-3 h-3" /> Pronunciation: {azureScore}/100
                      </span>
                      {accuracyScore && (
                        <span className="text-gray-400">| Acc: {accuracyScore}</span>
                      )}
                      {fluencyScore && (
                        <span className="text-gray-400">| Flu: {fluencyScore}</span>
                      )}
                    </>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
        {/* Live Transcript Bubble (When speaking) */}
        {isRecording && transcript && (
          <div className="flex flex-col items-end animate-in slide-in-from-bottom-2">
            <div className="max-w-[85%] p-4 rounded-3xl bg-blue-500 text-white rounded-br-sm opacity-90 shadow-inner text-[15px]">
              {transcript} <span className="animate-pulse">...</span>
            </div>
          </div>
        )}

        {/* AI Typing / TTS Loading Indicator */}
        {(isAiProcessing || isPlaying || isSpeechLoading) && (
          <div className="flex items-start gap-2 animate-in fade-in zoom-in duration-300">
            <div className="bg-white border border-gray-100 p-4 rounded-3xl rounded-bl-sm shadow-sm flex items-center gap-3">
              {isPlaying ? (
                <><Volume2 className="w-5 h-5 text-indigo-500 animate-pulse" /><span className="text-gray-500 text-sm font-medium">Speaking...</span></>
              ) : (
                <><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /><span className="text-gray-500 text-sm font-medium">Thinking...</span></>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Footer Controls */}
      <div className="bg-white border-t border-gray-100 p-4 px-6 z-10 flex justify-between items-center bg-white/80 backdrop-blur-md">
        <button 
          onClick={handleEndSession} 
          className="p-4 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
        >
          <Square className="w-6 h-6 fill-current" />
        </button>

        <div className="flex-1 flex justify-center">
          {isRecording ? (
             <button onClick={submitTurn} className="bg-green-500 text-white rounded-full p-5 shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-bounce">
               <Send className="w-8 h-8" />
             </button>
          ) : (
             <button 
               onClick={() => startRecording(session.targetLanguage)}
               disabled={isPlaying || isAiProcessing || isSpeechLoading}
               className={`rounded-full p-6 transition-all duration-300 ${
                 isPlaying || isAiProcessing || isSpeechLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed scale-95' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-110 shadow-[0_10px_40px_rgba(79,70,229,0.3)]'
               }`}
             >
               <Mic className={`w-8 h-8 ${isRecording ? 'animate-pulse' : ''}`} />
             </button>
          )}
        </div>
        
        <div className="w-14"></div>
      </div>
    </div>
  );
}