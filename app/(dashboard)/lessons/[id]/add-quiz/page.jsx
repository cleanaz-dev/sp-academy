'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuizCreator from '@/components/QuizCreator';


export default function AddQuizPage({ params }) {
  const [lesson, setLesson] = useState(null);
  const router = useRouter();
  const lessonId = params.id;

  useEffect(() => {
    const fetchLesson = async () => {
      const response = await fetch(`/api/lessons/${lessonId}`);
      if (response.ok) {
        const data = await response.json();
        setLesson(data);
      } else {
        console.error('Failed to fetch lesson');
      }
    };

    fetchLesson();
  }, [lessonId]);

  const handleQuizCreated = () => {
    router.push(`/lessons/${lessonId}`);
  };

  if (!lesson) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Quiz to Lesson: {lesson.title}</h1>
      <QuizCreator lessonId={lessonId} onQuizCreated={handleQuizCreated} />
    </div>
  );
}