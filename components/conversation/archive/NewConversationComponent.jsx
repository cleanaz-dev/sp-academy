//app/component/conversation/NewConversationComponent.jsx
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Mic, Loader2 } from "lucide-react";
import { RefreshCw } from "lucide-react";
import { Trash2 } from "lucide-react";
import { Send } from "lucide-react";
import { Switch } from "@/components/ui/switch-voice";

export default function NewConversationComponent({
  vocabulary,
  dialogue,
  title,
  id,
  tutorLanguage,
}) {
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
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [translationResult, setTranslationResult] = useState("");
  const [voiceGender, setVoiceGender] = useState("female");

  const localStorageKey = `conversationHistory-${id}`;

  // Add these functions at the top of your component:
  const speakPhrase = (text, lang = "fr-FR") => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const usePhrase = (phrase) => {
    handleConversation(phrase);
  };

  const textToSpeech = async (text) => {
    try {
      const response = await fetch(`/api/conversation/text-to-speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Extract the base64-encoded audio from the API response
      const audioBase64 = data.audio;

      // Play the audio using the helper function
      await handleAudioPlayback(audioBase64);
    } catch (error) {
      console.error("Error in text-to-speech:", error);
      alert("Failed to process text-to-speech. Please try again.");
    }
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
  }, [voiceGender]);

  useEffect(() => {
    const savedHistory = JSON.parse(
      localStorage.getItem(localStorageKey) || "[]"
    );
    setConversationHistory(savedHistory);
  }, [localStorageKey]);

  const handleConversation = async (message) => {
    setIsProcessing(true);
    setError(null);
    console.log("Processing user message:", message);

    try {
      // Get the existing conversation history for the current id
      const storedHistory = JSON.parse(
        localStorage.getItem(localStorageKey) || "[]"
      );

      const newUserMessage = { role: "user", content: message };
      const updatedHistory = [...storedHistory, newUserMessage];

      const response = await fetch("/api/conversation-claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history: updatedHistory,
          title,
          vocabulary,
          dialogue,
          voiceGender,
          tutorLanguage,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const aiMessage = {
        role: "assistant",
        content: data.french,
        translation: data.english,
      };

      const finalHistory = [...updatedHistory, aiMessage];

      // Save the updated history in state and localStorage
      setConversationHistory(finalHistory);
      localStorage.setItem(localStorageKey, JSON.stringify(finalHistory));
      setAiResponse(data.french);

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
      setSuggestions([]); // Clear suggestions when starting a new conversation
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
    setTranslationResult("");
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
    setSuggestions([]);
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
        <h4 className="text-sm font-medium text-gray-700">
          Suggested Responses
        </h4>
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
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 
                       transition-colors duration-200"
          >
            <div className="flex-1">
              <div>
                {" "}
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => speakPhrase(suggestion.french)}
                    className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                    title="Listen to pronunciation"
                  >
                    🔊
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => usePhrase(suggestion.french)}
                    className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                    title="Use in conversation"
                  >
                    💬
                  </Button>
                </div>
              </div>
              <p className="text-sm font-medium text-purple-600">
                {suggestion.french}
              </p>
              <p className="text-xs text-gray-600 italic mt-1">
                {suggestion.english}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const analyzeAndSaveConversation = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/conversation/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: conversationHistory,
          title: title,
          vocabulary: vocabulary,
          dialogue: dialogue,
        }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // // Show success message
      // toast({
      //   title: "Conversation saved!",
      //   description: "You can view the analysis in your Learning Hub.",
      //   status: "success",
      //   duration: 5000,
      // });

      // // Optionally, clear the conversation after saving
      // clearConversationHistory();
    } catch (error) {
      console.error("Error saving conversation:", error);
      // toast({
      //   title: "Error saving conversation",
      //   description: "Please try again later.",
      //   status: "error",
      //   duration: 5000,
      // });
    } finally {
      setIsSaving(false);
      setIsProcessing(false);
    }
  };

  const deleteLastExchange = () => {
    // Remove last two messages (user and AI response)
    const newHistory = conversationHistory.slice(0, -2);
    setConversationHistory(newHistory);
    // Update localStorage
    localStorage.setItem("conversationHistory", JSON.stringify(newHistory));
  };

  const handleTranslation = async (text) => {
    if (!text.trim()) return;

    setError(null);
    setIsProcessing(true);

    try {
      const response = await fetch("/api/conversation/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          from: "en",
          to: "fr",
        }),
      });

      if (!response.ok) {
        throw new Error("Translation request failed");
      }

      const data = await response.json();
      setTranslationResult(data.translatedText);
      setTextInput(""); // Clear input after translation
    } catch (error) {
      console.error("Error translating text:", error.message);
      setError("Failed to translate text");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleVoiceGender = (checked) => {
    const newGender = checked ? "male" : "female";
    setVoiceGender(newGender);
    console.log("Voice gender toggled to: ", newGender);
  };

  return (
    <div className="flex container mx-auto h-[calc(75vh-2rem)] max-w-4xl gap-4">
      {/* Main Conversation Area */}
      <div
        className={`transition-all duration-300 ${
          isPanelOpen ? "w-[60%]" : "w-[100%]"
        }`}
      >
        {/* Your existing conversation UI */}
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
          <div className="flex items-center justify-between p-2">
            <header>
              <div>
                <h3 className="text-lg font-semibold">
                  Practice Conversation ✌🏼✌🏼✌🏼
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Voice:
                  </span>
                  <Switch
                    defaultChecked
                    checked={voiceGender === "male"}
                    onCheckedChange={toggleVoiceGender}
                    className="relative transition-colors"
                  >
                    <span
                      className={`${
                        voiceGender === "male"
                          ? "translate-x-6"
                          : "translate-x-1"
                      } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                    />
                  </Switch>
                  <span className="text-2xl">
                    {voiceGender === "male" ? "🚹" : "🚺"}
                  </span>
                </div>
              </div>
            </header>
          </div>

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
                  {message.translation && (
                    <p className="mt-1 text-gray-600 italic text-xs">
                      {message.translation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t bg-white/80 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto flex flex-col gap-4">
              {/* Status Indicators */}
              <div className="relative h-8 w-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full w-full justify-center transition-opacity duration-300 ease-in-out absolute ${
                      !isRecording && !isProcessing
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="px-4 py-2 rounded-full w-full flex justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        Ready to start! 🚀
                      </span>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full w-full justify-center transition-opacity duration-300 ease-in-out absolute ${
                      isRecording
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="px-4 py-2 rounded-full w-full flex items-center justify-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        Recording
                      </span>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full w-full justify-center transition-opacity duration-300 ease-in-out absolute ${
                      isProcessing
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="px-4 py-2 rounded-full w-full flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-sm font-medium text-blue-600">
                        Processing
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Input Controls */}
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-100 rounded-full p-2 flex items-center">
                  {/* Text Input */}
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type something to translate..."
                    className="flex-1 bg-transparent outline-none px-3 text-sm"
                  />

                  {/* Send Button */}
                  <button
                    onClick={() => handleTranslation(textInput)}
                    disabled={isProcessing || !textInput.trim()}
                    className="p-2 rounded-full hover:bg-blue-500 bg-blue-400 text-white disabled:opacity-50 transition-all mr-2"
                  >
                    <Send className="h-5 w-5" />
                  </button>

                  {/* Voice Recording Button */}
                  <button
                    onClick={toggleRecording}
                    disabled={isProcessing}
                    className={`p-2 rounded-full hover:bg-red-500 duration-300 ${
                      isRecording ? "bg-red-500" : "bg-blue-500"
                    } text-white disabled:opacity-50 transition-all`}
                  >
                    {isRecording ? (
                      // Show a "Stop" icon or a glowing mic when recording
                      <div className="flex items-center">
                        <Mic className="h-5 w-5 animate-pulse" />
                      </div>
                    ) : (
                      // Show a normal mic when idle
                      <Mic className="h-5 w-5" />
                    )}
                  </button>

                  {/* Delete Button */}
                  {conversationHistory.length >= 2 && (
                    <button
                      onClick={deleteLastExchange}
                      className="group ml-2 p-2 rounded-full hover:bg-gray-200 transition-all duration-300"
                      title="Delete last exchange"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-full text-sm shadow-lg">
              {error}
            </div>
          )}

          {/* Translation Result Display */}
          {translationResult && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Translation
                </h4>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 
                 transition-colors duration-200"
              >
                <div className="flex-1">
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => speakPhrase(translationResult)}
                      className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                      title="Listen to pronunciation"
                    >
                      🔊
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => usePhrase(translationResult)}
                      className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                      title="Use in conversation"
                    >
                      💬
                    </Button>
                  </div>
                  <p className="text-sm font-medium text-purple-600">
                    {translationResult}
                  </p>
                </div>
              </motion.div>
            </div>
          )}

          {/* Suggestions Panel */}
          <SuggestionsPanel />

          {/* Clear button at bottom */}
          {conversationHistory.length > 0 && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={clearConversationHistory}
                className="w-1/2 p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-all"
              >
                Clear Conversation
              </button>
              <button
                onClick={analyzeAndSaveConversation}
                disabled={isSaving}
                className={`w-1/2 p-2 ${
                  isSaving
                    ? "bg-purple-300"
                    : "bg-purple-500 hover:bg-purple-600"
                } text-white rounded transition-all flex items-center justify-center gap-2`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & Analyze"
                )}
              </button>
            </div>
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
                      <div className="flex justify-between">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-semibold text-purple-600">
                            {item.es}
                          </span>
                          <span className="text-gray-600  text-[14px]">
                            {item.en}
                          </span>
                        </div>
                        <div className="flex gap-2 ">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => speakPhrase(item.es)}
                            className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                            title="Listen to pronunciation"
                          >
                            🔊
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => usePhrase(item.es)}
                            className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                            title="Use in conversation"
                          >
                            💬
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="text-[13px] text-purple-500 italic flex items-center">
                          
                          "{item.example.es}"
                        </p>
                        <p className="text-[13px] text-gray-500 italic flex items-center">
                         
                          "{item.example.en}"
                        </p>
                      </div>
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
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-purple-600 text-sm">
                          {line.speaker}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => textToSpeech(line.french)}
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
