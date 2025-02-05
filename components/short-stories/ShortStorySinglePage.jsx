"use client";
import React, { useState, useEffect } from "react";
import PronunciationAssessment from "@/components/short-stories/PronunciationAssessment";
import Image from "next/image";
import InteractiveExercises from "./InteractiveExercises";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "../ui/badge";

export default function ShortStorySinglePage({ story }) {
  const [isRecording, setIsRecording] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState(null);



  return (
    <div className="max-w-4xl p-4 mx-auto w-full">
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
          <Badge className="bg-sky-500 text-white">{story.language}</Badge>
          <Badge className="bg-emerald-500 text-white">{story.genre}</Badge>
          <Badge className="bg-pink-500 text-white">
            {story.difficulty}
          </Badge>
          <Badge className="bg-amber-500 text-white">
            {story.grammar}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="story" className="w-full">
      <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-xl mx-auto mb-10 md:mb-auto">
          <TabsTrigger value="story">Story</TabsTrigger>
          <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
          <TabsTrigger value="grammar-vocab">Grammar & Vocab</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
        </TabsList>

        <TabsContent value="story" className="px-2 sm:px-0">
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
              <p className="mt-2 p-4 bg-gray-50 rounded text-xs md:text-base leading-relaxed">{story.frenchText}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold">English Translation:</h2>
              <p className="mt-2 p-4 bg-gray-50 rounded text-xs md:text-base leading-relaxed">{story.englishText}</p>
            </div>
          </div>

        </TabsContent>

        <TabsContent value="pronunciation">
          <div>
            <h2 className="text-xl font-bold mb-4">Practice Pronunciation:</h2>
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
        {/* <ShortStoryQuestionsModal story={story} /> */}
      </div>
    </div>
  );
}
