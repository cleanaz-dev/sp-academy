import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";

export default function RecentLessons({ progress }) {
  // console.log("progress: ", progress);
  // Transform the progress data into the desired format for rendering
  const formattedProgress = progress.map((item) => ({
    title: item.lesson.title,
    status: item.status === "IN_PROGRESS" ? "Continue" : "Review",
    color: item.lesson.type === "MATH" ? "blue" : "green",
    course: item.lesson.course,
    lessonId: item.lessonId,
  }));

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader className="border-b bg-gray-50">
        <CardTitle className="text-lg font-semibold">Recent Lessons</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="space-y-4">
          {formattedProgress.map((lesson, index) => (
            <li
              key={index}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
            >
              <div className="flex-col gap-1">
                <p className="text-sm text-muted-foreground">
                  {lesson.course.title}
                </p>
                <p className="font-medium">{lesson.title}</p>
              </div>

              <Link
                href={`/courses/${lesson.course.id}/lesson/${lesson.lessonId}`}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-${lesson.color}-600 border-${lesson.color}-600 hover:bg-${lesson.color}-50 transition-all duration-300 hover:-translate-y-0.5`}
                >
                  {lesson.status}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
