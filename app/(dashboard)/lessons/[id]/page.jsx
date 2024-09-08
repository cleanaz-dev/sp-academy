import React from "react";
import { getLessonById } from "@/lib/actions";
import Markdown from "react-markdown";

import remarkGfm from "remark-gfm";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default async function SingleLessonsPage({ params }) {
 const lesson = await getLessonById(params.id);

 if (!lesson) {
  return <h1>Lesson not found</h1>;
 }
 return (
  <div className="w-full p-4 flex flex-col h-screen max-w-none bg-white">
   <h1 className="text-2xl font-bold mb-4 text-black">{lesson.title}</h1>
   <div className="prose prose-lg w-full flex-1 overflow-y-auto max-w-none dark:prose-invert">
    <span>
     
      <Markdown remarkPlugins={[remarkGfm]}>{lesson.content}</Markdown>
      {lesson.Quiz && (
        <Link href={`/lessons/${lesson.id}/quiz`} className="bg-blue-500 text-white px-4 py-2 rounded">
          Take Quiz
        </Link>
      )}
     
    </span>
   </div>
  </div>
 );
}
