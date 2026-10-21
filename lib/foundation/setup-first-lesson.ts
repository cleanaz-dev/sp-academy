// lib/foundation/setup-first-lesson.ts
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
    // 1. Lookup chosen Sprite (default to "vox") and upsert SpriteProfile
    const chosenSlug = payload.spriteSlug || "vox";
    const sprite = await tx.sprite.findUnique({
      where: { slug: chosenSlug },
    });

    if (!sprite) {
      throw new Error(`Sprite "${chosenSlug}" not found. Run seed-sprites first.`);
    }

    const spriteProfile = await tx.spriteProfile.upsert({
      where: { userId: payload.userId },
      update: {
        spriteId: sprite.id,
        nativeLanguage: payload.nativeLanguage,
        targetLanguage: payload.targetLanguage,
        nativeVoiceId:
          payload.nativeVoiceId ||
          `${payload.nativeLanguage}-${chosenSlug === "vivi" ? "girl" : "boy"}-01`,
        targetVoiceId:
          payload.targetVoiceId ||
          `${payload.targetLanguage}-${chosenSlug === "vivi" ? "girl" : "boy"}-01`,
      },
      create: {
        userId: payload.userId,
        spriteId: sprite.id,
        nativeLanguage: payload.nativeLanguage,
        targetLanguage: payload.targetLanguage,
        nativeVoiceId:
          payload.nativeVoiceId ||
          `${payload.nativeLanguage}-${chosenSlug === "vivi" ? "girl" : "boy"}-01`,
        targetVoiceId:
          payload.targetVoiceId ||
          `${payload.targetLanguage}-${chosenSlug === "vivi" ? "girl" : "boy"}-01`,
      },
    });

    // 2. Create Course & Lesson 1
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

    const spriteOrderIndex = getSpoonSpriteOrderIndex(payload.spoon); // 1 for Spoon 1

    const taskPayload = JSON.stringify({
      ...payload,
      foundationCourseId: course.id,
      foundationLessonId: lesson.id,
      spriteProfileId: spriteProfile.id,
      spriteOrderIndex,
    });

    const metadata = {
      type: payload.type,
      userId: payload.userId,
      courseId: course.id,
      foundationCourseId: course.id,
      foundationLessonId: lesson.id,
      spriteProfileId: spriteProfile.id,
      spriteOrderIndex,
      day: payload.spoon,
      spoon: payload.spoon,
    };

    // 3. Create all 3 SystemTasks in the same transaction
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

    const spriteTask = await tx.systemTask.create({
      data: {
        type: SystemTaskType.SPRITE_NOTIFICATION_GENERATION,
        payload: taskPayload,
        metadata: {
          ...metadata,
          orderIndex: spriteOrderIndex, // 1=Spoon1 (and webhook can also save 2=Vocab1!)
        },
      },
    });

    return {
      courseId: course.id,
      lessonId: lesson.id,
      taskId: lessonTask.id,
      vocabTaskId: vocabTask.id,
      spriteTaskId: spriteTask.id,
      spriteProfileId: spriteProfile.id,
      webhookUrl: hookUrl(lessonTask.id),
      vocabWebhookUrl: hookUrl(vocabTask.id),
      spriteWebhookUrl: hookUrl(spriteTask.id),
    };
  });
}