'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import QuizCreator from '../../components/QuizCreator';

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

export default function CreateLesson() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [lessonId, setLessonId] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        const lesson = await response.json();
        setLessonId(lesson.id);
      } else {
        console.error('Failed to create lesson');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleQuizCreated = () => {
    router.push('/lessons');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Lesson</h1>
      <form onSubmit={handleSubmit}>
      <div className="mb-4">
          <label htmlFor="title" className="block mb-2">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block mb-2">Content:</label>
          <MDEditor
            value={content}
            onChange={setContent}
            preview="edit"
            className='w-full'
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Lesson
        </button>
      </form>
      {lessonId && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Create Quiz for Lesson</h2>
          <QuizCreator lessonId={lessonId} onQuizCreated={handleQuizCreated} />
        </div>
      )}
    </div>
  );
}