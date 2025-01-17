import React from 'react'
import Markdown from 'react-markdown'

export default function Lesson({ content }) {
  return (
    <div className="prose prose-lg">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
