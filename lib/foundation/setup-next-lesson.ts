"use server";

import { SystemTaskType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  InvokeEduBuilderPayload,
  LessonDbContext,
} from "@/app/actions/invoke-edu-builder";

const BASE = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://spoonacademy.com"}/api/webhooks/system-tasks`;
const hookUrl = (taskId: string) => `${BASE}/${taskId}`;

export async function setupNextLesson(
  payload: InvokeEduBuilderPayload,
): Promise<LessonDbContext> {
  const { foundationCourseId, userId, spoon } = payload;
  if (!foundationCourseId) {
    throw new Error("Missing foundationCourseId for returning user.");
  }

  const existing = await prisma.foundationLesson.findUnique({
    where: {
      foundationCourseId_orderIndex: { foundationCourseId, orderIndex: spoon },
    },
    select: { id: true },
  });
  if (existing) {
    throw new Error(`Lesson ${spoon} already exists for this course.`);
  }

  return prisma.$transaction(async (tx) => {
    const lesson = await tx.foundationLesson.create({
      data: {
        user: { connect: { id: userId } },
        course: { connect: { id: foundationCourseId } },
        orderIndex: spoon,
      },
    });

    const taskPayload = JSON.stringify({
      ...payload,
      foundationLessonId: lesson.id,
    });
    const metadata = {
      type: payload.type,
      userId,
      courseId: foundationCourseId,
      foundationCourseId,
      foundationLessonId: lesson.id,
      day: spoon,
      spoon,
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
      courseId: foundationCourseId,
      lessonId: lesson.id,
      taskId: lessonTask.id,
      vocabTaskId: vocabTask.id,
      webhookUrl: hookUrl(lessonTask.id),
      vocabWebhookUrl: hookUrl(vocabTask.id),
    };
  });
}