//app/conversation/ConversationInterface.jsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from "@aws-sdk/client-transcribe-streaming";

export default function ConversationInterface({ scenarioContext }) {
  const [isListening, setIsListening] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const transcribeClient = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const audioContextRef = useRef(null);
  const audioStreamRef = useRef(null);

  // Reset conversation
  const resetConversation = () => {
    setConversationHistory([]);
    stopListening();
    setError(null);
  };

  const processUserInput = async (transcript) => {
    if (!transcript || transcript.trim() === "") return;

    try {
      setLoading(true);
      console.log("Sending request to API with transcript:", transcript); // Add this log

      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: transcript,
          scenarioContext,
          conversationHistory,
        }),
      });

      console.log("API response status:", response.status); // Add this log

      if (!response.ok) {
        throw new Error("Failed to process conversation");
      }

      const data = await response.json();
      console.log("API response data:", data); // Add this log

      // Update conversation history
      const updatedHistory = [
        ...conversationHistory,
        { role: "user", content: transcript },
        { role: "assistant", content: data.text },
      ];

      setConversationHistory(updatedHistory);
    } catch (error) {
      console.error("Error processing input:", error);
      setError("Failed to process conversation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const convertToPCM = async (audioBuffer) => {
    console.log("Converting to PCM, buffer length:", audioBuffer.length);
    const channelData = audioBuffer.getChannelData(0);
    const pcmData = new Int16Array(channelData.length);

    let maxValue = 0;
    for (let i = 0; i < channelData.length; i++) {
      maxValue = Math.max(maxValue, Math.abs(channelData[i]));
    }

    const scale = maxValue > 0 ? 32767 / maxValue : 1;

    for (let i = 0; i < channelData.length; i++) {
      pcmData[i] = Math.min(
        32767,
        Math.max(-32768, Math.round(channelData[i] * scale)),
      );
    }

    console.log("PCM conversion complete, size:", pcmData.length);
    return pcmData.buffer;
  };

  const startListening = async () => {
    try {
      console.log("Starting listening...");
      setLoading(true);
      setError(null);

      const credResponse = await fetch("/api/get-credentials", {
        method: "POST",
      });

      if (!credResponse.ok) {
        throw new Error("Failed to get AWS credentials");
      }

      const { credentials, region } = await credResponse.json();

      transcribeClient.current = new TranscribeStreamingClient({
        region: region,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken,
        },
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          sampleSize: 16,
        },
      });

      audioStreamRef.current = stream;

      // Create a single AudioContext
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)({
        sampleRate: 16000,
      });

      // Create source and processor nodes
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1,
      );

      let audioData = new Float32Array();

      processor.onaudioprocess = async (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        // Accumulate audio data
        const newAudioData = new Float32Array(
          audioData.length + inputData.length,
        );
        newAudioData.set(audioData);
        newAudioData.set(inputData, audioData.length);
        audioData = newAudioData;

        // Process audio in chunks of 1 second
        const samplesPerSecond = audioContextRef.current.sampleRate;
        if (audioData.length >= samplesPerSecond) {
          try {
            // Convert to Int16Array for AWS Transcribe
            const pcmData = new Int16Array(samplesPerSecond);
            for (let i = 0; i < samplesPerSecond; i++) {
              const s = Math.max(-1, Math.min(1, audioData[i]));
              pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }

            // Remove processed data
            audioData = audioData.slice(samplesPerSecond);

            // Create audio stream
            const audioStream = async function* () {
              yield {
                AudioEvent: {
                  AudioChunk: pcmData.buffer,
                },
              };
            };

            const command = new StartStreamTranscriptionCommand({
              LanguageCode: "en-US",
              MediaSampleRateHertz: 16000,
              MediaEncoding: "pcm",
              AudioStream: audioStream(),
            });

            console.log("Sending audio chunk to Transcribe...");
            const response = await transcribeClient.current.send(command);

            for await (const event of response.TranscriptEvents) {
              console.log("Received transcript event:", event);
              if (
                event.Transcript?.Results?.[0] &&
                !event.Transcript.Results[0].IsPartial
              ) {
                const transcript =
                  event.Transcript.Results[0].Alternatives[0].Transcript;
                console.log("Final transcript:", transcript);
                if (transcript) {
                  await processUserInput(transcript.trim());
                }
              }
            }
          } catch (error) {
            console.error("Error processing audio:", error);
          }
        }
      };

      // Connect the nodes
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      setIsListening(true);
      setLoading(false);
    } catch (error) {
      console.error("Error in startListening:", error);
      setError(`Failed to start recording: ${error.message}`);
      stopListening();
    }
  };

  // Update stopListening to clean up audio context
  const stopListening = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    if (transcribeClient.current) {
      transcribeClient.current.destroy();
      transcribeClient.current = null;
    }

    setIsListening(false);
  }, []);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return (
    <div className="mx-auto max-w-2xl p-4">
      {/* Conversation history display */}
      <div className="mb-4 h-96 overflow-y-auto rounded border bg-white p-4 shadow-sm">
        {conversationHistory.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block rounded-lg p-2 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}
            >
              <ReactMarkdown className="prose prose-sm max-w-none">
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>
      )}

      {/* Control buttons */}
      <div className="flex space-x-2">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={loading}
          className={`flex-grow rounded-lg p-4 text-white transition-colors ${
            isListening
              ? "bg-red-500 hover:bg-red-600"
              : loading
                ? "cursor-not-allowed bg-gray-400"
                : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isListening
            ? "Stop Conversation"
            : loading
              ? "Processing..."
              : "Start Conversation"}
        </button>
        <button
          onClick={resetConversation}
          disabled={loading}
          className="rounded-lg bg-gray-200 p-4 transition-colors hover:bg-gray-300"
        >
          Reset
        </button>
      </div>

      {/* Recording indicator */}
      {isListening && (
        <div className="mt-2 flex justify-center">
          <div className="flex animate-pulse space-x-1">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <div className="animation-delay-200 h-2 w-2 rounded-full bg-red-500"></div>
            <div className="animation-delay-400 h-2 w-2 rounded-full bg-red-500"></div>
          </div>
        </div>
      )}
    </div>
  );
}
