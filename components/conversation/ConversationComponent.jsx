"use client";
import React, { useState, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

export default function ConversationComponent() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [historyConversation, setHistoryConversation] = useState([]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = "fr-FR"; // Set to French

        recognitionInstance.onstart = () => {
          console.log("Recording started");
          setIsRecording(true);
        };

        recognitionInstance.onend = () => {
          console.log("Recording stopped");
          setIsRecording(false);
        };

        recognitionInstance.onresult = async (event) => {
          const transcript = event.results[0][0].transcript;
          console.log("Transcript:", transcript);
          setUserMessage(transcript);
          await handleConversation(transcript);
        };

        recognitionInstance.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setError(`Speech recognition error: ${event.error}`);
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      } else {
        setError("Speech recognition not supported in this browser");
      }
    }
  }, []);

  const toggleRecording = () => {
    try {
      if (isRecording) {
        recognition?.stop();
      } else {
        setError(null);
        recognition?.start();
      }
    } catch (err) {
      console.error("Recording error:", err);
      setError("Error with recording");
      setIsRecording(false);
    }
  };

  const handleConversation = async (message) => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log("IO:", conversationHistory)
      // Add the new user message directly
      const newUserMessage = { role: "user", content: message };

      // Immediately include the new message in the conversation history for API call
      const updatedHistory = [...conversationHistory, newUserMessage];

      // // Get the last 4 messages from the history (you can adjust this to include fewer or more)
      // const historyToSend = updatedHistory.slice(-4); // Last 4 messages

      // Log the sliced history to ensure it's correct
      console.log("History:",updatedHistory);

      // Send the last 4 messages in the API request
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history: updatedHistory, // Send only the last 4 messages
        }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // Log the response data to check what the API is returning
      console.log("API Response Data:", data);

      // Add AI's response to the conversation history
      const aiMessage = { role: "assistant", content: data.text };

      setConversationHistory((prevHistory) => {
        const newHistory = [...prevHistory, newUserMessage, aiMessage];

        // Log the history after the state update
        console.log(
          "Updated Conversation History After Adding AI Message:",
          newHistory
        );
     
        console.log("Conversation History:", historyConversation);
        return newHistory;
      });
      setAiResponse(data.text);
      setIsGeneratingAudio(true);

      if (!isMuted) {
        await handleAudioPlayback(data.audio);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to process conversation");
    } finally {
      setIsProcessing(false);
      setIsGeneratingAudio(false);
    }
  };

  const handleAudioPlayback = async (audioBase64) => {
    try {
      const audioBlob = new Blob([Buffer.from(audioBase64, "base64")], {
        type: "audio/mpeg",
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error("Audio playback error:", error);
      setError("Failed to play audio");
    }
  };

  const clearConversationHistory = () => {
    setConversationHistory([]);
    setUserMessage("");
    setAiResponse("");
    setError(null);
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Practice Conversation ✌🏼✌🏼✌🏼
          </h3>

          <button
            onClick={toggleRecording}
            disabled={isProcessing}
            className={`p-3 rounded-full ${
              isRecording ? "bg-red-500" : "bg-blue-500"
            } text-white disabled:opacity-50 transition-all`}
          >
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {isRecording && (
          <div className="text-center text-red-600 animate-pulse">
            Recording...
          </div>
        )}

        {isProcessing && (
          <div className="text-center text-blue-600">
            Processing your message...
          </div>
        )}

        {isGeneratingAudio && (
          <div className="text-center text-green-600">
            Generating audio response...
          </div>
        )}

        {/* Conversation History */}
        <ScrollArea className="h-48 overflow-y-auto">
        <div className="space-y-4">
        
            {" "}
            {/* Ensure ScrollArea is directly applied here */}
            {conversationHistory.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded text-sm ${
                  message.role === "user" ? "bg-gray-100" : "bg-blue-50"
                }`}
              >
                <p className="font-semibold">
                  {message.role === "user" ? "You:" : "AI:"}
                </p>
                <p>{message.content}</p>
              </div>
            ))}
         
        </div>
        </ScrollArea>
        
        {/* Clear button at bottom */}
        {conversationHistory.length > 0 && (
          <button
            onClick={clearConversationHistory}
            className="w-full p-2 mt-4 bg-gray-500 text-white rounded hover:bg-gray-600 transition-all"
          >
            Clear Conversation
          </button>
        )}
      </div>
    </div>
  );
}
