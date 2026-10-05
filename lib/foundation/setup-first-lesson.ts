"use server";

import { InvokeEduBuilderPayload } from "@/app/actions/invoke-edu-builder";
import { prisma } from "@/lib/prisma";

export async function setupFirstLesson(payload: InvokeEduBuilderPayload) {
  // 1. Create the base course
  const course = await prisma.foundationCourse.create({
    data: {
      user: { connect: { id: payload.userId } },
      targetLanguage: payload.targetLanguage,
      nativeLanguage: payload.nativeLanguage,
      cacheKey: `${payload.userId}-${payload.nativeLanguage}-${payload.targetLanguage}-${payload.levelBand}-${payload.goal}`,
    },
  });

  // 2. Create the first lesson (spoon 1)
  const lesson = await prisma.foundationLesson.create({
    data: {
      user: { connect: { id: payload.userId } },
      course: { connect: { id: course.id } },
      orderIndex: payload.spoon,
    },
  });

  // 3. Log the system task
  const task = await prisma.systemTask.create({
    data: {
      type: "SPOON_GENERATION",
      status: "PENDING",
      payload: JSON.stringify({
        ...payload,
        foundationCourseId: course.id,
        foundationLessonId: lesson.id,
      }),
      metadata: {
        type: payload.type,
        foundationCourseId: course.id,
        foundationLessonId: lesson.id,
        userId: payload.userId,
        spoon: payload.spoon,
      },
    },
  });

  return { courseId: course.id, lessonId: lesson.id, taskId: task.id };
}