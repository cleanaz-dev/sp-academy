"use server";

import { SystemTaskType } from "@prisma/client";
import {
  InvokeEduBuilderPayload,
  LessonDbContext,
} from "@/app/actions/invoke-edu-builder";
import { prisma } from "@/lib/prisma";

const BASE = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://spoonacademy.com"}/api/webhooks/system-tasks`;
const hookUrl = (taskId: string) => `${BASE}/${taskId}`;

export async function setupFirstLesson(
  payload: InvokeEduBuilderPayload,
): Promise<LessonDbContext> {
  return prisma.$transaction(async (tx) => {
    const course = await tx.foundationCourse.create({
      data: {
        user: { connect: { id: payload.userId } },
        targetLanguage: payload.targetLanguage,
        nativeLanguage: payload.nativeLanguage,
        cacheKey: `${payload.userId}-${payload.nativeLanguage}-${payload.targetLanguage}-${payload.levelBand}-${payload.goal}`,
      },
    });

    const lesson = await tx.foundationLesson.create({
      data: {
        user: { connect: { id: payload.userId } },
        course: { connect: { id: course.id } },
        orderIndex: payload.spoon,
      },
    });

    const taskPayload = JSON.stringify({
      ...payload,
      foundationCourseId: course.id,
      foundationLessonId: lesson.id,
    });
    const metadata = {
      type: payload.type,
      userId: payload.userId,
      courseId: course.id,
      foundationCourseId: course.id,
      foundationLessonId: lesson.id,
      day: payload.spoon,
      spoon: payload.spoon,
    };

    const lessonTask = await tx.systemTask.create({
      data: {
        type: SystemTaskType.SPOON_GENERATION,
        payload: taskPayload,
        metadata,
      },
    });

    const vocabTask = await tx.systemTask.create({
      data: {
        type: SystemTaskType.VOCAB_BRIDGE_GENERATION,
        payload: taskPayload,
        metadata,
      },
    });

    return {
      courseId: course.id,
      lessonId: lesson.id,
      taskId: lessonTask.id,
      vocabTaskId: vocabTask.id,
      webhookUrl: hookUrl(lessonTask.id),
      vocabWebhookUrl: hookUrl(vocabTask.id),
    };
  });
}