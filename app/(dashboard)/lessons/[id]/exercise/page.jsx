import React from "react";
import { auth } from "@clerk/nextjs/server";
import { getExercisesByEnrolledUser } from "@/lib/actions";
export default async function page({ params }) {
  const { userId } = auth();
  const lessonId = await params.lessonId;
  const exercises = await getExercisesByEnrolledUser(userId, lessonId);

  return <div>Exercise</div>;
}
