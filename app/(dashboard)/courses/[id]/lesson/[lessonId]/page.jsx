import React from "react";
import { getLessonById } from "@/lib/actions";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

export default async function SingleLessonsPage({ params }) {
  const lesson = await getLessonById(params.lessonId);

  if (!lesson) {
    return <h1>Lesson not found</h1>;
  }
  return (
    <div className="max-w-5xl p-4 flex flex-col bg-white">
      <h1 className="text-2xl font-bold mb-4 text-black bg-transparent">
        {lesson.title}
      </h1>
      <div className="prose prose-lg w-full flex-1  max-w-none dark:prose-invert">
        <span>
          <Markdown remarkPlugins={[remarkGfm]}>{lesson.content}</Markdown>
          {lesson.quiz && (
            <div>
              <Link
                href={`/courses/${lesson.courseId}/lesson/${lesson.id}/quiz`}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Take Quiz
              </Link>
            </div>
          )}
        </span>
      </div>
    </div>
  );
}
