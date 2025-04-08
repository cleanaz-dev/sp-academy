import React from "react";
import { getLessonById } from "@/lib/actions";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

// Custom renderers for Markdown components
const customComponents = {
  p: ({ node, children }) => {
    // Split French and English content by newlines
    const content = React.Children.toArray(children);
    return (
      <p className="my-4">
        {content.map((child, index) => {
          if (typeof child === "string") {
            // Split lines with translations (↳ symbol)
            const lines = child.split("\n");
            return lines.map((line, lineIndex) => {
              const [french, english] = line.split(" ↳ ");
              return (
                <React.Fragment key={lineIndex}>
                  {french && (
                    <strong className="text-gray-800">{french}</strong>
                  )}
                  {english && (
                    <em className="ml-4 block text-gray-600">{english}</em>
                  )}
                </React.Fragment>
              );
            });
          }
          return child;
        })}
      </p>
    );
  },
  li: ({ node, children }) => {
    // Style list items
    return (
      <li className="my-2">
        {React.Children.map(children, (child) => {
          if (typeof child === "string") {
            const [french, english] = child.split(" ↳ ");
            return (
              <>
                {french && <strong className="text-gray-800">{french}</strong>}
                {english && (
                  <em className="ml-4 block text-gray-600">{english}</em>
                )}
              </>
            );
          }
          return child;
        })}
      </li>
    );
  },
  // Add bordered sections for highlighted content
  blockquote: ({ node, children }) => {
    return (
      <div className="my-6 rounded-lg border-2 border-amber-400 bg-amber-50 p-4">
        {children}
      </div>
    );
  },
  // Style tables with borders
  table: ({ node, children }) => {
    return (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse border-2 border-amber-400">
          {children}
        </table>
      </div>
    );
  },
  th: ({ node, children }) => {
    return (
      <th className="border-2 border-amber-400 bg-amber-50 px-4 py-2 text-left">
        {children}
      </th>
    );
  },
  td: ({ node, children }) => {
    return <td className="border-2 border-amber-400 px-4 py-2">{children}</td>;
  },
};

export default async function SingleLessonsPage({ params }) {
  const lesson = await getLessonById(params.lessonId);

  if (!lesson) {
    return <h1>Lesson not found</h1>;
  }

  return (
    <div className="flex max-w-5xl flex-col bg-white p-4">
      <h1 className="mb-4 bg-transparent text-2xl font-bold text-black">
        {lesson.title}
      </h1>
      <div className="prose prose-lg w-full max-w-none flex-1 dark:prose-invert">
        <Markdown remarkPlugins={[remarkGfm]} components={customComponents}>
          {lesson.content}
        </Markdown>
        {lesson.quiz && (
          <div className="mt-8">
            <Link
              href={`/courses/${lesson.courseId}/lesson/${lesson.id}/quiz`}
              className="rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
            >
              Take Quiz
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
