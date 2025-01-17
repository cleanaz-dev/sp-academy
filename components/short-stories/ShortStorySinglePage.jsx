"use client";
import React, { useState, useEffect } from "react";
import ShortStoryQuestionsModal from "@/components/short-stories/ShortStoryQuestionModal";
import PronunciationAssessment from "@/components/short-stories/PronunciationAssessment";
import Image from "next/image";
import InteractiveExercises from "./InteractiveExercises";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Eye, Mic, MicOff } from "lucide-react";
import ConversationComponent from "../conversation/ConversationComponent";

export default function ShortStorySinglePage({ story }) {
  const [isRecording, setIsRecording] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState(null);

// Initialize speech recognition
   useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'fr-FR'; // Set to French

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
          try {
            await handleConversation(transcript);
          } catch (err) {
            setError('Failed to process speech');
            console.error(err);
          }
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

  const startRecording = () => {
    try {
      if (recognition) {
        recognition.start();
        setError(null);
      }
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Error starting recording');
    }
  };

  const stopRecording = () => {
    try {
      if (recognition) {
        recognition.stop();
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Error stopping recording');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };


  const handleConversation = async (message) => {
    try {
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Convert base64 audio to blob
      const audioBlob = new Blob(
        [Buffer.from(data.audio, 'base64')],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play the audio
      const audio = new Audio(audioUrl);
      await audio.play();

      setAiResponse(data.text);
      return data.text;
    } catch (error) {
      console.error('Conversation error:', error);
      setError('Failed to process conversation');
      throw error;
    }
  };
// Add this inside your TabsContent for "pronunciation"
const conversationSection = (
  <div className="mt-4 p-4 bg-white rounded-lg shadow">
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Practice Conversation</h3>
        <button
          onClick={toggleRecording}
          className={`p-3 rounded-full ${
            isRecording ? 'bg-red-500' : 'bg-blue-500'
          } text-white transition-colors duration-200`}
          disabled={!recognition}
        >
          {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isRecording && (
        <div className="text-center text-green-600 animate-pulse">
          Recording...
        </div>
      )}

      {userMessage && (
        <div className="bg-gray-100 p-3 rounded">
          <p className="font-semibold">You:</p>
          <p>{userMessage}</p>
        </div>
      )}

      {aiResponse && (
        <div className="bg-blue-50 p-3 rounded">
          <p className="font-semibold">AI:</p>
          <p>{aiResponse}</p>
        </div>
      )}
    </div>
  </div>
)

  return (
    <div className="max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="header-title">{story.title}</h1>

        <Image
          src={story.imageUrl}
          alt={story.title}
          width={300}
          height={300}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />
        <div className="mt-2 flex gap-2 text-sm">
          <span className="px-2 py-1 bg-blue-100 rounded">{story.genre}</span>
          <span className="px-2 py-1 bg-green-100 rounded">
            {story.difficulty}
          </span>
          <span className="px-2 py-1 bg-purple-100 rounded">
            {story.grammar}
          </span>
        </div>
      </div>

      <Tabs defaultValue="story">
        <TabsList>
          <TabsTrigger value="story">Story</TabsTrigger>
          <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
          <TabsTrigger value="grammar-vocab">Grammar & Vocab</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
        </TabsList>

        <TabsContent value="story">
          <div className="space-y-6">
            {/* Add Audio Player prominently near the top */}
            {story.audioUrl && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold mb-3">
                  <span className="mr-2">🎧</span>
                  Listen to the Story
                </h2>
                <audio
                  controls
                  src={story.audioUrl}
                  className="w-full"
                  preload="metadata"
                  type="audio/mpeg"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Listen to the story to improve your pronunciation and
                  comprehension
                </p>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold">French Story:</h2>
              <p className="mt-2 p-4 bg-gray-50 rounded">{story.frenchText}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold">English Translation:</h2>
              <p className="mt-2 p-4 bg-gray-50 rounded">{story.englishText}</p>
            </div>
          </div>

        </TabsContent>

        <TabsContent value="pronunciation">
          <div>
            <h2 className="text-xl font-bold mb-4">Practice Pronunciation:</h2>
            <ConversationComponent />
            {/* {conversationSection} */}
            <PronunciationAssessment
              userId={story.user.id}
              storyText={story.frenchText}
              storyId={story.id}
            />
          </div>
        </TabsContent>

        <TabsContent value="grammar-vocab">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Grammar Highlights:</h2>
              <div className="mt-2 p-4 bg-gray-50 rounded">
                {story.grammarHighlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="mb-3 p-3 border-l-4 border-blue-500"
                  >
                    <p className="font-semibold text-blue-600">
                      {highlight.expression}
                    </p>
                    <p className="text-gray-600 mt-1">
                      {highlight.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold">Vocabulary:</h2>
              <ul className="mt-2 p-4 bg-gray-50 rounded grid grid-cols-1 md:grid-cols-2 gap-3">
                {story.vocabulary.map((word, index) => (
                  <li
                    key={index}
                    className="mb-2 p-2 border border-gray-200 rounded"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <strong className="text-blue-600">{word.french}</strong>
                        <span className="mx-2">→</span>
                        <span>{word.english}</span>
                      </div>
                      <span className="text-sm text-gray-500 italic">
                        {word.grammarType}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="exercises">
          <div>
            {story.exercises && (
              <div className="mt-6 border-t pt-6">

                <InteractiveExercises exercises={story.exercises} frenchStory={story.frenchText} englishStory={story.englishText}/>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <div className="mt-6 flex gap-4">
        <ShortStoryQuestionsModal story={story} />
      </div>
    </div>
  );
}
