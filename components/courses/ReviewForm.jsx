// components/courses/ReviewForm.jsx
import { Card } from "@/components/old-ui/card";
import { Button } from "@/components/old-ui/button";
import { Badge } from "@/components/old-ui/badge";
import {
  FileText,
  Link,
  Video,
  Image,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function ReviewForm({ courseData, onPublish }) {
  const validateCourse = () => {
    const issues = [];

    // Check basic info
    if (!courseData.basicInfo.title) issues.push("Course title is required");
    if (!courseData.basicInfo.description)
      issues.push("Course description is required");
    if (!courseData.basicInfo.subject) issues.push("Subject is required");
    if (!courseData.basicInfo.gradeLevel)
      issues.push("Grade level is required");

    // Check lessons
    if (courseData.lessons.length === 0)
      issues.push("At least one lesson is required");
    courseData.lessons.forEach((lesson, index) => {
      if (!lesson.title) issues.push(`Lesson ${index + 1} title is required`);
      if (!lesson.description)
        issues.push(`Lesson ${index + 1} description is required`);
    });

    // Check materials
    if (!courseData.materials.overview)
      issues.push("Course overview is required");

    return issues;
  };

  const issues = validateCourse();

  const getResourceIcon = (type) => {
    switch (type) {
      case "document":
        return <FileText className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "image":
        return <Image className="h-4 w-4" />;
      default:
        return <Link className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Course Review</h3>
        {issues.length === 0 ? (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Ready to Publish
          </Badge>
        ) : (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {issues.length} Issues Found
          </Badge>
        )}
      </div>

      {/* Basic Information */}
      <Card className="p-6">
        <h4 className="mb-4 font-medium">Basic Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Title</label>
            <p className="font-medium">{courseData.basicInfo.title || "—"}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Subject</label>
            <p className="font-medium">{courseData.basicInfo.subject || "—"}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Grade Level</label>
            <p className="font-medium">
              {courseData.basicInfo.gradeLevel || "—"}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Duration</label>
            <p className="font-medium">
              {courseData.basicInfo.duration
                ? `${courseData.basicInfo.duration} weeks`
                : "—"}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-sm text-gray-500">Description</label>
          <p className="mt-1">{courseData.basicInfo.description || "—"}</p>
        </div>
        <div className="mt-4">
          <label className="text-sm text-gray-500">Learning Outcomes</label>
          {courseData.basicInfo.learningOutcomes?.length > 0 ? (
            <ul className="mt-1 list-inside list-disc">
              {courseData.basicInfo.learningOutcomes.map((outcome, index) => (
                <li key={index}>{outcome}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1">No learning outcomes specified</p>
          )}
        </div>
      </Card>

      {/* Lessons */}
      <Card className="p-6">
        <h4 className="mb-4 font-medium">Lesson Sequence</h4>
        {courseData.lessons.length > 0 ? (
          <div className="space-y-4">
            {courseData.lessons.map((lesson, index) => (
              <div key={index} className="rounded-lg border bg-gray-50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium">
                      Lesson {index + 1}: {lesson.title}
                    </h5>
                    <p className="mt-1 text-sm text-gray-600">
                      {lesson.description}
                    </p>
                  </div>
                  <Badge>{lesson.type}</Badge>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">
                    Duration: {lesson.duration} minutes
                  </span>
                </div>
                {lesson.objectives?.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Objectives:</span>
                    <ul className="mt-1 list-inside list-disc">
                      {lesson.objectives.map((objective, i) => (
                        <li key={i} className="text-sm">
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No lessons added</p>
        )}
      </Card>

      {/* Materials */}
      <Card className="p-6">
        <h4 className="mb-4 font-medium">Course Materials</h4>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Overview</label>
            <p className="mt-1">{courseData.materials.overview || "—"}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Resources</label>
            {courseData.materials.resources?.length > 0 ? (
              <div className="mt-2 space-y-2">
                {courseData.materials.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center gap-2 rounded bg-gray-50 p-2"
                  >
                    {getResourceIcon(resource.type)}
                    <span className="font-medium">{resource.title}</span>
                    <span className="truncate text-sm text-gray-500">
                      {resource.url}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-gray-500">No resources added</p>
            )}
          </div>
        </div>
      </Card>

      {/* Validation Issues */}
      {issues.length > 0 && (
        <Card className="border-red-200 bg-red-50 p-6">
          <h4 className="mb-2 font-medium text-red-700">
            Please address the following issues:
          </h4>
          <ul className="list-inside list-disc space-y-1">
            {issues.map((issue, index) => (
              <li key={index} className="text-red-600">
                {issue}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Publish Button */}
      <div className="flex justify-end">
        <Button
          onClick={onPublish}
          disabled={issues.length > 0}
          className="w-full sm:w-auto"
        >
          {issues.length > 0 ? "Fix Issues to Publish" : "Publish Course"}
        </Button>
      </div>
    </div>
  );
}
