"use server";
import { prisma } from "@/lib/prisma";
import { InvokeEduBuilderPayload } from "@/app/actions/invoke-edu-builder";

export async function setupNextLesson(payload: InvokeEduBuilderPayload) {
  if (!payload.foundationCourseId) {
    throw new Error("Missing foundationCourseId for returning user.");
  }

  // 1. Create the next lesson bucket
  const lesson = await prisma.foundationLesson.create({
    data: {
      user: { connect: { id: payload.userId } },
      course: { connect: { id: payload.foundationCourseId } },
      orderIndex: payload.spoon, 
    },
  });

  // 2. Log the system task
  const task = await prisma.systemTask.create({
    data: {
      user: { connect: { id: payload.userId } },
      type: "SPOON_GENERATION",
      status: "PENDING",
      payload: JSON.stringify({ 
        ...payload, 
        foundationLessonId: lesson.id 
      }),
      metadata: {
        type: payload.type,
        foundationCourseId: payload.foundationCourseId,
        foundationLessonId: lesson.id,
        spoon: payload.spoon,
      },
    },
  });

  return { courseId: payload.foundationCourseId, lessonId: lesson.id, taskId: task.id };
}