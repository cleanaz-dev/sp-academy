import React from "react";
import { getLessonExercisesByEnrolledUser } from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";
import ExerciseHandler from "@/components/lessons/exercises/ExerciseHandler";

export default async function page({ params }) {
  const lessonId = await params.lessonId;
  const courseId = await params.id;
  const { userId } = auth();
  const exercises = await getLessonExercisesByEnrolledUser(
    userId,
    lessonId,
    courseId,
  );
  // console.log("Courses Data from exercise path:", exercises)

  return (
    <div>
      <ExerciseHandler exercises={exercises} />
    </div>
  );
}
