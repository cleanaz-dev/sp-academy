//app/component/conversation/NewConversationComponent-copy.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogHeader,
} from "../ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Mic,
  Loader2,
  Trash2,
  Send,
  RefreshCw,
  Eye,
  Sparkles,
  MessageSquareQuote,
  ThumbsUp,
  ArrowRight,
  BookOpen,
  Edit3,
  Type,
  AlertCircle,
} from "lucide-react";
import { MdRecordVoiceOver } from "react-icons/md";
import { Switch } from "@/components/ui/switch-voice";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { Volume2 } from "lucide-react";
import { RiKakaoTalkFill } from "react-icons/ri";
import { useUser } from "@clerk/nextjs";
import { Check } from "lucide-react";
import { CircleCheck } from "lucide-react";
import { InfoIcon } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { GraduationCap } from "lucide-react";
import { Book } from "lucide-react";
import { PenTool } from "lucide-react";

export default function NewConversationComponentCopy({
  vocabulary,
  dialogue,
  title,
  id,
  targetLanguage,
  nativeLanguage,
  aiAvatarUrl,
  aiAvatarMaleUrl,
  aiAvatarFemaleUrl,
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  const [originalText, setOriginalText] = useState("");
  const [voiceGender, setVoiceGender] = useState("female");
  const [userReponseScore, setUserResponseScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [conversationRecordId, setConversationRecordId] = useState(null);
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { user } = useUser();

  // Add a function to load conversation history
  const scrollToBottom = () => {
    if (conversationHistory.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Add this useEffect to fetch initial history
  useEffect(() => {
    if (conversationRecordId === null) return;

    const fetchConversationHistory = async () => {
      try {
        const response = await fetch(
          `/api/conversation/${conversationRecordId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch conversation history");
        }

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
  }, [conversationHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    }
  }, [conversationHistory]);

  // Helper function to convert language codes
  const getFullLanguageCode = (lang) => {
    const languageMap = {
      fr: "fr-FR",
      es: "es-ES",
      en: "en-US",
      // Add more mappings as needed
    };
    return languageMap[lang] || lang;
  };

  // Simplified speakPhrase function
  const speakPhrase = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const fullLangCode = getFullLanguageCode(targetLanguage);
    console.log("Speaking in language:", fullLangCode);
    utterance.lang = fullLangCode;
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
        body: JSON.stringify({
          text,
          voiceGender,
          targetLanguage,
        }),
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;

        // Use the target language for speech recognition
        const fullLangCode = getFullLanguageCode(targetLanguage);

        recognitionInstance.lang = fullLangCode;

        recognitionInstance.onstart = () => {
          setIsRecording(true);
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        recognitionInstance.onresult = async (event) => {
          const transcript = event.results[0][0].transcript;
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
  }, [targetLanguage, voiceGender, conversationRecordId, conversationHistory, translationResult]);

  useEffect(() => {
    console.log("Language values updated:", {
      targetLanguage,
      nativeLanguage,
      timestamp: new Date().toISOString(),
    });
  }, [targetLanguage, nativeLanguage]);

  const handleConversation = async (message) => {
    setIsProcessing(true);
    setError(null);
    try {
      if (!conversationRecordId) {
        throw new Error("No active conversation record");
      }

      // Create user message with initial data
      const newUserMessage = {
        role: "user",
        content: message,
      };

      // Optimistically update local state
      const updatedHistory = [...conversationHistory, newUserMessage];

      const response = await fetch("/api/conversation-claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: updatedHistory, // Pass existing state, not the temp update
          title,
          vocabulary,
          dialogue,
          voiceGender,
          targetLanguage,
          nativeLanguage,
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Create full user message with additional details
      const fullUserMessage = {
        role: "user",
        content: message,
        translation: data.messageTranslation,
        score: data.score,
        label: data.label,
        improvedResponse: data.improvedResponse,
        corrections: data.corrections,
      };

      // AI response
      const aiMessage = {
        role: "assistant",
        content: data.targetLanguage,
        translation: data.nativeLanguage,
      };

      // Send messages to database and get updated history
      const updateResponse = await fetch("/api/conversation/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationRecordId,
          messages: [fullUserMessage, aiMessage], // Send only new messages
        }),
      });

      if (!updateResponse.ok)
        throw new Error("Failed to save conversation to database");

      const { messages: savedMessages } = await updateResponse.json();

      // Update state with messages from the DB
      setConversationHistory(savedMessages);

      setAiResponse(data.targetLanguage);

      setIsGeneratingAudio(true);
      if (!isMuted) {
        await handleAudioPlayback(data.audio);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to process conversation");

      // Revert last optimistic update if error occurs
      setConversationHistory((prevHistory) => prevHistory.slice(0, -1));
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
        body: JSON.stringify({
          conversationId: id,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start conversation");
      }

      const data = await response.json();
      setConversationRecordId(data.conversationRecordId); // Store in state
      console.log("Conversation Record ID:", data.conversationRecordId);
      setConversationStarted(true);
    } catch (error) {
      console.error("Error starting conversation:", error);
      setError("Failed to start conversation");
    }
  };

  // Optional: Clear the stored ID when needed (e.g., when conversation ends)
  const endConversation = () => {
    localStorage.removeItem("currentConversationRecordId");
    setConversationRecordId(null);
    setConversationStarted(false);
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

  const clearConversationHistory = async (conversationHistory) => {
    setIsDeleting(true);
    try {  
      // Make the DELETE request to the API (no need for a body)
      const response = await fetch(`/api/conversation/${conversationRecordId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
  
      if (!response.ok) {
        throw new Error("Failed to clear conversation history");
      }
  
      console.log("Conversation history cleared");
  
      // After successfully deleting, clear the local state and localStorage
      setConversationHistory([]);
      setUserMessage("");
      setAiResponse("");
      setError(null);
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing conversation history:", error);
      setError("Failed to clear conversation history");
    } finally {
      setIsDeleting(false);
      setConversationStarted(false)
    }
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
          targetLanguage,
          nativeLanguage,
        }),
      });

      const data = await response.json();
      console.log("Data from suggestions API:", data);
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
          aria-label="Get Suggestions"
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

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline">{error}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={getSuggestions}
            className="absolute top-2 right-2"
            aria-label="Retry getting suggestions"
          >
            Retry
          </Button>
        </div>
      )}

      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex p-3 rounded-lg bg-purple-50 shadow-purple-100 hover:bg-gray-50 transition-colors duration-200 shadow-inner"
            >
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  {/* Text Container */}
                  <div className="flex-1">
                    <p className="text-xs md:text-sm font-medium text-purple-600">
                      {suggestion.targetLanguage}
                    </p>
                    <p className="text-xs text-gray-600 italic">
                      {suggestion.nativeLanguage}
                    </p>
                  </div>

                  {/* Button Container */}
                  <div className="flex gap-2 self-start">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => speakPhrase(suggestion.targetLanguage)}
                      className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                      title="Listen to pronunciation"
                      aria-label={`Listen to ${suggestion.targetLanguage}`}
                    >
                      🔊
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => usePhrase(suggestion.targetLanguage)}
                      className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                      title="Use in conversation"
                      aria-label={`Use ${suggestion.targetLanguage} in conversation`}
                    >
                      💬
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          {isLoadingSuggestions
            ? "Loading suggestions..."
            : "No suggestions available."}
        </div>
      )}
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
          from: nativeLanguage,
          to: targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Translation request failed");
      }

      const data = await response.json();
      setTranslationResult(data.translatedText);
      setOriginalText(data.originalText);
      setTextInput("");
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
  };

  // Capitilalize the first letter of the text
  const capitalizeFirstLetter = (text) =>
    text.charAt(0).toUpperCase() + text.slice(1);


  const ImprovementTooltip = ({
    improvedResponse,
    originalText,
    corrections,
  }) => {
    console.log("Full corrections object:", corrections); // Let's see what we're getting

    // Modified render function to handle different correction formats
    const renderCorrectionCategory = (title, correction, icon) => {
      if (!correction) return null;

      // Log the specific correction to see its structure
      console.log(`${title} correction:`, correction);

      return (
        <div className="mb-3 pl-2">
          <div className="text-sm text-slate-300 mb-1 flex items-center gap-2">
            {icon}
            {title}:
          </div>
          <div className="pl-6 space-y-1">
            {/* Handle the correction text */}
            <div className="text-white">
              {typeof correction === "object"
                ? correction.correction
                : correction}
            </div>
            {/* Handle the reason */}
            {correction.reason && (
              <div className="text-emerald-400 text-xs italic">
                Why: {correction.reason}
              </div>
            )}
          </div>
        </div>
      );
    };
    // Debug section to check what corrections are available
    console.log("Gender Agreement:", corrections?.genderAgreement);
    console.log("Vocabulary:", corrections?.vocabulary);
    console.log("Article:", corrections?.article);
    console.log("Additional Notes:", corrections?.additionalNotes);

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className="text-white flex items-center space-x-1 animate-pulse shadow-2xl shadow-white hover:scale-110 transition-transform">
            <Info className="w-4 h-4" />
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl p-6 bg-gradient-to-r from-indigo-600/70 to-purple-700/70 text-white shadow-xl rounded-lg backdrop-blur-md border-none">
          <DialogHeader>
            <DialogTitle className="font-semibold text-2xl text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              <span>Better Way to Say This</span>
            </DialogTitle>
            <DialogDescription>
              <span className="text-white/50 text-xs">
                Please review information below
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="text-sm text-slate-100 space-y-4">
            {/* Original Text Section */}
            <p className="p-3 bg-white/5 rounded-lg">
              <span className="text-xs text-slate-300 mb-2 flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4" />
                Original phrase:
              </span>
              <span className="block text-slate-200 pl-6">
                {capitalizeFirstLetter(originalText)}
              </span>
            </p>

            {/* Corrections Section */}
            <div className="p-3 bg-white/5 rounded-lg">
              <span className="text-xs mb-2 flex items-center gap-2">
                <CircleCheck className="w-4 h-4 text-green-600" />
                <span className="text-slate-300">Corrections:</span>
              </span>

              {corrections?.genderAgreement &&
                renderCorrectionCategory(
                  "Gender Agreement",
                  corrections.genderAgreement,
                  <GraduationCap className="w-4 h-4" />
                )}

              {corrections?.vocabulary &&
                renderCorrectionCategory(
                  "Vocabulary",
                  corrections.vocabulary,
                  <Book className="w-4 h-4" />
                )}

              {corrections?.article &&
                renderCorrectionCategory(
                  "Article",
                  corrections.article,
                  <PenTool className="w-4 h-4" />
                )}

            </div>

            {/* Improved Text Section */}
            <div className="p-3 bg-white/10 rounded-lg border border-white/10">
              <span className="text-xs text-emerald-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Improved version:
              </span>
              <span className="block font-medium text-white mb-4 pl-6">
                {improvedResponse.replace(/^"|"$/g, "")}
              </span>

              <span className="flex justify-end border-t border-white/10 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => speakPhrase(improvedResponse)}
                  className="flex items-center gap-2 text-slate-200 hover:text-white hover:bg-white/10"
                >
                  <Volume2 className="w-4 h-4" />
                  Listen
                </Button>
              </span>
            </div>
          </div>

          {corrections?.finalNotes && (
            <p className="mt-4 text-xs text-slate-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-300" />
              <span>{corrections.finalNotes}</span>
            </p>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex container mx-auto  max-w-4xl gap-4">
      {/* Main Conversation Area */}
      <div className="w-full">
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
          <ScrollArea className="flex-1 min-h-[100px] p-4 bg-gray-100/80 rounded-lg shadow-inner ">
            <div className="flex flex-col space-y-4 ">
              {conversationHistory.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-end ",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role !== "user" && voiceGender === "female" ? (
                    <Avatar className="w-10 h-10 mr-3 drop-shadow-md transition-all duration-300 ease-in-out transform ">
                      <AvatarImage src={aiAvatarFemaleUrl} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  ) : message.role !== "user" ? (
                    <Avatar className="w-10 h-10 mr-3 drop-shadow-md transition-all duration-300 ease-in-out transform ">
                      <AvatarImage src={aiAvatarMaleUrl} />
                      <AvatarFallback className="bg-gray-500 text-white">
                        U
                      </AvatarFallback>
                    </Avatar>
                  ) : null}

                  <div
                    className={cn(
                      "relative md:max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-md transition-all duration-300",
                      message.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white self-end rounded-br-none min-w-32"
                        : "bg-white text-gray-900 self-start rounded-bl-none"
                    )}
                  >
                    <p className="font-medium">
                      {capitalizeFirstLetter(message.content)}
                    </p>

                    {message.translation && (
                      <p className="mt-1 text-xs italic opacity-80">
                        {message.translation}
                      </p>
                    )}
                    {/* User Score */}
                    {message.label && (
                      <div className="flex items-center justify-end space-x-2 ">
                        <span
                          className={cn(
                            "flex items-center gap-1 text-xs italic font-bold",
                            message.label === "Excellent" ||
                              message.label === "Great"
                              ? "text-emerald-500"
                              : message.label === "Good"
                              ? "text-green-600"
                              : message.label === "OK"
                              ? "text-amber-500"
                              : "text-red-400"
                          )}
                        >
                          <MdRecordVoiceOver /> {message.label}!
                        </span>

                        {/* Show "View Improvement" only if label is OK or Poor */}
                        {message.improvedResponse && (
                          <ImprovementTooltip
                            improvedResponse={message.improvedResponse}
                            originalText={message.content}
                            corrections={message.corrections}
                          />
                        )}
                      </div>
                    )}

                    {/* Subtle glow effect for user messages */}
                    {message.role === "user" && (
                      <span className="absolute -bottom-1 right-2 w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>
                    )}
                  </div>

                  {message.role === "user" && (
                    <Avatar className="w-10 h-10 ml-3 drop-shadow-md">
                      <AvatarFallback className="bg-gray-500 text-white">
                        U
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} /> {/* Auto-scroll anchor */}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4">
            <div className="flex flex-col gap-4">
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
                      <Button variant="ghost" onClick={handleStartConversation}>
                        <span className="text-sm font-medium text-gray-600">
                          Ready to start! 🚀
                        </span>
                      </Button>
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
              {conversationStarted && conversationRecordId && (
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-100 rounded-full p-2 flex items-center drop-shadow-sm shadow-inner w-full sm:w-1/2">
                    {/* Text Input */}
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type something to translate..."
                      className="flex-1 bg-transparent outline-none px-3 text-sm w-full sm:w-24"
                    />

                    {/* Conditionally render Send or Mic button */}
                    {textInput.trim() ? (
                      // When there's text, show the Send button
                      <button
                        onClick={() => handleTranslation(textInput)}
                        disabled={isProcessing || !textInput.trim()}
                        className="p-2 rounded-full hover:bg-emerald-500 hover:text-white text-emerald-500 disabled:opacity-50 transition-all  mr-1 shadow-inner duration-500"
                      >
                        <Send className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                    ) : (
                      // When no text, show the Mic button
                      <button
                        onClick={toggleRecording}
                        disabled={isProcessing}
                        className={`p-2 rounded-full hover:bg-blue-500 hover:text-white duration-300 shadow-inner ${
                          isRecording ? "bg-red-500 text-white" : ""
                        } text-blue-500 disabled:opacity-50 transition-all`}
                      >
                        {isRecording ? (
                          // Glowing mic when recording
                          <Mic className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
                        ) : (
                          // Normal mic when idle
                          <Mic className="h-4 w-4 md:h-5 md:w-5" />
                        )}
                      </button>
                    )}

                    {/* Delete Button */}
                    {/* {conversationHistory.length >= 2 && (
                      <button
                        onClick={deleteLastExchange}
                        className="ml-2 p-2 rounded-full hover:bg-red-500 text-red-500 hover:text-white transition-all duration-300 shadow-inner"
                        title="Delete last exchange"
                      >
                        <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                    )} */}
                  </div>
                </div>
              )}
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
                className="bg-purple-50 shadow-purple-100 hover:bg-gray-50 transition-colors duration-200 shadow-inner p-3 rounded-lg"
              >
                <div className="flex items-center justify-between w-full">
                  {/* Left section for the translation text */}
                  <div>
                    <p className="text-sm font-medium text-purple-600">
                      {translationResult}
                    </p>
                    <p className="text-xs text-gray-600 italic">
                      {originalText}
                    </p>
                  </div>

                  {/* Right section for the buttons */}
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
                onClick={() => clearConversationHistory(conversationHistory)}
                className="w-1/2 p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-all"
              >
                {isDeleting ? "Clearing Conversation..." : "Clear Conversation"}
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
      {/* <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 transform -translate-y-1/2"
        onClick={() => setIsPanelOpen(!isPanelOpen)}
      >
        {isPanelOpen ? <ChevronRight /> : <ChevronLeft />}
      </Button> */}

      {/* Reference Panel */}
      {/* <motion.div
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
                            {item.targetLanguage}
                          </span>
                          <span className="text-gray-600  text-[14px]">
                            {item.nativeLanguage}
                          </span>
                        </div>
                        <div className="flex gap-2 ">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => textToSpeech(item.targetLanguage)}
                            className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                            title="Listen to pronunciation"
                          >
                            🔊
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => usePhrase(item.targetLanguage)}
                            className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                            title="Use in conversation"
                          >
                            💬
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="text-[13px] text-purple-500 italic flex items-center">
                          "{item.example.targetLanguage}"
                        </p>
                        <p className="text-[13px] text-gray-500 italic flex items-center">
                          "{item.example.nativeLanguage}"
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
                            onClick={() => textToSpeech(line.targetLanguage)}
                            className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                            title="Listen to pronunciation"
                          >
                            🔊
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => usePhrase(line.targetLanguage)}
                            className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                            title="Use in conversation"
                          >
                            💬
                          </Button>
                        </div>
                      </div>
                      <p className="mb-1 text-[13px]">{line.targetLanguage}</p>
                      <p className="text-[12px] text-gray-600 italic">
                        {line.nativeLanguage}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </motion.div> */}
    </div>
  );
}
