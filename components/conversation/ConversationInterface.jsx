// components/conversation/ConversationInterface.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { Button } from "../ui/button";

export default function ConversationInterface({ scenarioContext }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [parsedScenario, setParsedScenario] = useState(null);

  // Parse scenario context to extract key information
  const parseScenarioContext = (markdown) => {
    try {
      const sections = markdown.split('#').filter(Boolean);
      const scenario = {
        setup: sections.find(s => s.toLowerCase().includes('scenario'))?.split('\n').slice(1).join('\n').trim(),
        vocabulary: sections.find(s => s.toLowerCase().includes('vocabulary'))?.split('\n').slice(1).join('\n').trim(),
        phrases: sections.find(s => s.toLowerCase().includes('phrases'))?.split('\n').slice(1).join('\n').trim(),
        characters: sections.find(s => s.toLowerCase().includes('character'))?.split('\n').slice(1).join('\n').trim(),
        cultural: sections.find(s => s.toLowerCase().includes('cultural'))?.split('\n').slice(1).join('\n').trim(),
      };
      return scenario;
    } catch (error) {
      console.error('Error parsing scenario:', error);
      return null;
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'fr-FR';

        recognitionInstance.onstart = () => {
          console.log('Recording started');
          setIsRecording(true);
        };

        recognitionInstance.onend = () => {
          console.log('Recording stopped');
          setIsRecording(false);
        };

        recognitionInstance.onresult = async (event) => {
          const transcript = event.results[0][0].transcript;
          console.log('Transcript:', transcript);
          setUserMessage(transcript);
          await handleConversation(transcript);
        };

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setError(`Speech recognition error: ${event.error}`);
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      } else {
        setError('Speech recognition not supported in this browser');
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
      console.error('Recording error:', err);
      setError('Error with recording');
      setIsRecording(false);
    }
  };

  const handleConversation = async (message) => {
    setIsProcessing(true);
    setError(null);
  
    // Log current state for debugging
    console.log('Current conversation history:', conversationHistory);
  
    // Create updated history by adding user message first
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];
  
    // Update the state with the new history immediately
    setConversationHistory(updatedHistory);
  
    try {
      const response = await fetch('/api/conversation-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: parsedScenario,
          history: updatedHistory // Send updated history including the user message
        }),
      });
  
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
  
      // Log API response for debugging
      console.log('API Response:', data);
  
      // Set AI response and update history with assistant's reply
      setAiResponse(data.text);
      setIsGeneratingAudio(true);
  
      // Add assistant's reply to history after receiving it
      setConversationHistory(prev => [...prev, { role: 'assistant', content: data.text }]);
  
      if (!isMuted) {
        await handleAudioPlayback(data.audio);
      }
  
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to process conversation');
    } finally {
      setIsProcessing(false);
      setIsGeneratingAudio(false);
    }
  };
  

  // Add useEffect to monitor conversation history changes
useEffect(() => {
  console.log('Conversation history updated:', conversationHistory);
}, [conversationHistory]);

// Add useEffect to monitor scenario parsing
useEffect(() => {
  if (scenarioContext) {
    const parsed = parseScenarioContext(scenarioContext);
    console.log('Parsed scenario:', parsed);
    setParsedScenario(parsed);
  }
}, [scenarioContext]);

  const handleAudioPlayback = async (audioBase64) => {
    try {
      const audioBlob = new Blob(
        [Buffer.from(audioBase64, 'base64')],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error('Audio playback error:', error);
      setError('Failed to play audio');
    }
  };

  const resetConversation = () => {
    setConversationHistory([]);
    setUserMessage('');
    setAiResponse('');
    setError(null);
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      <div className="flex flex-col space-y-4">
        {/* Scenario Context Display */}
        {parsedScenario && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Scenario Context:</h4>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
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
            <p className="text-sm text-gray-600 mb-2">{parsedScenario.setup}</p>
            
            {parsedScenario.vocabulary && (
              <div className="mt-2">
                <h5 className="font-medium text-sm">Key Vocabulary:</h5>
                <p className="text-sm text-gray-600">{parsedScenario.vocabulary}</p>
              </div>
            )}

            {parsedScenario.phrases && (
              <div className="mt-2">
                <h5 className="font-medium text-sm">Useful Phrases:</h5>
                <p className="text-sm text-gray-600">{parsedScenario.phrases}</p>
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
            className={`p-3 rounded-full ${
              isRecording ? 'bg-red-500' : 'bg-blue-500'
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

        {/* Status Messages */}
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
        <div className="space-y-4 mt-4">
          {conversationHistory.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded ${
                message.role === 'user' 
                  ? 'bg-gray-100' 
                  : 'bg-blue-50'
              }`}
            >
              <p className="font-semibold">
                {message.role === 'user' ? 'You:' : 'AI:'}
              </p>
              <p>{message.content}</p>
            </div>
          ))}
        </div>

        {/* Current Message Display */}
        {userMessage && !conversationHistory.find(m => m.content === userMessage) && (
          <div className="bg-gray-100 p-3 rounded">
            <p className="font-semibold">You:</p>
            <p>{userMessage}</p>
          </div>
        )}

        {aiResponse && !conversationHistory.find(m => m.content === aiResponse) && (
          <div className="bg-blue-50 p-3 rounded">
            <p className="font-semibold">AI:</p>
            <p>{aiResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}