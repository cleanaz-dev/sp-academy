import React from "react";
import { auth } from "@clerk/nextjs/server";
import {
  getExercisesByEnrolledUser,
  getEnrolledCourseExercises,
} from "@/lib/actions";

export default async function page({ params }) {
  const { userId } = auth();
  const lessonId = await params.lessonId;
  const { exercises } = await getEnrolledCourseExercises(userId, lessonId);
  console.log("exercises", exercises);
  return (
    <div>
      <h1>Exercises</h1>
    </div>
  );
}
