"use client"
import React from 'react'
import ShortStoryQuestionsModal from './short-story-questions-modal';


export default function ShortStorySinglePage({ story }) {

  return (
    <div className="max-w-4xl mx-auto p-6">
    <div className="mb-6">
      <h1 className="text-3xl font-bold">{story.topic}</h1>
      <div className="mt-2 flex gap-2 text-sm">
        <span className="px-2 py-1 bg-blue-100 rounded">{story.genre}</span>
        <span className="px-2 py-1 bg-green-100 rounded">{story.difficulty}</span>
        <span className="px-2 py-1 bg-purple-100 rounded">{story.grammar}</span>
      </div>
    </div>

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
          Listen to the story to improve your pronunciation and comprehension
        </p>
      </div>
    )}

    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">French Story:</h2>
        <p className="mt-2 p-4 bg-gray-50 rounded">{story.frenchText}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold">English Translation:</h2>
        <p className="mt-2 p-4 bg-gray-50 rounded">{story.englishText}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold">Grammar Highlights:</h2>
        <div className="mt-2 p-4 bg-gray-50 rounded">
          {story.grammarHighlights.map((highlight, index) => (
            <div key={index} className="mb-3 p-3 border-l-4 border-blue-500">
              <p className="font-semibold text-blue-600">{highlight.expression}</p>
              <p className="text-gray-600 mt-1">{highlight.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold">Vocabulary:</h2>
        <ul className="mt-2 p-4 bg-gray-50 rounded grid grid-cols-1 md:grid-cols-2 gap-3">
          {story.vocabulary.map((word, index) => (
            <li key={index} className="mb-2 p-2 border border-gray-200 rounded">
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

      <div className="mt-6 flex gap-4">
        {/* <Button size="lg" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Generate Quiz
        </Button> */}
       <ShortStoryQuestionsModal story={story}/>
      </div>
    </div>
  </div>
  )
}
