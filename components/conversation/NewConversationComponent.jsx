//app/component/conversation/NewConversationComponent.jsx
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Mic, MicOff, Loader2 } from "lucide-react";
import { RefreshCw } from "lucide-react";

export default function NewConversationComponent({ vocabulary, dialogue }) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Add these functions at the top of your component:
  const speakPhrase = (text, lang = "fr-FR") => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const usePhrase = (phrase) => {
    handleConversation(phrase);
  };

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

  useEffect(() => {
    const savedHistory = JSON.parse(
      localStorage.getItem("conversationHistory") || "[]"
    );
    setConversationHistory(savedHistory);
  }, []);

  const handleConversation = async (message) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Load existing conversation history from localStorage
      const storedHistory = JSON.parse(
        localStorage.getItem("conversationHistory") || "[]"
      );

      // Add the new user message to the history
      const newUserMessage = { role: "user", content: message };
      const updatedHistory = [...storedHistory, newUserMessage];

      // // Log the updated history before the API call
      // console.log("Updated Conversation History Before API Call:", updatedHistory);

      // Send the entire conversation history in the API request
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history: updatedHistory,
        }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // // Log the response data
      // console.log("API Response Data:", data);

      // Add AI's response to the conversation history
      const aiMessage = { role: "assistant", content: data.text };
      const finalHistory = [...updatedHistory, aiMessage];

      // Update the conversation history in state and localStorage
      setConversationHistory(finalHistory);
      localStorage.setItem("conversationHistory", JSON.stringify(finalHistory));

      // Log the updated history
      console.log(
        "Updated Conversation History After Adding AI Message:",
        finalHistory
      );

      setAiResponse(data.text);

      // Handle audio playback
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

  const clearConversationHistory = () => {
    // Clear the conversation history state
    setConversationHistory([]);
    setUserMessage("");
    setAiResponse("");
    setError(null);

    // Clear the conversation history from localStorage
    localStorage.clear();
  };

  const getSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      // Get the last few messages for context
      const recentMessages = conversationHistory.slice(-3);

      const response = await fetch("/api/conversation/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: recentMessages,
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

  const SuggestionsPanel = () => (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Suggested Responses</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={getSuggestions}
          disabled={isLoadingSuggestions || conversationHistory.length === 0}
          className="flex items-center gap-2"
        >
          {isLoadingSuggestions ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Get Suggestions
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 
                       transition-colors duration-200"
          >
            <button
              onClick={() => handleConversation(suggestion)}
              className="flex-1 text-left text-sm"
            >
              {suggestion}
            </button>
            <button
              onClick={() => speakPhrase(suggestion)}
              className="ml-2 p-1 text-gray-600 hover:text-purple-600 transition-colors"
              title="Listen to pronunciation"
            >
              🔊
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4 w-full">
      {/* Main Conversation Area */}
      <div
        className={`transition-all duration-300 ${
          isPanelOpen ? "w-[60%]" : "w-[100%]"
        }`}
      >
        {/* Your existing conversation UI */}
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
          <div className="flex items-center justify-between p-2">
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
          <ScrollArea className="flex-1 my-4">
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

          {/* Suggestions Panel */}
          <SuggestionsPanel />

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

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 transform -translate-y-1/2"
        onClick={() => setIsPanelOpen(!isPanelOpen)}
      >
        {isPanelOpen ? <ChevronRight /> : <ChevronLeft />}
      </Button>

      {/* Reference Panel */}
      <motion.div
        initial={{ width: "40%" }}
        animate={{
          width: isPanelOpen ? "40%" : "0%",
          opacity: isPanelOpen ? 1 : 0,
        }}
        className="bg-white rounded-lg shadow"
      >
        {isPanelOpen && (
          <Tabs defaultValue="vocabulary" className="w-full h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
              <TabsTrigger value="dialogue">Dialogue</TabsTrigger>
            </TabsList>

            <TabsContent value="vocabulary" className="h-[calc(100%-40px)]">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {vocabulary?.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-purple-600">
                          {item.french}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => speakPhrase(item.french)}
                            className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                            title="Listen to pronunciation"
                          >
                            🔊
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => usePhrase(item.french)}
                            className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                            title="Use in conversation"
                          >
                            💬
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600">{item.english}</p>
                      <p className="text-sm text-gray-500 mt-1 italic">
                        {item.example}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="dialogue" className="h-[calc(100%-40px)]">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {dialogue?.map((line, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-purple-600">
                          {line.speaker}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => speakPhrase(line.french)}
                            className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                            title="Listen to pronunciation"
                          >
                            🔊
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => usePhrase(line.french)}
                            className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                            title="Use in conversation"
                          >
                            💬
                          </Button>
                        </div>
                      </div>
                      <p className="mb-1 text-[13px]">{line.french}</p>
                      <p className="text-[12px] text-gray-600 italic">
                        {line.english}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </motion.div>
    </div>
  );
}
