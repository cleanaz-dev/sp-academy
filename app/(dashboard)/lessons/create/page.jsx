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
 const [createQuiz, setCreateQuiz] = useState(false);
 const [questionCount, setQuestionCount] = useState(15);
 const [isMultipleChoice, setIsMultipleChoice] = useState(true);
 const router = useRouter();

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
   // First, create the lesson
   const lessonResponse = await fetch("/api/lessons", {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, content, subject,  }),
   });

   if (lessonResponse.ok) {
    const lesson = await lessonResponse.json();
    // lesson.id is now available here
    console.log("lesson id:", lesson.id);
    // If createQuiz is true, create the quiz using the lesson ID
    if (createQuiz) {
     await createQuizForLesson(lesson.id);
    }

    router.push("/lessons");
   } else {
    console.error("Failed to create lesson");
   }
  } catch (error) {
   console.error("Error:", error);
  }
 };

 const createQuizForLesson = async (lessonId) => {
  try {
   const quizResponse = await fetch("/api/create-quiz", {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({
     lessonId,
     title,
     content,
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
    {/* <div className="flex items-center space-x-4">
   
     </div> */}
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
        onValueChange={(value) => setSubject(value)} // Use value directly here
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
       <label htmlFor="content" className="block mb-2">
        Content:
       </label>
       <MDEditor
        value={content}
        onChange={setContent}
        preview="edit"
        className="w-full"
       />
      </div>
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
