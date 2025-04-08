import React from "react";
import { getLessonById } from "@/lib/actions";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import ExerciseHandler from "@/components/lessons/ExerciseHandler";

export default async function SingleLessonsPage({ params }) {
  const id = await params.id;
  const lesson = await getLessonById(id);

  if (!lesson) {
    return <h1>Lesson not found</h1>;
  }
  console.log("exercise", lesson.Exercise);
  return (
    <div className="flex max-w-5xl flex-col bg-white p-4">
      <h1 className="mb-4 bg-transparent text-2xl font-bold text-black">
        {lesson.title}
      </h1>
      <div className="prose prose-lg w-full max-w-none flex-1 dark:prose-invert">
        <span>
          <Markdown remarkPlugins={[remarkGfm]}>{lesson.content}</Markdown>
          {lesson.quiz && (
            <div>
              <Link
                href={`/lessons/${lesson.id}/quiz`}
                className="rounded bg-blue-500 px-4 py-2 text-white"
              >
                Take Quiz
              </Link>
            </div>
          )}
        </span>
        <div>
          {lesson.Exercise.map((exercise) => (
            <ExerciseHandler key={exercise.id} exercise={exercise} />
          ))}
        </div>
      </div>
    </div>
  );
}
