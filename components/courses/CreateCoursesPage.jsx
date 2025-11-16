// components/courses/CreateCoursesPage.jsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import BasicInformationForm from "./BasicInformationForm";
import LessonSequenceForm from "./LessonSequenceForm";
import CourseMaterialsForm from "./CourseMaterialsForm";
import ReviewForm from "./ReviewForm";

const initialCourseState = {
  basicInfo: {
    title: "",
    description: "",
    subject: "",
    gradeLevel: "",
    duration: "",
    learningOutcomes: [],
  },
  lessons: [],
  materials: {
    overview: "",
    resources: [],
  },
  published: false,
};

export default function CreateCoursesPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState(initialCourseState);
  const [isLoading, setIsLoading] = useState(false);
  const [validationIssues, setValidationIssues] = useState([]);

  // Add useEffect to check validation whenever courseData changes
  useEffect(() => {
    const issues = validateCourse(courseData);
    setValidationIssues(issues);
  }, [courseData]);

  const steps = [
    { id: 1, name: "Basic Information" },
    { id: 2, name: "Lesson Sequence" },
    { id: 3, name: "Course Materials" },
    { id: 4, name: "Review & Publish" },
  ];

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSaveDraft = async () => {
    try {
      const response = await fetch("/api/courses/drafts/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...courseData,
          lastSaved: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      toast({
        title: "Draft Saved",
        description: "Your course progress has been saved.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      // First, validate the entire course data
      const validationIssues = validateCourse(courseData);
      if (validationIssues.length > 0) {
        throw new Error("Please fix all issues before publishing");
      }

      // Create the course
      const courseResponse = await fetch("/api/courses/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (!courseResponse.ok) {
        throw new Error("Failed to create course");
      }

      const course = await courseResponse.json();

      // Create lessons sequentially
      for (const lesson of courseData.lessons) {
        const lessonResponse = await fetch(
          `/api/courses/${course.id}/lessons/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(lesson),
          },
        );

        if (!lessonResponse.ok) {
          throw new Error(`Failed to create lesson: ${lesson.title}`);
        }
      }

      // Upload or link materials
      if (courseData.materials.resources.length > 0) {
        const materialsResponse = await fetch(
          `/api/courses/${course.id}/materials/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(courseData.materials),
          },
        );

        if (!materialsResponse.ok) {
          throw new Error("Failed to add course materials");
        }
      }

      // Show success message and redirect
      toast({
        title: "Course Published Successfully",
        description: "Your course has been created and is now live.",
        duration: 5000,
      });

      router.push(`/courses/${course.id}`);
    } catch (error) {
      toast({
        title: "Publication Failed",
        description:
          error.message || "There was an error publishing your course",
        variant: "destructive",
        duration: 5000,
      });
      console.error("Error publishing course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateCourse = (courseData) => {
    const issues = [];

    // Basic Info Validation
    if (!courseData.basicInfo.title?.trim()) {
      issues.push("Course title is required");
    }
    if (!courseData.basicInfo.description?.trim()) {
      issues.push("Course description is required");
    }
    if (!courseData.basicInfo.subject) {
      issues.push("Subject is required");
    }
    if (!courseData.basicInfo.gradeLevel) {
      issues.push("Grade level is required");
    }

    // Lessons Validation
    if (courseData.lessons.length === 0) {
      issues.push("At least one lesson is required");
    }

    courseData.lessons.forEach((lesson, index) => {
      if (!lesson.title?.trim()) {
        issues.push(`Lesson ${index + 1} requires a title`);
      }
      if (!lesson.description?.trim()) {
        issues.push(`Lesson ${index + 1} requires a description`);
      }
      if (!lesson.duration) {
        issues.push(`Lesson ${index + 1} requires a duration`);
      }
    });

    // Materials Validation
    if (!courseData.materials.overview?.trim()) {
      issues.push("Course overview is required");
    }

    return issues;
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-between">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center ${
              currentStep >= step.id ? "text-blue-600" : "text-gray-400"
            }} `}
          >
            {/* Step Circle */}
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                currentStep >= step.id
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              {step.id}
            </div>

            {/* Step Name */}
            <span className="ml-2">{step.name}</span>

            {/* Connector Bar (Except Last Step) */}
            {index !== steps.length - 1 && (
              <div className="mx-4 h-0.5 flex-1 bg-gray-200" />
            )}
          </div>
        ))}
      </div>
      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 1 || isLoading}
          variant="outline"
        >
          Previous
        </Button>
        <div className="space-x-2">
          <Button
            onClick={handleSaveDraft}
            variant="outline"
            disabled={isLoading}
          >
            Save Draft
          </Button>
          {currentStep === steps.length ? (
            <div className="inline-flex flex-col items-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        onClick={handlePublish}
                        disabled={isLoading || validationIssues.length > 0}
                        className="min-w-[120px]"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <span className="animate-spin">↻</span>
                            Publishing...
                          </div>
                        ) : (
                          "Publish Course"
                        )}
                      </Button>
                      {validationIssues.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          {validationIssues.length} issue
                          {validationIssues.length !== 1 ? "s" : ""} to fix
                        </p>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {validationIssues.length > 0 ? (
                      <div className="max-w-xs">
                        <p className="mb-1 font-semibold">Required fixes:</p>
                        <ul className="list-inside list-disc text-sm">
                          {validationIssues.slice(0, 3).map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                          {validationIssues.length > 3 && (
                            <li>...and {validationIssues.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    ) : (
                      "Ready to publish"
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <Button onClick={handleNext} disabled={isLoading}>
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="p-6">
        {/* Step content will go here */}
        {currentStep === 1 && (
          <BasicInformationForm
            courseData={courseData}
            onUpdateCourseData={setCourseData}
          />
        )}
        {currentStep === 2 && (
          <LessonSequenceForm
            courseData={courseData}
            onUpdateCourseData={setCourseData}
          />
        )}
        {currentStep === 3 && (
          <CourseMaterialsForm
            courseData={courseData}
            onUpdateCourseData={setCourseData}
          />
        )}
        {currentStep === 4 && (
          <ReviewForm courseData={courseData} onPublish={handlePublish} />
        )}
      </Card>
    </div>
  );
}
