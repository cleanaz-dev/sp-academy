// components/courses/LessonSequenceForm.jsx
"use client";

import { useState } from "react";
import { Label } from "@/components/old-ui/label";
import { Input } from "@/components/old-ui/input";
import { Textarea } from "@/components/old-ui/textarea";
import { Button } from "@/components/old-ui/button";
import { Card } from "@/components/old-ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/old-ui/select";
import { Plus, Minus, GripVertical } from "lucide-react";

export default function LessonSequenceForm({ courseData, onUpdateCourseData }) {
  const MAX_LESSONS = 4;

  const addLesson = () => {
    if (courseData.lessons.length < MAX_LESSONS) {
      const newLesson = {
        title: "",
        description: "",
        duration: "",
        type: "Lecture", // Default type
        objectives: [],
        order: courseData.lessons.length + 1,
      };

      onUpdateCourseData({
        ...courseData,
        lessons: [...courseData.lessons, newLesson],
      });
    }
  };

  const removeLesson = (index) => {
    const newLessons = courseData.lessons.filter((_, i) => i !== index);
    // Reorder remaining lessons
    const reorderedLessons = newLessons.map((lesson, i) => ({
      ...lesson,
      order: i + 1,
    }));
    onUpdateCourseData({
      ...courseData,
      lessons: reorderedLessons,
    });
  };

  const updateLesson = (index, field, value) => {
    const updatedLessons = courseData.lessons.map((lesson, i) => {
      if (i === index) {
        return { ...lesson, [field]: value };
      }
      return lesson;
    });
    onUpdateCourseData({
      ...courseData,
      lessons: updatedLessons,
    });
  };

  const addObjective = (lessonIndex) => {
    const updatedLessons = courseData.lessons.map((lesson, i) => {
      if (i === lessonIndex) {
        return {
          ...lesson,
          objectives: [...lesson.objectives, ""],
        };
      }
      return lesson;
    });
    onUpdateCourseData({
      ...courseData,
      lessons: updatedLessons,
    });
  };

  const updateObjective = (lessonIndex, objectiveIndex, value) => {
    const updatedLessons = courseData.lessons.map((lesson, i) => {
      if (i === lessonIndex) {
        const newObjectives = [...lesson.objectives];
        newObjectives[objectiveIndex] = value;
        return {
          ...lesson,
          objectives: newObjectives,
        };
      }
      return lesson;
    });
    onUpdateCourseData({
      ...courseData,
      lessons: updatedLessons,
    });
  };

  const removeObjective = (lessonIndex, objectiveIndex) => {
    const updatedLessons = courseData.lessons.map((lesson, i) => {
      if (i === lessonIndex) {
        return {
          ...lesson,
          objectives: lesson.objectives.filter((_, j) => j !== objectiveIndex),
        };
      }
      return lesson;
    });
    onUpdateCourseData({
      ...courseData,
      lessons: updatedLessons,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Lesson Sequence</h3>
        <Button
          onClick={addLesson}
          disabled={courseData.lessons.length >= MAX_LESSONS}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Lesson
        </Button>
      </div>

      {courseData.lessons.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          No lessons added yet. Click "Add Lesson" to begin.
        </div>
      )}

      {courseData.lessons.map((lesson, lessonIndex) => (
        <Card key={lessonIndex} className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-5 w-5 text-gray-400" />
              <h4 className="font-medium">Lesson {lessonIndex + 1}</h4>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeLesson(lessonIndex)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Lesson Title</Label>
              <Input
                value={lesson.title}
                onChange={(e) =>
                  updateLesson(lessonIndex, "title", e.target.value)
                }
                placeholder="Enter lesson title"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={lesson.description}
                onChange={(e) =>
                  updateLesson(lessonIndex, "description", e.target.value)
                }
                placeholder="Enter lesson description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Lesson Type</Label>
                <Select
                  value={lesson.type}
                  onValueChange={(value) =>
                    updateLesson(lessonIndex, "type", value)
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
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={lesson.duration}
                  onChange={(e) =>
                    updateLesson(lessonIndex, "duration", e.target.value)
                  }
                  placeholder="Enter duration"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Learning Objectives</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addObjective(lessonIndex)}
                >
                  Add Objective
                </Button>
              </div>
              {lesson.objectives.map((objective, objectiveIndex) => (
                <div
                  key={objectiveIndex}
                  className="mb-2 flex items-center gap-2"
                >
                  <Input
                    value={objective}
                    onChange={(e) =>
                      updateObjective(
                        lessonIndex,
                        objectiveIndex,
                        e.target.value,
                      )
                    }
                    placeholder={`Objective ${objectiveIndex + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeObjective(lessonIndex, objectiveIndex)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
