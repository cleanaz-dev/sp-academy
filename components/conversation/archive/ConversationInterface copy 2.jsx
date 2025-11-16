// components/conversation/ConversationInterface.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Loader2,
  Volume2,
  VolumeX,
  RefreshCw,
} from "lucide-react";
import { Button } from "../../old-ui/button";

export default function ConversationInterface({ scenarioContext }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [parsedScenario, setParsedScenario] = useState(null);

  // Parse scenario context to extract key information
  const parseScenarioContext = (markdown) => {
    try {
      const sections = markdown.split("#").filter(Boolean);
      const scenario = {
        setup: sections
          .find((s) => s.toLowerCase().includes("scenario"))
          ?.split("\n")
          .slice(1)
          .join("\n")
          .trim(),
        vocabulary: sections
          .find((s) => s.toLowerCase().includes("vocabulary"))
          ?.split("\n")
          .slice(1)
          .join("\n")
          .trim(),
        phrases: sections
          .find((s) => s.toLowerCase().includes("phrases"))
          ?.split("\n")
          .slice(1)
          .join("\n")
          .trim(),
        characters: sections
          .find((s) => s.toLowerCase().includes("character"))
          ?.split("\n")
          .slice(1)
          .join("\n")
          .trim(),
        cultural: sections
          .find((s) => s.toLowerCase().includes("cultural"))
          ?.split("\n")
          .slice(1)
          .join("\n")
          .trim(),
      };
      return scenario;
    } catch (error) {
      console.error("Error parsing scenario:", error);
      return null;
    }
  };

  // Initialize scenario parsing
  useEffect(() => {
    if (scenarioContext) {
      const parsed = parseScenarioContext(scenarioContext);
      setParsedScenario(parsed);
    }
  }, [scenarioContext]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = "fr-FR";

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
      const response = await fetch("/api/conversation-test", {
        // Changed this line
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          context: parsedScenario,
          history: conversationHistory,
        }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setAiResponse(data.text);
      setIsGeneratingAudio(true);

      // Update conversation history
      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: data.text },
      ]);

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

  const resetConversation = () => {
    setConversationHistory([]);
    setUserMessage("");
    setAiResponse("");
    setError(null);
  };

  return (
    <div className="mt-4 rounded-lg bg-white p-4 shadow">
      <div className="flex flex-col space-y-4">
        {/* Scenario Context Display */}
        {parsedScenario && (
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold">Scenario Context:</h4>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetConversation}
                  title="Reset Conversation"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="mb-2 text-sm text-gray-600">{parsedScenario.setup}</p>

            {parsedScenario.vocabulary && (
              <div className="mt-2">
                <h5 className="text-sm font-medium">Key Vocabulary:</h5>
                <p className="text-sm text-gray-600">
                  {parsedScenario.vocabulary}
                </p>
              </div>
            )}

            {parsedScenario.phrases && (
              <div className="mt-2">
                <h5 className="text-sm font-medium">Useful Phrases:</h5>
                <p className="text-sm text-gray-600">
                  {parsedScenario.phrases}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Practice Conversation</h3>

          <button
            onClick={toggleRecording}
            disabled={isProcessing}
            className={`rounded-full p-3 ${
              isRecording ? "bg-red-500" : "bg-blue-500"
            } text-white transition-all disabled:opacity-50`}
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

        {/* Status Messages */}
        {error && (
          <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {isRecording && (
          <div className="animate-pulse text-center text-red-600">
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
        <div className="mt-4 space-y-4">
          {conversationHistory.map((message, index) => (
            <div
              key={index}
              className={`rounded p-3 ${
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

        {/* Current Message Display */}
        {userMessage &&
          !conversationHistory.find((m) => m.content === userMessage) && (
            <div className="rounded bg-gray-100 p-3">
              <p className="font-semibold">You:</p>
              <p>{userMessage}</p>
            </div>
          )}

        {aiResponse &&
          !conversationHistory.find((m) => m.content === aiResponse) && (
            <div className="rounded bg-blue-50 p-3">
              <p className="font-semibold">AI:</p>
              <p>{aiResponse}</p>
            </div>
          )}
      </div>
    </div>
  );
}
