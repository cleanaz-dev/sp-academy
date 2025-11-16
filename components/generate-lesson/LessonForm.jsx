import { useState, useEffect } from "react";
import { Button } from "@/components/old-ui/button"; // Adjust path as needed
import { Input } from "@/components/old-ui/input";
import { Label } from "@/components/old-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/old-ui/select";
import { Switch } from "@/components/old-ui/switch";
import { Card } from "@/components/old-ui/card";
import { X } from "lucide-react"; // Assuming you're using lucide icons
import { language } from "gray-matter";

export default function LessonForm({
  courses = [],
  onGenerate,
  isLoading,
  setIsLoading,
}) {
  // Pass courses as prop (adjust as needed)
  const [lessonOptions, setLessonOptions] = useState({
    title: "",
    subject: "",
    language: "",
    gradeLevel: "",
    course: "",
    objectives: [],
    includeLecture: true,
    includeImages: false,
    includeExercise: true,
    includeQuiz: false,
    includeMultipleChoice: false,
    multipleChoiceQuestionCount: 1,
    generateImage: true,
    exercises: {
      image_word_input: 1,
      drag_and_drop: 1,
      fill_in_blank: 1,
      matching_pairs: 1,
      audio_based: 1,
      verb_scene_illustrator: 1,
    }, // Match exerciseTypes IDs
  });
  const [newObjective, setNewObjective] = useState("");
  const [isAddingNewCourse, setIsAddingNewCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [newCourseLevel, setNewCourseLevel] = useState("");
  const [isAddingCourse, setIsAddingCourse] = useState(false);

  // Assuming exerciseTypes is defined elsewhere or hardcoded here
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
    {
      id: "verb_scene_illustrator",
      label: "Sentence Illustrator",
      description:
        "Build sentences using given words and phrases. For example: creating a sentence with 'the', 'cat', and 'jumped' in it.",
    },
  ];

  const handleInputChange = (field, value) => {
    setLessonOptions((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewObjective = () => {
    if (newObjective.trim()) {
      handleInputChange("objectives", [
        ...lessonOptions.objectives,
        newObjective.trim(),
      ]);
      setNewObjective("");
    }
  };

  const handleAddCourse = async () => {
    if (!newCourseName.trim()) return;
    setIsAddingCourse(true);
    // Simulate adding a course (replace with your API call)
    const newCourse = {
      id: `temp-${Date.now()}`,
      title: newCourseName,
      description: newCourseDescription,
      level: newCourseLevel,
    };
    // Normally, you'd update courses via API and refetch; here, just log
    console.log("New Course:", newCourse);
    setIsAddingNewCourse(false);
    setNewCourseName("");
    setNewCourseDescription("");
    setNewCourseLevel("");
    handleInputChange("course", newCourse.id); // Auto-select new course
    setIsAddingCourse(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const apiData = {
      title: lessonOptions.title,
      subject: lessonOptions.subject,
      language: lessonOptions.language,
      level: lessonOptions.gradeLevel,
      type: "Lesson",
      courseId: lessonOptions.course,
      objectives: lessonOptions.objectives,
      includeLecture: lessonOptions.includeLecture,
      includeExercise: lessonOptions.includeExercise,
      generateImage: lessonOptions.generateImage,
      exercises: lessonOptions.exercises,
    };

    if (onGenerate) {
      onGenerate(apiData); // Pass apiData to parent component via onGenerate
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setLessonOptions({
      title: "",
      subject: "",
      languaga: "",
      gradeLevel: "",
      course: "",
      objectives: [],
      includeLecture: true,
      includeExercise: false,
      generateImage: false,
      exercises: {
        fillInBlank: 0,
        matching: 0,
        multipleChoice: 0,
        shortAnswer: 0,
        trueFalse: 0,
      },
    });
    setNewObjective("");
    setIsAddingNewCourse(false);
    setNewCourseName("");
    setNewCourseDescription("");
    setNewCourseLevel("");
  };

  return (
    <main className="flex-1 overflow-auto">
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
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Card className="bg-white shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Course Information */}
            <div className="border-b p-6">
              <h2 className="mb-6 text-lg font-medium text-gray-900">
                Course Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
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
                    onClick={() => setIsAddingNewCourse((prev) => !prev)}
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
                      <div className="flex items-end">
                        <Button
                          type="button"
                          onClick={handleAddCourse}
                          disabled={isAddingCourse}
                        >
                          {isAddingCourse ? "Adding..." : "Add Course"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lesson Information */}
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
                      <SelectItem value="Social Studies">
                        Social Studies
                      </SelectItem>
                      <SelectItem value="Language">Language</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lesson Language</Label>
                  <Select
                    value={lessonOptions.language}
                    onValueChange={(value) =>
                      handleInputChange("language", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Level</Label>
                  <Select
                    value={lessonOptions.gradeLevel}
                    onValueChange={(value) =>
                      handleInputChange("gradeLevel", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Novice">Novice</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="border-b p-6">
              <h2 className="-mt-4 mb-6 text-lg font-medium text-gray-900">
                Learning Objectives
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {lessonOptions.objectives.map((objective, index) => (
                  <div key={index}>
                    <Label className="my-2 block">Objective {index + 1}</Label>
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
                          const newObjectives = lessonOptions.objectives.filter(
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
              <div className="mt-4">
                <Label className="mb-1 block">Add Objective</Label>
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

            {/* Exercise Options */}
            <div className="border-b p-6">
              <h2 className="-mt-4 mb-6 text-lg font-medium text-gray-900">
                Exercise Options
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Include Exercises</Label>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={lessonOptions.includeExercise}
                      onCheckedChange={(checked) =>
                        handleInputChange("includeExercise", checked)
                      }
                    />
                  </div>
                </div>
              </div>
              {lessonOptions.includeExercise && (
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
                              ); // Cap at 10
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
              {lessonOptions.includeExercise && (
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

            {/* Content Creation */}
            <div className="border-b p-6">
              <h2 className="-mt-4 mb-6 text-lg font-medium text-gray-900">
                Content Creation
              </h2>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label>Include Lecture Content</Label>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={lessonOptions.includeLecture}
                      onCheckedChange={(checked) =>
                        handleInputChange("includeLecture", checked)
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Generate Images</Label>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={lessonOptions.includeImages}
                      onCheckedChange={(checked) =>
                        handleInputChange("includeImages", checked)
                      }
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
                  <Label>Include Quiz</Label>
                  <div>
                    <Switch
                      checked={lessonOptions.includeQuiz}
                      onCheckedChange={(checked) =>
                        handleInputChange("includeQuiz", checked)
                      }
                    />
                  </div>
                </div>
              </div>
              {lessonOptions.includeQuiz && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label>Multiple-Choice Questions</Label>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={lessonOptions.includeMultipleChoice}
                        onCheckedChange={(checked) =>
                          handleInputChange("includeMultipleChoice", checked)
                        }
                      />
                    </div>
                  </div>
                  {lessonOptions.includeMultipleChoice && (
                    <div>
                      <Label>Nnumber of Questions</Label>
                      <Input
                        type="number"
                        value={lessonOptions.multipleChoiceQuestionCount}
                        onChange={(e) =>
                          handleInputChange(
                            "multipleChoiceQuestionCount",
                            e.target.value,
                          )
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

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 p-6">
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
                className={`rounded px-4 py-2 ${isLoading ? "cursor-not-allowed bg-blue-300" : "bg-blue-500 hover:bg-blue-600"} text-white`}
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
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
