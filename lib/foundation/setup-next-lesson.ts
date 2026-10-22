// lib/foundation/setup-next-lesson.ts
"use server";

import { SystemTaskType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  InvokeEduBuilderPayload,
  LessonDbContext,
} from "@/app/actions/invoke-edu-builder";
import { getSpoonSpriteOrderIndex } from "./tool";

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
    select: { id: true, title: true, visualContent: true },
  });

  if (existing && (existing.title || existing.visualContent)) {
    throw new Error(`Lesson ${spoon} already exists and is ready.`);
  }

  return prisma.$transaction(async (tx) => {
    // 1. Lookup existing SpriteProfile
    let spriteProfile = await tx.spriteProfile.findUnique({
      where: { userId },
      include: { sprite: true },
    });

    if (!spriteProfile) {
      const chosenSlug = payload.spriteSlug || "vox";
      const sprite = await tx.sprite.findUnique({
        where: { slug: chosenSlug },
      });

      if (!sprite) {
        throw new Error(`Sprite "${chosenSlug}" not found. Run seed-sprites first.`);
      }

      const nativeVoiceId =
        payload.nativeVoiceId ||
        `${payload.nativeLanguage}-${chosenSlug === "vivi" ? "girl" : "boy"}-01`;
      const targetVoiceId =
        payload.targetVoiceId ||
        `${payload.targetLanguage}-${chosenSlug === "vivi" ? "girl" : "boy"}-01`;

      spriteProfile = await tx.spriteProfile.create({
        data: {
          userId,
          spriteId: sprite.id,
          nativeLanguage: payload.nativeLanguage,
          targetLanguage: payload.targetLanguage,
          nativeVoiceId,
          targetVoiceId,
        },
        include: { sprite: true },
      });
    }

    // 2. Upsert Lesson
    const lesson = await tx.foundationLesson.upsert({
      where: {
        foundationCourseId_orderIndex: {
          foundationCourseId,
          orderIndex: spoon,
        },
      },
      create: {
        user: { connect: { id: userId } },
        course: { connect: { id: foundationCourseId } },
        orderIndex: spoon,
      },
      update: {},
    });

    // 3. Option 1 Cache Check: Does this SpriteNode already exist?
    const spriteOrderIndex = getSpoonSpriteOrderIndex(spoon);
    const spriteSlug = spriteProfile.sprite.slug;
    const nodeId = `${spriteSlug}:${spriteProfile.nativeVoiceId}:${spriteProfile.nativeLanguage}:${spriteProfile.targetLanguage}:${spriteOrderIndex}`;

    const cachedSpriteNode = await tx.spriteNode.findUnique({
      where: { nodeId },
    });

    const taskPayload = JSON.stringify({
      ...payload,
      foundationLessonId: lesson.id,
      spriteProfileId: spriteProfile.id,
      spriteOrderIndex,
      nodeId,
    });

    const metadata = {
      type: payload.type,
      userId,
      courseId: foundationCourseId,
      foundationCourseId,
      foundationLessonId: lesson.id,
      spriteProfileId: spriteProfile.id,
      spriteOrderIndex,
      nodeId,
      day: spoon,
      spoon,
    };

    // 4. Create Core Spoon & Vocab Tasks
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

    // 5. Only create Sprite Task if NOT in cache!
    let spriteTaskId: string | null = null;
    let spriteWebhookUrl: string | null = null;

    if (!cachedSpriteNode) {
      const spriteTask = await tx.systemTask.create({
        data: {
          type: SystemTaskType.SPRITE_NOTIFICATION_GENERATION,
          payload: taskPayload,
          metadata: {
            ...metadata,
            orderIndex: spriteOrderIndex,
          },
        },
      });
      spriteTaskId = spriteTask.id;
      spriteWebhookUrl = hookUrl(spriteTask.id);
    }

    return {
      courseId: foundationCourseId,
      lessonId: lesson.id,
      taskId: lessonTask.id,
      vocabTaskId: vocabTask.id,
      spriteTaskId,
      spriteProfileId: spriteProfile.id,
      webhookUrl: hookUrl(lessonTask.id),
      vocabWebhookUrl: hookUrl(vocabTask.id),
      spriteWebhookUrl,
      cachedSpriteNode,
    };
  });
}