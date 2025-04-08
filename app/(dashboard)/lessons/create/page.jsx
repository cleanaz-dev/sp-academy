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
import { getAllCourses } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";

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
  course: "",
  title: "",
  content: "",
  subject: "",
  level: 1,
  createWithAi: true,
  createQuiz: false,
  questionCount: 12,
  isMultipleChoice: false,
  lessonType: "Lecture",
  visualStyle: "",
  objectives: [],
  generateImage: false,
  generateVideo: false,
  exercises: [],
};

const transformDirectives = () => {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === "textDirective" ||
        node.type === "leafDirective" ||
        node.type === "containerDirective"
      ) {
        const data = node.data || (node.data = {});

        // Map directive names to CSS classes
        const classMap = {
          note: "border-l-4 border-blue-500 bg-blue-100 p-4 my-4",
          warning: "border-l-4 border-red-500 bg-red-100 p-4 my-4",
          success: "border-l-4 border-green-500 bg-green-100 p-4 my-4",
        };

        data.hName = "div";
        data.hProperties = {
          className: classMap[node.name] || "border p-4 my-4",
        };
      }
    });
  };
};

export default function CreateLesson() {
  const [lessonOptions, setLessonOptions] = useState(initialLessonOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [newCourseLevel, setNewCourseLevel] = useState("Beginner"); // Default level
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isAddingNewCourse, setIsAddingNewCourse] = useState(false); // Toggle for adding new course

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [preview, setPreview] = useState("");
  const router = useRouter();

  const bottomRef = useRef();

  // Handle adding a new course
  const handleAddCourse = async () => {
    if (!newCourseName || !newCourseDescription || !newCourseLevel) {
      // If any field is empty, show an error message
      toast.error("Please fill in all fields.");
      return;
    }

    setIsAddingCourse(true);

    try {
      const newCourse = {
        title: newCourseName,
        description: newCourseDescription,
        level: newCourseLevel.toLocaleUpperCase(),
      };

      console.log("Adding new course:", newCourse);

      const response = await addNewCourseAPI(newCourse);

      // Reset form fields
      setNewCourseName("");
      setNewCourseDescription("");
      setNewCourseLevel("Beginner");
      setIsAddingNewCourse(false);

      toast.success("Course added successfully! Please reload page");
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Failed to add new course. Please try again.");
    } finally {
      setIsAddingCourse(false);
    }
  };

  const addNewCourseAPI = async (course) => {
    const response = await fetch("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(course),
    });

    if (!response.ok) {
      throw new Error("Failed to add new course");
    }

    return response.json();
  };
  // Fetch courses for the select field
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await getAllCourses();
        setCourses(courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!isLoading && preview) {
      // Smooth scroll to the preview section instead of the bottom
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest", // This will scroll to the nearest edge
      });
    }
  }, [isLoading, preview]);

  const getEndpointAndData = (lessonOptions) => {
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

    return { endpoint, additionalData };
  };

  const prepareLessonData = (lessonOptions, additionalData) => ({
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
    exercises: lessonOptions.exercises,
    ...additionalData,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Optional: Validate the data here (e.g., using Zod schema)
      // const validatedData = lessonSchema.parse(lessonOptions);

      const { endpoint, additionalData } = getEndpointAndData(lessonOptions);
      const lessonData = prepareLessonData(lessonOptions, additionalData);

      const lessonResponse = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonData),
      });

      if (!lessonResponse.ok) {
        throw new Error(
          `Failed to create ${lessonOptions.lessonType.toLowerCase()}`,
        );
      }

      const data = await lessonResponse.json();

      // Set preview based on lesson type
      switch (lessonOptions.lessonType) {
        case "Lecture":
          setPreview({
            type: "lecture",
            content: data.responseText, // Markdown or plain text
          });
          break;
        case "Exercise":
          setPreview({
            type: "exercise",
            exercises: data.exercises, // Array of exercises
          });
          break;
        case "Visual":
          setPreview({
            type: "visual",
            media: data.media, // Array of images or videos
          });
          break;
        default:
          throw new Error("Invalid lesson type");
      }

      setSuccessMessage("Lesson created successfully!");
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error) => {
    if (error instanceof z.ZodError) {
      const newErrors = error.errors.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      setErrors(newErrors);
      toast.error(error.message);
    } else {
      setErrors({ submit: error.message });
      toast.error(error.message);
    }
    console.error("Error creating lesson:", error);
  };

  const ExercisePreview = ({ exercises }) => {
    return (
      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <div key={index} className="rounded-lg border p-4">
            <h3 className="font-medium">{exercise.type.replace(/_/g, " ")}</h3>
            <p className="text-sm text-gray-600">{exercise.question}</p>

            {/* Render image if available */}
            {exercise.additional_data?.image_url && (
              <div className="relative my-4 h-[200px] w-full">
                <img
                  src={exercise.additional_data.image_url}
                  alt="Exercise image"
                  className="h-full w-full rounded-lg object-contain"
                  loading="lazy"
                />
              </div>
            )}

            {/* Render audio if available */}
            {exercise.additional_data?.audio_url && (
              <audio controls className="mt-2 w-full">
                <source
                  src={exercise.additional_data.audio_url}
                  type="audio/mpeg"
                />
                Your browser does not support the audio element.
              </audio>
            )}

            {/* Render hint if available */}
            {exercise.additional_data?.hint && (
              <p className="mt-2 text-sm text-gray-500">
                <strong>Hint:</strong> {exercise.additional_data.hint}
              </p>
            )}

            {/* Render verb conjugation if available */}
            {exercise.additional_data?.verb_conjugation && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <strong>Verb Conjugation:</strong>
                </p>
                <ul className="text-sm text-gray-600">
                  {Object.entries(
                    exercise.additional_data.verb_conjugation,
                  ).map(([pronoun, conjugation]) => (
                    <li key={pronoun}>
                      <strong>{pronoun}:</strong> {conjugation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Render options for drag-and-drop or matching pairs */}
            {exercise.additional_data?.options && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <strong>Options:</strong>
                </p>
                <ul className="text-sm text-gray-600">
                  {exercise.additional_data.options.map((option, i) => (
                    <li key={i}>{option}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Render pairs for matching_pairs */}
            {exercise.additional_data?.pairs && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <strong>Pairs:</strong>
                </p>
                <ul className="text-sm text-gray-600">
                  {exercise.additional_data.pairs.map((pair, i) => (
                    <li key={i}>{pair}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Render correct answer */}
            <p className="mt-2 text-sm text-gray-600">
              <strong>Correct Answer:</strong>{" "}
              {typeof exercise.correct_answer === "object"
                ? JSON.stringify(exercise.correct_answer, null, 2)
                : exercise.correct_answer}
            </p>
          </div>
        ))}
      </div>
    );
  };
  const MediaPreview = ({ media }) => {
    return (
      <div className="space-y-4">
        {media.map((item, index) => (
          <div key={index} className="rounded-lg border p-4">
            {item.type === "image" && (
              <img
                src={item.url}
                alt="Media content"
                className="mt-2 rounded-lg"
              />
            )}
            {item.type === "video" && (
              <video controls className="mt-2 rounded-lg">
                <source src={item.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        ))}
      </div>
    );
  };

  const Preview = ({ preview }) => {
    if (!preview) {
      return <div className="text-gray-500">No preview available.</div>;
    }

    switch (preview.type) {
      case "lecture":
        return (
          <div className="prose prose-sm max-w-none">
            <Markdown remarkPlugins={[remarkGfm]}>{preview.content}</Markdown>
          </div>
        );
      case "exercise":
        return <ExercisePreview exercises={preview.exercises} />;
      case "visual":
        return <MediaPreview media={preview.media} />;
      default:
        return <div className="text-gray-500">Invalid preview type.</div>;
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
      Lecture: "/api/lessons/lecture/save",
      Visual: "/api/lessons/visual/save",
      Exercise: "/api/lessons/exercise/save", // Updated to match the endpoint
    };

    // Get the API route based on lessonOptions.type
    const apiRoute = apiRoutes[lessonOptions.lessonType];

    if (!apiRoute) {
      toast.error("Invalid lesson type");
      setIsSaving(false);
      return;
    }

    try {
      // Prepare the payload for the lesson
      const lessonPayload = {
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
        content: preview?.content,
        courseId: lessonOptions.course,
      };

      // Add exercises to the payload if the lesson type is "Exercise"
      if (lessonOptions.lessonType === "Exercise" && preview?.exercises) {
        lessonPayload.exercises = preview.exercises;
      }

      // Step 1: Create the lesson
      const lessonResponse = await fetch(apiRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonPayload),
      });

      console.log("lesson response:", lessonResponse);

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
            console.error(
              `Failed to create quiz. Status: ${quizResponse.status}`,
            );
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

      // Redirect to the lesson page or dashboard
      router.push(`/courses/${lessonOptions.course}/lesson/${lessonId}`);
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast.error("Failed to create lesson");
    } finally {
      setIsSaving(false);
    }
  };

  const exerciseTypes = [
    {
      id: "image_word_input",
      label: "Image-Based Word Input",
      description:
        "A vocabulary exercise where students are shown an image and must describe it as accurately as possible.",
    },
    {
      id: "drag_and_drop",
      label: "Drag-and-Drop Word Structure",
      description:
        "An exercise where students arrange words in the correct order by dragging them into empty spaces to form a proper sentence. For example: arranging scattered words like [happy] [is] [she] into 'She is happy'.",
    },
    {
      id: "fill_in_blank",
      label: "Fill-in-the-Blank",
      description:
        "Students complete sentences by typing the missing word into a blank space. For example: 'The sun rises in the _____' where students must type 'east'.",
    },
    {
      id: "matching_pairs",
      label: "Matching Pairs",
      description:
        "Students match items from two columns that are related to each other. For example, matching English words to their Spanish translations, or words to their definitions.",
    },
    {
      id: "audio_based",
      label: "Audio-Based Exercises",
      description:
        "Students listen to conversation try their best to explain what will happen next.",
    },
  ];
  const AudioModule = ({ src }) => {
    return (
      <div className="my-4 rounded-lg bg-gray-100 p-4">
        <audio controls src={src}>
          Your browser does not support the audio element.
        </audio>
        <div className="mt-2 text-sm text-gray-500">Audio: {src}</div>
      </div>
    );
  };

  const Flashcard = ({ front, back }) => {
    const [showBack, setShowBack] = useState(false);

    return (
      <div
        className="mx-auto my-4 flex h-40 w-64 cursor-pointer items-center justify-center rounded-lg bg-white p-4 text-center shadow-lg transition-colors duration-200 hover:bg-gray-50"
        onClick={() => setShowBack(!showBack)}
      >
        {showBack ? (
          <div className="font-semibold text-red-600">{back}</div>
        ) : (
          <div className="font-semibold text-blue-600">{front}</div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create New Lesson
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Fill in the details below to create a new lesson plan
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Card className="bg-white shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Primary Section */}
              <div className="border-b p-6">
                <h2 className="mb-6 text-lg font-medium text-gray-900">
                  Course Information
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="">
                    {" "}
                    {/* Add vertical spacing between elements */}{" "}
                    {/* Add margin bottom to the course selector */}
                    <Label className="mb-2">Course</Label>
                    <Select
                      value={lessonOptions.course}
                      onValueChange={(value) =>
                        handleInputChange("course", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end justify-start">
                    <Button
                      type="button"
                      onClick={() => setIsAddingNewCourse((prev) => !prev)} // Toggle adding new course
                    >
                      {isAddingNewCourse ? "Cancel" : "Add New Course"}
                    </Button>
                  </div>
                  <div className="col-span-2">
                    {isAddingNewCourse && (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label>Course Name</Label>
                          <Input
                            type="text"
                            value={newCourseName}
                            onChange={(e) => setNewCourseName(e.target.value)}
                            placeholder="Enter new course name"
                          />
                        </div>
                        <div>
                          <Label>Course Description</Label>
                          <Input
                            type="text"
                            value={newCourseDescription}
                            onChange={(e) =>
                              setNewCourseDescription(e.target.value)
                            }
                            placeholder="Enter course description"
                          />
                        </div>
                        <div>
                          <Label>Course Level</Label>
                          <Select
                            value={newCourseLevel}
                            onValueChange={setNewCourseLevel}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">
                                Intermediate
                              </SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div></div>
                        <Button
                          type="button"
                          onClick={handleAddCourse}
                          disabled={isAddingCourse}
                        >
                          {isAddingCourse ? "Adding..." : "Add Course"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-b p-6">
                <h2 className="-mt-4 mb-6 text-lg font-medium text-gray-900">
                  Lesson Information
                </h2>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    {" "}
                    <Label>Title</Label>
                    <Input
                      name="title"
                      value={lessonOptions.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
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
                        <SelectItem value="Spirituality">
                          Spirituality
                        </SelectItem>
                        <SelectItem value="Social Studies">
                          Social Studies
                        </SelectItem>
                        <SelectItem value="Language">Language</SelectItem>
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
                      onChange={(e) =>
                        handleInputChange("level", e.target.value)
                      }
                      min="1"
                      max="12"
                      placeholder="Enter grade level (1-12)"
                    />
                  </div>
                  {/* Exercise Options */}
                  {lessonOptions.lessonType === "Exercise" && (
                    <div className="col-span-2">
                      <h2 className="mb-6 text-lg font-medium text-gray-900">
                        Exercise Options
                      </h2>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {exerciseTypes.map((exercise) => (
                          <div
                            key={exercise.id}
                            className="rounded border p-4 shadow-sm"
                          >
                            <div className="flex flex-col space-y-2">
                              <div>
                                <Label>{exercise.label}</Label>
                                <p className="text-sm text-gray-500">
                                  {exercise.description}
                                </p>
                              </div>
                              <div>
                                <Input
                                  type="number"
                                  value={
                                    lessonOptions.exercises[exercise.id] || 0
                                  }
                                  onChange={(e) => {
                                    const value = Math.min(
                                      Number(e.target.value),
                                      10,
                                    ); // Limit to 10
                                    handleInputChange("exercises", {
                                      ...lessonOptions.exercises,
                                      [exercise.id]: value,
                                    });
                                  }}
                                  min="0"
                                  max="10"
                                  className="w-20"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Total Exercises */}
                      <div className="mt-4 text-sm text-gray-500">
                        Total exercises:{" "}
                        {Object.values(lessonOptions.exercises).reduce(
                          (sum, count) => sum + count,
                          0,
                        )}{" "}
                        / 10
                      </div>
                    </div>
                  )}

                  {/* Learning Objectives */}
                  <div className="col-span-2">
                    {lessonOptions.objectives?.map((objective, index) => (
                      <div key={index} className="">
                        <Label className="my-2 block">
                          Objective {index + 1}
                        </Label>
                        <div className="flex items-center">
                          <Input
                            type="text"
                            value={objective}
                            onChange={(e) => {
                              const newObjectives = [
                                ...lessonOptions.objectives,
                              ];
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
                                  (_, i) => i !== index,
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
                    <Label className="mb-1 block">Learning Objectives</Label>
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
              <div className="border-b p-6">
                <h2 className="-mt-4 mb-6 text-lg font-medium text-gray-900">
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
              <div className="border-b p-6">
                <h2 className="-mt-4 mb-6 text-lg font-medium text-gray-900">
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
                          onChange={(e) =>
                            handleInputChange("questionCount", e.target.value)
                          }
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
              <div className="border-b p-6">
                <h2 className="-mt-4 mb-6 text-lg font-medium text-gray-900">
                  Preview
                </h2>
                <div className="max-h-[800px] overflow-y-auto rounded-lg border p-4">
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
                    // Dynamic preview based on lesson type
                    <div className="prose prose-sm max-w-none">
                      {preview.type === "lecture" && (
                        <Markdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Custom components for styling
                            h1: ({ node, ...props }) => (
                              <h1
                                className="mb-4 text-3xl font-bold text-blue-600"
                                {...props}
                              />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2
                                className="mb-3 mt-6 text-xl font-semibold text-green-600"
                                {...props}
                              />
                            ),
                            p: ({ node, ...props }) => {
                              const content = props.children?.toString() || "";

                              // Handle color tags (e.g., :::blue:::text::blue::)
                              const colorMatches = content.match(
                                /:::(\w+):::([\s\S]*?):::\1:::/,
                              );
                              if (colorMatches) {
                                const colorMap = {
                                  blue: "text-blue-600",
                                  red: "text-red-600",
                                  green: "text-green-600",
                                };
                                return (
                                  <p className={colorMap[colorMatches[1]]}>
                                    {colorMatches[2]}
                                  </p>
                                );
                              }

                              // Handle custom components (e.g., :::component::alert:::message)
                              const componentMatch = content.match(
                                /:::component::(\w+):::([\s\S]*)/,
                              );
                              if (componentMatch) {
                                const componentName = componentMatch[1];
                                const componentContent = componentMatch[2];

                                // Component implementations
                                const componentMap = {
                                  alert: ({ children }) => (
                                    <div className="my-4 border-l-4 border-red-500 bg-red-100 p-4 text-red-700">
                                      ⚠️ {children}
                                    </div>
                                  ),
                                  info: ({ children }) => (
                                    <div className="my-4 border-l-4 border-blue-500 bg-blue-100 p-4 text-blue-700">
                                      ℹ️ {children}
                                    </div>
                                  ),
                                  tip: ({ children }) => (
                                    <div className="my-4 border-l-4 border-green-500 bg-green-100 p-4 text-green-700">
                                      💡 {children}
                                    </div>
                                  ),
                                  // Simple test component
                                  note: ({ children }) => (
                                    <div className="my-4 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
                                      📝 Note: {children}
                                    </div>
                                  ),
                                  audio: ({ src }) => <AudioModule src={src} />,
                                  flashcard: ({ front, back }) => (
                                    <Flashcard front={front} back={back} />
                                  ),
                                };

                                const Component = componentMap[componentName];
                                if (Component) {
                                  // Parse props if needed (e.g., JSON string)
                                  try {
                                    const props = JSON.parse(componentContent);
                                    return <Component {...props} />;
                                  } catch {
                                    return (
                                      <Component>{componentContent}</Component>
                                    );
                                  }
                                }
                              }

                              // Handle other styles
                              if (content.startsWith("::border::")) {
                                return (
                                  <div className="my-4 border-2 border-gray-400 p-4">
                                    {content.replace("::border::", "")}
                                  </div>
                                );
                              }

                              if (content.startsWith("::highlight::")) {
                                return (
                                  <span className="bg-yellow-200 px-1">
                                    {content.replace("::highlight::", "")}
                                  </span>
                                );
                              }

                              if (content.startsWith("::bg-blue::")) {
                                return (
                                  <div className="rounded bg-blue-100 p-4">
                                    {content.replace("::bg-blue::", "")}
                                  </div>
                                );
                              }

                              // Default paragraph
                              return (
                                <p
                                  className="mb-3 leading-relaxed text-gray-800"
                                  {...props}
                                />
                              );
                            },
                            strong: ({ node, ...props }) => (
                              <strong
                                className="font-semibold text-red-600"
                                {...props}
                              />
                            ),
                            table: ({ node, ...props }) => (
                              <div className="my-4 overflow-x-auto">
                                <table
                                  className="min-w-full border-collapse border border-gray-200"
                                  {...props}
                                />
                              </div>
                            ),
                            img: ({ node, ...props }) => {
                              // Log the props to the console
                              console.log("Image Props:", props);

                              return (
                                <div className="relative my-4 w-full">
                                  <img
                                    src={props.src} // Use the src attribute from the Markdown
                                    alt={props.alt} // Use the alt attribute from the Markdown
                                    className="h-auto w-full rounded-lg" // Add styling as needed
                                    onError={(e) => {
                                      // Fallback in case the image fails to load
                                      e.target.onerror = null;
                                      e.target.src =
                                        "path/to/fallback-image.png";
                                    }}
                                  />
                                </div>
                              );
                            },
                          }}
                        >
                          {typeof preview.content === "string"
                            ? preview.content
                            : ""}
                        </Markdown>
                      )}

                      {preview.type === "exercise" && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                          <h3 className="mb-2 text-lg font-semibold text-yellow-800">
                            Exercise Preview
                          </h3>
                          <pre className="whitespace-pre-wrap font-mono text-sm">
                            {JSON.stringify(preview.content, null, 2)}
                          </pre>
                        </div>
                      )}
                      {preview.type === "story" && (
                        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                          <h3 className="mb-2 text-lg font-semibold text-purple-800">
                            Story Preview
                          </h3>
                          <p className="italic text-gray-700">
                            {preview.content.text}
                          </p>
                          {preview.content.audio && (
                            <div className="mt-4 rounded border bg-white p-3">
                              <span className="text-sm text-gray-500">
                                Audio placeholder
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      Lesson preview will be available here after submitting the
                      form.
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreview(null)}
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
                {!preview ? (
                  <Button
                    type="submit"
                    className={`rounded px-4 py-2 ${
                      isLoading
                        ? "cursor-not-allowed bg-blue-300"
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
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className={`rounded px-4 py-2 ${
                      isSaving
                        ? "cursor-not-allowed bg-blue-300"
                        : "bg-blue-500 hover:bg-blue-600"
                    } text-white`}
                    disabled={isSaving}
                    onClick={handleSaveLesson}
                  >
                    {isSaving ? (
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
        </div>
      </main>
    </div>
  );
}
