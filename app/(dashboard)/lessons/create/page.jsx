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
import { Button } from "@/components/ui/button";
import { z } from "zod";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

const lessonSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  subject: z.enum(["History", "Science", "Biology", "Spirituality"], {
    required_error: "Please select a subject",
  }),
  level: z
    .string()
    .min(1, "Grade level is required")
    .regex(/^\d+$/, "Grade must be a number")
    .transform(Number)
    .refine((n) => n >= 1 && n <= 12, "Grade must be between 1 and 12"),
  content: z.string().optional(),
  topic: z.string().optional(),
  createWithAi: z.boolean(),
  createQuiz: z.boolean(),
  questionCount: z
    .number()
    .min(1, "Must have at least 1 question")
    .max(50, "Cannot exceed 50 questions")
    .optional(),
  isMultipleChoice: z.boolean().optional(),
});

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
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();

  // Modify your handleSubmit function:
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    // Prepare the data object
    const formData = {
      title,
      subject,
      level,
      content: createWithAi ? undefined : content,
      topic: createWithAi ? topic : undefined,
      createWithAi,
      createQuiz,
      questionCount: createQuiz ? questionCount : undefined,
      isMultipleChoice: createQuiz ? isMultipleChoice : undefined,
    };

    try {
      // Validate the data
      const validatedData = lessonSchema.parse(formData);
      setIsLoading(true);

      // Create lesson with validated data
      const lesson = await createLesson();
      if (!lesson) {
        throw new Error("Lesson creation failed.");
      }

      const { lessonId, lessonContent } = lesson;

      if (createQuiz && lessonId) {
        const quizCreated = await createQuizForLesson(lessonId, lessonContent);
        if (!quizCreated) {
          throw new Error("Quiz creation failed.");
        }
      }

      setSuccessMessage("Lesson created successfully!");
      resetForm();
      router.push("/lessons");
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        // Handle other errors
        setErrors({ submit: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle lesson creation (both AI and manual)
  const createLesson = async () => {
    try {
      if (createWithAi) {
        // AI-generated lesson
        return await sendLessonRequest(
          "http://localhost:3000/api/create-lesson",
          {
            title,
            subject,
            topic,
            level,
          }
        );
      } else {
        // User-provided lesson
        return await sendLessonRequest("http://localhost:3000/api/lessons", {
          title,
          content,
          subject,
        });
      }
    } catch (error) {
      console.error("Error creating lesson:", error.message);
      return null;
    }
  };

  // Function to send the lesson request (for both AI and regular lessons)
  const sendLessonRequest = async (url, body) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Failed to create lesson. Status: ${response.status}`);
      return null;
    }

    const lesson = await response.json();
    return { lessonId: lesson.id, lessonContent: lesson.content || content };
  };

  // Function to create the quiz
  const createQuizForLesson = async (lessonId, lessonContent) => {
    try {
      const response = await fetch("http://localhost:3000/api/create-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          title,
          content: lessonContent, // Use the lesson content
          questionCount,
          isMultipleChoice,
        }),
      });

      if (!response.ok) {
        console.error(`Failed to create quiz. Status: ${response.status}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error creating quiz:", error.message);
      return false;
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSubject("");
    setTopic("");
    setLevel("");
    setCreateWithAi(false);
    setCreateQuiz(false);
    setQuestionCount(15);
    setIsMultipleChoice(true);
    setErrors({});
  };

  const FormField = ({ label, error, children }) => (
    <div className="mb-4">
      <Label className="block mb-2">{label}</Label>
      {children}
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );

  return (
    <div className="max-w-4xl">
      <header className="bg-white p-4 py-6 flex justify-between items-center">
        <h1 className="header-title">Create New Lesson</h1>
      </header>
      <main className="p-6 gap-6">
        <Card className="p-6 bg-gradient-to-b from-indigo-200/25 to-yellow-100/25">
          <form onSubmit={handleSubmit}>
            {/* Title Field */}
            <FormField label="Title" error={errors.title}>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full p-2 rounded bg-white ${
                  errors.title ? "border-red-500" : ""
                }`}
                placeholder="Enter lesson title"
              />
            </FormField>

            {/* Subject Field */}
            <FormField label="Subject" error={errors.subject}>
              <Select
                value={subject}
                onValueChange={(value) => setSubject(value)}
                className={`w-full ${errors.subject ? "border-red-500" : ""}`}
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
            </FormField>

            {/* Grade Level Field */}
            <FormField label="Grade Level" error={errors.level}>
              <Input
                type="number"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className={`w-full p-2 rounded bg-white ${
                  errors.level ? "border-red-500" : ""
                }`}
                min="1"
                max="12"
                placeholder="Enter grade level (1-12)"
              />
            </FormField>

            {/* AI Creation Toggle */}
            <FormField label="" error={errors.createWithAi}>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={createWithAi}
                  onChange={(e) => setCreateWithAi(e.target.checked)}
                  className="rounded border-gray-300 focus:ring-blue-500"
                />
                <span>Create with AI</span>
              </label>
            </FormField>

            {/* Conditional Topic Field (for AI creation) */}
            {createWithAi && (
              <FormField label="Topic" error={errors.topic}>
                <Input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={`w-full p-2 rounded bg-white ${
                    errors.topic ? "border-red-500" : ""
                  }`}
                  placeholder="Enter topic for AI generation"
                />
              </FormField>
            )}

            {/* Conditional Content Field (for manual creation) */}
            {!createWithAi && (
              <FormField label="Content" error={errors.content}>
                <MDEditor
                  value={content}
                  onChange={setContent}
                  preview="edit"
                  className={`w-full ${errors.content ? "border-red-500" : ""}`}
                />
              </FormField>
            )}

            {/* Quiz Creation Toggle */}
            <FormField label="" error={errors.createQuiz}>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={createQuiz}
                  onChange={(e) => setCreateQuiz(e.target.checked)}
                  className="rounded border-gray-300 focus:ring-blue-500"
                />
                <span>Create Quiz</span>
              </label>
            </FormField>

            {/* Conditional Quiz Fields */}
            {createQuiz && (
              <div className="space-y-4">
                <FormField
                  label="Number of Questions"
                  error={errors.questionCount}
                >
                  <Input
                    type="number"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className={`w-full p-2 rounded bg-white ${
                      errors.questionCount ? "border-red-500" : ""
                    }`}
                    min="1"
                    max="50"
                    placeholder="Enter number of questions (1-50)"
                  />
                </FormField>

                <FormField label="" error={errors.isMultipleChoice}>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isMultipleChoice}
                      onChange={(e) => setIsMultipleChoice(e.target.checked)}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span>Multiple Choice Questions</span>
                  </label>
                </FormField>
              </div>
            )}

            {/* Error Message Display */}
            {errors.submit && (
              <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
                {errors.submit}
              </div>
            )}

            {/* Success Message Display */}
            {successMessage && (
              <div className="text-green-500 mb-4 p-2 bg-green-50 rounded">
                {successMessage}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isLoading}
              >
                Reset
              </Button>
              <Button
                type="submit"
                className={`px-4 py-2 rounded ${
                  isLoading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <span className="animate-spin">↻</span>
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create Lesson"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
