"use client";

import { useState, useRef, useEffect } from "react";
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
import {
  X,
  VolumeX,
  Mic,
  BookOpen,
  MessageSquare,
  Star,
  MessageCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllCourses } from "@/lib/actions";
import { visit } from "unist-util-visit";
import { Tooltip } from "react-tooltip";
import { AudioLines } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PronunciationTestFR from "@/components/lessons/PronuncationTestFR";
import ShinyStar from "@/components/ui/ShinyStar";
import ConversationWithAi from "@/components/lessons/ConversationWithAi";

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
  title: "French ER Verbs",
  content: "",
  subject: "Language",
  level: 5,
  enableExercises: false, // New field
  createWithAi: true,
  createQuiz: false,
  questionCount: 12,
  isMultipleChoice: false,
  focusArea: "",
  lessonType: "Lesson",
  visualStyle: "",
  objectives: ["Present Tense"],
  generateImage: true,
  generateVideo: false,
  exercises: [],
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
  const generatingRef = useRef();

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

  const AudioModule = ({ text, language }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speakText = (text, language) => {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 1;
        utterance.pitch = 1;

        // Start speaking
        speechSynthesis.speak(utterance);
        setIsSpeaking(true);

        // Handle when speech ends
        utterance.onend = () => {
          setIsSpeaking(false);
        };

        // Handle errors
        utterance.onerror = () => {
          setIsSpeaking(false);
          alert("An error occurred while speaking.");
        };
      } else {
        alert("Your browser does not support the Web Speech API.");
      }
    };

    const stopSpeaking = () => {
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };

    return (
      <>
        <button
          type="button"
          onClick={isSpeaking ? stopSpeaking : () => speakText(text, language)}
          className={`rounded-full p-3 transition-all focus:outline-none ${
            isSpeaking
              ? "animate-pulse bg-blue-500 text-white shadow-lg"
              : "bg-white text-slate-800 shadow-md hover:bg-blue-50 hover:text-blue-500"
          }`}
          aria-label={isSpeaking ? "Stop speaking" : "Speak text"}
          data-tooltip-id="speech-button-tooltip"
          data-tooltip-content={isSpeaking ? "Stop Speaking" : "Speak Text"}
        >
          {isSpeaking ? (
            <VolumeX className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" /> // Use a microphone icon for a more professional look
          )}
        </button>

        {/* Tooltip */}
        <Tooltip id="speech-button-tooltip" place="top" className="z-50" />
      </>
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

  const ConjugationTable = ({
    verbs,
    tense,
    conjugation,
    englishTranslations,
  }) => {
    // Ensure we have data to work with
    if (!verbs || verbs.length === 0 || !conjugation || !englishTranslations) {
      return (
        <p className="text-lg italic text-gray-500">
          No conjugation data provided.
        </p>
      );
    }

    const verb = verbs[0];

    return (
      <div className="max-w-xl">
        <div className="">
          {/* Header */}
          <h2 className="mb-2 font-serif text-2xl font-bold text-blue-700">
            {verb}
          </h2>
          <h3 className="mb-6 text-lg font-medium capitalize italic text-gray-600">
            {tense}
          </h3>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-indigo-800">
                  <th className="rounded-tl-lg px-4 py-3 text-left font-semibold">
                    French
                  </th>
                  <th className="rounded-tr-lg px-4 py-3 text-left font-semibold">
                    English
                  </th>
                </tr>
              </thead>
              <tbody>
                {conjugation.map((french, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-200 transition-colors duration-200 hover:bg-gray-50"
                  >
                    <td className="flex items-center px-4 py-3 text-lg font-light text-gray-800">
                      {french}
                      <SpeakingModule
                        text={french}
                        speaker="Marie"
                        language="fr-FR"
                        className="group ml-2 text-gray-800 transition-colors duration-200 hover:text-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3 text-lg italic text-gray-700">
                      {englishTranslations[index]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ConjugationTableWrapper = ({ tables }) => {
    if (!tables || tables.length === 0) {
      return (
        <p className="text-lg italic text-gray-500">
          No conjugation tables provided.
        </p>
      );
    }

    return (
      <div className="mx-auto my-8 max-w-2xl">
        <div className="rounded-xl bg-white p-6">
          <Tabs defaultValue={tables[0].verbs[0]} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              {tables.map((table) => (
                <TabsTrigger
                  key={table.verbs[0]}
                  value={table.verbs[0]}
                  className="font-serif text-lg font-bold text-gray-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-700 data-[state=active]:text-blue-700"
                >
                  {table.verbs[0]}
                </TabsTrigger>
              ))}
            </TabsList>
            {tables.map((table) => (
              <TabsContent key={table.verbs[0]} value={table.verbs[0]}>
                <ConjugationTable
                  verbs={table.verbs}
                  tense={table.tense}
                  conjugation={table.conjugation}
                  englishTranslations={table.englishTranslations}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    );
  };

  const Goals = ({ title, hook, objectives, explanation }) => {
    return (
      <section className="mx-auto max-w-4xl p-6">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">
            {title.french}
          </h1>
          <h2 className="mt-1 text-lg text-gray-500">{title.english}</h2>
        </header>

        {/* Hook Section with ShinyStar */}
        <div className="relative mb-6 rounded-md bg-blue-100 p-4 text-center">
          <ShinyStar className="absolute left-2 top-2" />
          <p className="pl-7 text-base text-gray-800">{hook.french}</p>
          <p className="mt-1 pl-7 text-sm italic text-gray-600">
            {hook.english}
          </p>
        </div>

        {/* Objectives Grid */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: BookOpen, text: objectives.grammar, label: "Grammaire" },
            { icon: Mic, text: objectives.vocab, label: "Vocabulaire" },
            {
              icon: MessageSquare,
              text: objectives.communication,
              label: "Communication",
            },
          ].map(({ icon: Icon, text, label }, index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-md border border-gray-200 px-4 py-3"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-200">
                <Icon className="h-5 w-5 text-blue-700" />
              </div>
              <h3 className="mb-1 text-base font-medium text-gray-900">
                {label}
              </h3>
              <p className="text-center text-sm text-gray-800">{text.french}</p>
              <p className="mt-1 text-center text-xs italic text-gray-600">
                {text.english}
              </p>
            </div>
          ))}
        </div>

        {/* Explanation Section with ShinyStar */}
        <div className="relative rounded-md bg-blue-100 p-4 text-center">
          <ShinyStar className="absolute left-2 top-2" />
          <p className="pl-7 text-base text-gray-800">{explanation.french}</p>
          <p className="mt-1 pl-7 text-sm italic text-gray-600">
            {explanation.english}
          </p>
        </div>
      </section>
    );
  };

  const Dialogue = ({ title, lines, analysis }) => {
    const fullDialogueText = lines.map((line) => line.french).join(" ");
    const fullDialogueSpeakers = lines.map((line) => line.speaker).join(", ");

    return (
      <section className="mx-auto mb-10 max-w-3xl rounded-lg bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 p-6">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">
            {title.french}
          </h1>
          <h2 className="mt-1 text-lg text-gray-500">{title.english}</h2>
        </header>
        <div className="mb-4">
          {lines.map((line, index) => (
            <div key={index} className="mb-2 flex gap-3 rounded-lg p-3">
              <MessageCircle className="mt-1 h-5 w-5 fill-blue-600 text-blue-600" />
              <div className="flex flex-1 items-start">
                <span className="mr-2 font-bold">{line.speaker}:</span>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-gray-800">
                      {line.french}
                    </span>
                    <SpeakingModule
                      text={line.french}
                      speaker={index % 2 === 0 ? "Female" : "Male"} // Even = female, odd = male
                      language="fr-FR"
                    />
                  </div>
                  <span className="text-xs italic text-gray-600">
                    {line.english}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <ConversationWithAi />
        </div>

        <div className="relative rounded-lg border border-dotted border-blue-600/50 bg-white p-4">
          <Star className="absolute left-2 top-2 h-5 w-5 fill-amber-300 text-amber-300" />
          <p className="pl-7 text-base text-gray-800">{analysis.french}</p>
          <p className="mt-1 pl-7 text-sm italic text-gray-600">
            {analysis.english}
          </p>
        </div>
      </section>
    );
  };

  const SpeakingModule = ({ text, speaker, language, className }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioRef = useRef(null);
    const mediaSourceRef = useRef(null);
    const sourceBufferRef = useRef(null);
    const readerRef = useRef(null);
    const isCancelled = useRef(false);

    const speakText = async (text, speaker) => {
      try {
        setIsSpeaking(true);
        isCancelled.current = false;

        const mediaSource = new MediaSource();
        mediaSourceRef.current = mediaSource;
        const audio = new Audio();
        audioRef.current = audio;
        audio.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener(
          "sourceopen",
          async () => {
            if (isCancelled.current) return;

            const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
            sourceBufferRef.current = sourceBuffer;

            const response = await fetch("/api/speak", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text, speaker, language }),
            });

            if (!response.ok) throw new Error("Failed to fetch audio stream");

            const reader = response.body.getReader();
            readerRef.current = reader;

            const pump = async () => {
              if (isCancelled.current) return;

              const { done, value } = await reader.read();

              if (done) {
                if (
                  mediaSource.readyState === "open" &&
                  !sourceBuffer.updating
                ) {
                  mediaSource.endOfStream();
                } else if (sourceBuffer.updating) {
                  sourceBuffer.addEventListener(
                    "updateend",
                    () => {
                      if (
                        mediaSource.readyState === "open" &&
                        !isCancelled.current
                      ) {
                        mediaSource.endOfStream();
                      }
                    },
                    { once: true },
                  );
                }
                return;
              }

              if (mediaSource.readyState !== "open" || isCancelled.current)
                return;

              if (!sourceBuffer.updating) {
                try {
                  sourceBuffer.appendBuffer(value);
                } catch (error) {
                  if (error.name === "InvalidStateError") return;
                  throw error;
                }
                sourceBuffer.addEventListener("updateend", () => pump(), {
                  once: true,
                });
              } else {
                sourceBuffer.addEventListener("updateend", () => pump(), {
                  once: true,
                });
              }
            };

            audio.play();
            pump();
          },
          { once: true },
        );

        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          setIsSpeaking(false);
          alert("Error playing streamed audio");
        };
      } catch (error) {
        setIsSpeaking(false);
        alert("Error with streaming: " + error.message);
      }
    };

    const stopSpeaking = () => {
      isCancelled.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (readerRef.current) {
        readerRef.current.cancel();
      }
      if (
        mediaSourceRef.current &&
        mediaSourceRef.current.readyState === "open" &&
        !sourceBufferRef.current?.updating
      ) {
        mediaSourceRef.current.endOfStream();
      }
      setIsSpeaking(false);
    };

    useEffect(() => {
      return () => {
        isCancelled.current = true;
        if (audioRef.current) audioRef.current.pause();
        if (readerRef.current) readerRef.current.cancel();
        if (
          mediaSourceRef.current &&
          mediaSourceRef.current.readyState === "open" &&
          !sourceBufferRef.current?.updating
        ) {
          mediaSourceRef.current.endOfStream();
        }
      };
    }, []);

    return (
      <button
        type="button"
        onClick={isSpeaking ? stopSpeaking : () => speakText(text, speaker)}
        className={`transition-colors duration-200 focus:outline-none ${
          className || "text-gray-800 hover:text-blue-600"
        }`}
        aria-label={isSpeaking ? "Stop speaking" : "Speak text"}
      >
        <AudioLines
          className={`size-4 ${
            isSpeaking ? "animate-pulse" : "group-hover:scale-110"
          } transition-all duration-300`}
          strokeWidth={1.5}
        />
      </button>
    );
  };

  const Vocab = ({ title, items, context }) => {
    return (
      <section className="mx-auto max-w-3xl p-6">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">
            {title.french}
          </h1>
          <h2 className="mt-1 text-lg text-gray-500">{title.english}</h2>
        </header>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex gap-3 rounded-lg border border-gray-200 p-3"
            >
              <BookOpen className="mt-1 h-5 w-5 text-blue-600" />
              <div className="flex flex-1 flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium text-gray-800">
                    {item.french}
                  </span>
                  <SpeakingModule
                    text={item.french}
                    speaker="Marie"
                    language="fr-FR"
                  />
                </div>
                <span className="text-xs italic text-gray-600">
                  {item.english}
                </span>
                <div className="mt-1">
                  <span className="text-sm text-gray-800">
                    {item.example.french}
                  </span>
                  <span className="block text-xs italic text-gray-600">
                    {item.example.english}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="relative rounded-lg border border-dotted border-blue-600/50 p-4">
          <Star className="absolute left-2 top-2 h-5 w-5 fill-amber-300 text-amber-300" />
          <p className="pl-7 text-base text-gray-800">{context.french}</p>
          <p className="mt-1 pl-7 text-sm italic text-gray-600">
            {context.english}
          </p>
        </div>
      </section>
    );
  };

  const Pronunciation = ({ title, items }) => {
    return (
      <section className="mx-auto max-w-3xl rounded-lg bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 p-6">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">
            {title.french} 🗣️
          </h1>
          <h2 className="mt-2 text-lg text-gray-500">{title.english}</h2>
        </header>
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="">
              <PronunciationTestFR targetText={item.targetText} />
            </div>
          ))}
        </div>
      </section>
    );
  };

  const Topic = ({ french, english }) => {
    return (
      <div className="mx-auto mb-8 max-w-4xl rounded-lg p-6">
        <span className="mb-3 flex items-center pb-2 text-lg">{french}</span>
        <p className="mt-2 rounded-md bg-blue-50 p-3 pl-4 text-base italic text-muted-foreground">
          {english}
        </p>
      </div>
    );
  };

  // MAIN COMPONENT RETURN
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create New Lesson
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Fill in the details below to create a new lesson plan
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
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
                    <Label>Lesson Focus</Label>
                    <Input
                      name="focusArea"
                      value={lessonOptions.focusArea}
                      onChange={(e) =>
                        handleInputChange("focusArea", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Grade Level</Label>
                    <Select
                      value={lessonOptions.gradeLevel}
                      onValueChange={(value) =>
                        handleInputChange("gradeLevel", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Novice">Novice</SelectItem>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">
                          Intermediate
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Learning Objectives Section */}
              <div className="border-b p-6">
                <h2 className="-mt-4 mb-6 text-lg font-medium text-gray-900">
                  Learning Objectives
                </h2>
                <div className="grid grid-cols-2 gap-6">
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

                <div className="col-span-2 mt-4">
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

              {/* Exercise Section */}
              <div className="border-b p-6">
                <h2 className="-mt-4 mb-6 text-lg font-medium text-gray-900">
                  Exercise Options
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label>Enable Exercises</Label>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={lessonOptions.enableExercises}
                        onCheckedChange={(checked) =>
                          handleInputChange("enableExercises", checked)
                        }
                      />
                    </div>
                  </div>
                </div>

                {lessonOptions.enableExercises && (
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
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
                              value={lessonOptions.exercises[exercise.id] || 0}
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
                )}

                {/* Total Exercises */}
                {lessonOptions.enableExercises && (
                  <div className="mt-4 text-sm text-gray-500">
                    Total exercises:{" "}
                    {Object.values(lessonOptions.exercises).reduce(
                      (sum, count) => sum + count,
                      0,
                    )}{" "}
                    / 10
                  </div>
                )}
              </div>

              {/* Content Generation Section */}
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
                      {preview.type === "lecture" &&
                        (() => {
                          const blocks = (
                            typeof preview.content === "string"
                              ? preview.content
                              : ""
                          )
                            .split("\n\n")
                            .filter((block) => block.trim());
                          let conjugationTables = [];

                          return blocks.map((block, index) => {
                            const componentMatch = block.match(
                              /:::component::(\w+):::([\s\S]*)/,
                            );
                            if (componentMatch) {
                              const componentName = componentMatch[1];
                              const componentContent = componentMatch[2];

                              if (componentName === "conjugationTable") {
                                try {
                                  const props = JSON.parse(componentContent);
                                  conjugationTables.push(props);

                                  // Only render the wrapper when we hit the last block or next block isn't a conjugation table
                                  const nextBlock = blocks[index + 1];
                                  const isNextConjugationTable =
                                    nextBlock &&
                                    nextBlock.match(
                                      /:::component::conjugationTable:::/,
                                    );
                                  if (
                                    !isNextConjugationTable &&
                                    conjugationTables.length > 0
                                  ) {
                                    const tablesToRender = [
                                      ...conjugationTables,
                                    ];
                                    conjugationTables = []; // Reset for the next group
                                    return (
                                      <ConjugationTableWrapper
                                        key={index}
                                        tables={tablesToRender}
                                      />
                                    );
                                  }
                                  return null; // Skip rendering individual tables until we group them
                                } catch (e) {
                                  console.error(
                                    "Failed to parse conjugation table:",
                                    e,
                                  );
                                  return null;
                                }
                              }

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
                                note: ({ children }) => (
                                  <div className="my-4 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
                                    📝 Note: {children}
                                  </div>
                                ),
                                audio: ({ text, language }) => (
                                  <AudioModule
                                    text={text}
                                    language={language}
                                  />
                                ),
                                flashcard: ({ front, back }) => (
                                  <Flashcard front={front} back={back} />
                                ),
                                pronunciation: ({ title, items }) => (
                                  <Pronunciation title={title} items={items} />
                                ),
                                conjugationTable: ({
                                  verbs,
                                  tense,
                                  conjugation,
                                  englishTranslations,
                                }) => (
                                  <ConjugationTable
                                    verbs={verbs}
                                    tense={tense}
                                    conjugation={conjugation}
                                    englishTranslations={englishTranslations}
                                  />
                                ),
                                goals: ({
                                  title,
                                  hook,
                                  objectives,
                                  explanation,
                                }) => (
                                  <Goals
                                    title={title}
                                    hook={hook}
                                    objectives={objectives}
                                    explanation={explanation}
                                  />
                                ),
                                dialogue: ({ title, lines, analysis }) => (
                                  <Dialogue
                                    title={title}
                                    lines={lines}
                                    analysis={analysis}
                                  />
                                ),
                                vocab: ({ title, items, context }) => (
                                  <Vocab
                                    title={title}
                                    items={items}
                                    context={context}
                                  />
                                ),
                                topic: ({ french, english }) => (
                                  <Topic french={french} english={english} />
                                ),
                                video: ({ text, language }) => (
                                  <div>
                                    {text}
                                    {language}
                                  </div>
                                ),
                              };

                              const Component = componentMap[componentName];
                              if (Component) {
                                try {
                                  const props = JSON.parse(componentContent);
                                  return <Component key={index} {...props} />;
                                } catch {
                                  return (
                                    <Component key={index}>
                                      {componentContent}
                                    </Component>
                                  );
                                }
                              }
                            }

                            return (
                              <Markdown
                                key={index}
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h1: ({ node, ...props }) => (
                                    <h1
                                      className="mb-4 text-3xl font-bold text-blue-500"
                                      {...props}
                                    />
                                  ),
                                  h2: ({ node, ...props }) => (
                                    <h2
                                      className="mb-3 mt-6 text-center text-2xl font-semibold text-green-600"
                                      {...props}
                                    />
                                  ),
                                  p: ({ node, ...props }) => (
                                    <p
                                      className="mb-3 leading-relaxed text-gray-800"
                                      {...props}
                                    />
                                  ),
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
                                {block}
                              </Markdown>
                            );
                          });
                        })()}
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
