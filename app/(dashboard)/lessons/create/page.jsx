"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

export default function CreateLesson() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [createWithAi, setCreateWithAi] = useState(false);
  const [createQuiz, setCreateQuiz] = useState(false);
  const [questionCount, setQuestionCount] = useState(15);
  const [isMultipleChoice, setIsMultipleChoice] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      let lessonId;
      let lessonContent;
  
      if (createWithAi) {
        // If creating with AI, send data to the AI lesson creation endpoint
        const aiLessonResponse = await fetch("https://sp-academy.vercel.app/api/create-lesson", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, subject, topic, level }),
        });
  
        if (!aiLessonResponse.ok) {
          console.error("Failed to create lesson with AI");
          return;
        }
  
        const aiLesson = await aiLessonResponse.json();
        lessonId = aiLesson.id;
        lessonContent = aiLesson.content; // Assuming the AI returns the generated content
      } else {
        // Regular lesson creation with user inputted content
        const lessonResponse = await fetch("https://sp-academy.vercel.app/api/lessons", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, content, subject }),
        });
  
        if (!lessonResponse.ok) {
          console.error("Failed to create lesson");
          return;
        }
  
        const lesson = await lessonResponse.json();
        lessonId = lesson.id;
        lessonContent = content; // Use the user-provided content
      }
  
      // If createQuiz is true, create the quiz using the lesson ID and content
      if (createQuiz && lessonId) {
        await createQuizForLesson(lessonId, lessonContent);
      }
  
      router.push("/lessons");
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  const createQuizForLesson = async (lessonId, lessonContent) => {
    try {
      const quizResponse = await fetch("https://sp-academy.vercel.app/api/create-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
          title,
          content: lessonContent, // Use the lesson content here
          questionCount,
          isMultipleChoice,
        }),
      });
  
      if (!quizResponse.ok) {
        console.error("Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  return (
    <div className="max-w-4xl">
      <header className="bg-white p-4 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-500 ">Create New Lesson</h1>
      </header>
      <main className="p-6 gap-6">
        <Card className="p-6 bg-gradient-to-b from-indigo-200/25 to-yellow-100/25">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="title" className="block mb-2">
                Title:
              </Label>
              <Input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded bg-white"
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="subject" className="block mb-2">
                Subject:
              </Label>
              <Select
                id="subject"
                value={subject}
                onValueChange={(value) => setSubject(value)}
                className="w-full p-2 border rounded"
                required
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Please select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Spirituality">Spirituality</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label htmlFor="grade" className="block mb-2">
                Grade:
              </Label>
              <Input
                type="integer"
                id="grade"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full p-2 rounded bg-white"
                required
              />
            </div>
            {/* Toggle for creating with AI */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={createWithAi}
                  onChange={(e) => setCreateWithAi(e.target.checked)}
                  className="mr-2"
                />
                Create with AI
              </label>
            </div>
            {createWithAi ? (
              // Show topic input when creating with AI
              <div className="mb-4">
                <Label htmlFor="topic" className="block mb-2">
                  Topic:
                </Label>
                <Input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-2 rounded bg-white"
                  required
                />
              </div>
            ) : (
              // Show markdown editor when not creating with AI
              <div className="mb-4">
                <Label htmlFor="content" className="block mb-2">
                  Content:
                </Label>
                <MDEditor
                  value={content}
                  onChange={setContent}
                  preview="edit"
                  className="w-full"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={createQuiz}
                  onChange={(e) => setCreateQuiz(e.target.checked)}
                  className="mr-2"
                />
                Create Quiz
              </label>
            </div>
            {createQuiz && (
              <div className="mb-4">
                <div className="mb-2">
                  <label htmlFor="questionCount" className="block mb-2">
                    Number of Questions:
                  </label>
                  <input
                    type="number"
                    id="questionCount"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                    min="1"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isMultipleChoice}
                      onChange={(e) => setIsMultipleChoice(e.target.checked)}
                      className="mr-2"
                    />
                    Multiple Choice
                  </label>
                </div>
              </div>
            )}
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Create Lesson
            </button>
          </form>
        </Card>
      </main>
    </div>
  );
}
