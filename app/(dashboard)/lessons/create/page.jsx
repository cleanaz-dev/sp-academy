"use client";

import { useState, useRef, useEffect } from "react";
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
import { X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Skeleton } from "@/components/ui/skeleton";
import { createImagesForLecture } from "@/lib/replicate";

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

const initialLessonOptions = {
  title: "",
  content: "",
  subject: "",
  level: 1,
  createWithAi: true,
  createQuiz: false,
  questionCount: 15,
  isMultipleChoice: false,
  lessonType: "Lecture",
  exerciseType: "",
  visualStyle: "",
  objectives: [],
  generateImage: false,
  generateVideo: false,
};

export default function CreateLesson() {
  const [lessonOptions, setLessonOptions] = useState(initialLessonOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [preview, setPreview] = useState("");
  const router = useRouter();

  const bottomRef = useRef()

  useEffect(() => {
    if (!isLoading && preview) {
      // Smoothly scroll to the bottom when preview is loaded
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isLoading, preview]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validate the data first
      // const validatedData = lessonSchema.parse(lessonOptions);

      // Determine the endpoint based on lesson type
      let endpoint;
      let additionalData = {};

      switch (lessonOptions.lessonType) {
        case "Lecture":
          endpoint = "/api/lessons/lecture/create";
          additionalData = { focusArea: lessonOptions.focusArea };
          break;
        case "Exercise":
          endpoint = "/api/lessons/exercise/create";
          additionalData = { exerciseType: lessonOptions.exerciseType };
          break;
        case "Visual":
          endpoint = "/api/lessons/visual/create";
          additionalData = { visualStyle: lessonOptions.visualStyle };
          break;
        default:
          throw new Error("Invalid lesson type");
      }

      // Send the request to create the lesson
      const lessonResponse = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lessonOptions.title,
          subject: lessonOptions.subject,
          level: lessonOptions.level,
          type: lessonOptions.lessonType,
          objectives: lessonOptions.objectives,
          generateImage: lessonOptions.generateImage,
          generateVideo: lessonOptions.generateVideo,
          createQuiz: lessonOptions.createQuiz,
          questionCount: lessonOptions.questionCount,
          isMultipleChoice: lessonOptions.isMultipleChoice,
          ...additionalData,
        }),
      });

      if (!lessonResponse.ok) {
        toast.error(
          `Failed to create ${lessonOptions.lessonType.toLowerCase()}`
        );
      }

      const lessonData = await lessonResponse.json();
      setPreview(lessonData.responseText);

      // If quiz creation is enabled, create the quiz
      // if (lessonOptions.createQuiz && lessonData.id) {
      //   const quizResponse = await fetch("/api/create-quiz", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       lessonId: lessonData.id,
      //       title: lessonOptions.title,
      //       content: lessonData.responseText,
      //       questionCount: lessonOptions.questionCount,
      //       isMultipleChoice: lessonOptions.isMultipleChoice,
      //     }),
      //   });

      //   if (!quizResponse.ok) {
      //     toast.error("Failed to create quiz");
      //   }
      // }

      setSuccessMessage("Lesson created successfully!");
      // resetForm();
      // router.push("/lessons");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
        toast.error(error.message);
      } else {
        setErrors({ submit: error.message });
      }
      console.error("Error creating lesson:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // // Function to handle lesson creation (both AI and manual)
  // const createLessonOld = async () => {
  //   try {
  //     const baseData = {
  //       title,
  //       subject,
  //       level,
  //       topic: createWithAi ? topic : undefined,
  //     };

  //     let endpoint;
  //     let additionalData = {};

  //     switch (lessonType) {
  //       case "Lecture":
  //         endpoint = "/api/lessons/lecture/create";
  //         additionalData = { focusArea };
  //         break;
  //       case "Exercise":
  //         endpoint = "/api/lessons/exercise/create";
  //         additionalData = { exerciseType };
  //         break;
  //       case "Visual":
  //         endpoint = "/api/lessons/visual/create";
  //         additionalData = { visualStyle };
  //         break;
  //       default:
  //         throw new Error("Invalid lesson type");
  //     }

  //     const response = await fetch(endpoint, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         ...baseData,
  //         ...additionalData,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Failed to create ${lessonType.toLowerCase()}`);
  //     }

  //     const data = await response.json();
  //     return {
  //       lessonId: data.id,
  //       lessonContent: data.responseText,
  //     };
  //   } catch (error) {
  //     console.error(`Error creating ${lessonType.toLowerCase()}:`, error);
  //     return null;
  //   }
  // };

  // Function to create the quiz
  // const createQuizForLessonOld = async (lessonId, lessonContent) => {
  //   try {
  //     const response = await fetch("/api/create-quiz", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         lessonId,
  //         title,
  //         content: lessonContent, // Use the lesson content
  //         questionCount,
  //         isMultipleChoice,
  //       }),
  //     });

  //     if (!response.ok) {
  //       console.error(`Failed to create quiz. Status: ${response.status}`);
  //       return false;
  //     }

  //     return true;
  //   } catch (error) {
  //     console.error("Error creating quiz:", error.message);
  //     return false;
  //   }
  // };

    // Modify your handleSubmit function:
  const handleSubmitOld = async (e) => {
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

  const handleInputChange = (field, value) => {
    setLessonOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewObjective = () => {
    if (newObjective.trim()) {
      setLessonOptions((prev) => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()],
      }));
      setNewObjective("");
    }
  };

  const resetForm = () => {
    setLessonOptions(initialLessonOptions);
    setErrors({});
  };

  const handleSaveLesson = async () => {
    setIsSaving(true);
  
    // Mapping object for dynamic API routes based on lesson type
    const apiRoutes = {
      "Lecture": "/api/lessons/lecture/save",
      "Visual": "/api/lessons/visual/save",
      "Exercise": "/api/lessons/create/save",
    };
  
    // Get the API route based on lessonOptions.type
    const apiRoute = apiRoutes[lessonOptions.lessonType];
  
    if (!apiRoute) {
      toast.error("Invalid lesson type");
      setIsSaving(false);
      return;
    }
  
    try {
      // Step 1: Create the lesson
      const lessonResponse = await fetch(apiRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lessonOptions.title,
          content: preview,
          subject: lessonOptions.subject,
          level: lessonOptions.level,
          type: lessonOptions.lessonType,
        }),
      });
  
      if (!lessonResponse.ok) {
        toast.error("Failed to create lesson");
        return;
      }
  
      const lessonData = await lessonResponse.json();
      const lessonId = lessonData.id;
  
      // Step 2: Create the quiz if the option is enabled and the lesson was created successfully
      if (lessonOptions.createQuiz && lessonId) {
        try {
          const quizResponse = await fetch("/api/create-quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lessonId,
              title: lessonOptions.title,
              content: preview,
              questionCount: lessonOptions.questionCount,
              isMultipleChoice: lessonOptions.isMultipleChoice,
            }),
          });
  
          if (!quizResponse.ok) {
            console.error(`Failed to create quiz. Status: ${quizResponse.status}`);
            toast.error("Failed to create quiz");
            return;
          }
  
          toast.success("Lesson and quiz created successfully!");
        } catch (quizError) {
          console.error("Error creating quiz:", quizError.message);
          toast.error("Failed to create quiz");
        }
      } else {
        toast.success("Lesson created successfully!");
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast.error("Failed to create lesson");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create New Lesson
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Fill in the details below to create a new lesson plan
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <Card className="bg-white shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Primary Section */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Basic Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  {" "}
                  <Label>Title</Label>
                  <Input
                    name="title"
                    value={lessonOptions.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select
                    value={lessonOptions.subject}
                    onValueChange={(value) =>
                      handleInputChange("subject", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="Spirituality">Spirituality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lesson Type</Label>
                  <Select
                    value={lessonOptions.lessonType}
                    onValueChange={(value) =>
                      handleInputChange("lessonType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lesson type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lecture">Lecture</SelectItem>
                      <SelectItem value="Exercise">Exercise</SelectItem>
                      <SelectItem value="Visual">Visual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Grade Level</Label>
                  <Input
                    type="number"
                    value={lessonOptions.level}
                    onChange={(e) => handleInputChange("level", e.target.value)}
                    min="1"
                    max="12"
                    placeholder="Enter grade level (1-12)"
                  />
                </div>
                <div className="col-span-2">
                  {lessonOptions.objectives?.map((objective, index) => (
                    <div key={index} className="">
                      <Label className="block my-2">
                        Objective {index + 1}
                      </Label>
                      <div className="flex items-center">
                        <Input
                          type="text"
                          value={objective}
                          onChange={(e) => {
                            const newObjectives = [...lessonOptions.objectives];
                            newObjectives[index] = e.target.value;
                            handleInputChange("objectives", newObjectives);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newObjectives =
                              lessonOptions.objectives.filter(
                                (_, i) => i !== index
                              );
                            handleInputChange("objectives", newObjectives);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="col-span-2">
                  <Label className="block mb-1">Learning Objectives</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="text"
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleNewObjective}
                      variant="secondary"
                    >
                      Add Objective
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            {/* Content Generation Sectionb */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Content Creation
              </h2>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label>Create Lesson with AI</Label>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={lessonOptions.createWithAi}
                      onCheckedChange={(checked) =>
                        handleInputChange("createWithAi", checked)
                      }
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <Label>Generate Images</Label>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={lessonOptions.generateImage}
                      onCheckedChange={(checked) =>
                        handleInputChange("generateImage", checked)
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Generate Video Clips</Label>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={lessonOptions.generateVideo}
                      onCheckedChange={(checked) =>
                        handleInputChange("generateVideo", checked)
                      }
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Quiz Options */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Quiz Options
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Generate Lesson with Quiz</Label>
                  <div>
                    <Switch
                      checked={lessonOptions.createQuiz}
                      onCheckedChange={(checked) =>
                        handleInputChange("createQuiz", checked)
                      }
                    />
                  </div>
                </div>
              </div>
              {lessonOptions.createQuiz && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label>Multiple-Choice Questions</Label>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={lessonOptions.isMultipleChoice}
                        onCheckedChange={(checked) =>
                          handleInputChange("isMultipleChoice", checked)
                        }
                      />
                    </div>
                  </div>
                  {lessonOptions.isMultipleChoice && (
                    <div>
                      <Label>Nnumber of Questions</Label>
                      <Input
                        type="number"
                        value={lessonOptions.questionCount}
                        onChange={(e) => handleInputChange("questionCount", e.target.value)}
                        min="1"
                        max="15"
                        placeholder="Enter number of questions (1-15)"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Preview Section */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Preview
              </h2>
              <div>
                {isLoading ? (
                  // Loading skeleton
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-[250px]" />
                    <Skeleton className="h-4 w-[300px]" />
                    <Skeleton className="h-[200px] w-full" />
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[275px]" />
                    <Skeleton className="h-[200px] w-full" />
                  </div>
                ) : preview ? (
                  <div className="prose prose-sm max-w-none">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({ node, ...props }) => (
                          <div className="relative w-full h-[300px] my-4">
                            <img
                              src={props.src}
                              alt={props.alt || "Lesson image"}
                              className="object-contain rounded-lg w-full h-full"
                              loading="lazy"
                            />
                          </div>
                        ),
                      }}
                    >
                      {preview}
                    </Markdown>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    Lesson preview will be available here after submitting the
                    form.
                  </div>
                )}
              </div>
              <div>
              <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreview("")}
                    disabled={!preview}
                    >
                    Clear Preview 
                    </Button>
                 
              </div>
             
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 p-6">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isLoading}
              >
                Reset
              </Button>
              {!preview ? (<Button
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
                    <span>Generating...</span>
                  </div>
                ) : (
                  "Generate Lesson Preview"
                )}
              </Button> ) : (
                <Button
                  type="button"
                  className={`px-4 py-2 rounded ${
                    isSaving
                     ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white`}
                  disabled={isSaving}
                  onClick={handleSaveLesson}
                >
                  {isSaving? (
                    <div className="flex items-center space-x-2">
                      <span className="animate-spin">↻</span>
                      <span>Publishing...</span>
                    </div>
                  ) : (
                    "Publish Lesson"
                  )}
                </Button>
              )}
            </div>
            <div ref={bottomRef} />
          </form>
        </Card>
      </main>
    </div>
  );
}
