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
            const lines = child.split('\n');
            return lines.map((line, lineIndex) => {
              const [french, english] = line.split(' ↳ ');
              return (
                <React.Fragment key={lineIndex}>
                  {french && <strong className="text-gray-800">{french}</strong>}
                  {english && <em className="text-gray-600 block ml-4">{english}</em>}
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
            const [french, english] = child.split(' ↳ ');
            return (
              <>
                {french && <strong className="text-gray-800">{french}</strong>}
                {english && <em className="text-gray-600 block ml-4">{english}</em>}
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
      <div className="border-2 border-amber-400 bg-amber-50 rounded-lg p-4 my-6">
        {children}
      </div>
    );
  },
  // Style tables with borders
  table: ({ node, children }) => {
    return (
      <div className="overflow-x-auto my-6">
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
    return (
      <td className="border-2 border-amber-400 px-4 py-2">
        {children}
      </td>
    );
  },
};

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
      <div className="prose prose-lg w-full flex-1 max-w-none dark:prose-invert">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={customComponents}
        >
          {lesson.content}
        </Markdown>
        {lesson.quiz && (
          <div className="mt-8">
            <Link
              href={`/courses/${lesson.courseId}/lesson/${lesson.id}/quiz`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Take Quiz
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}