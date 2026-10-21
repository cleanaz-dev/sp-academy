// lib/foundation/setup-next-lesson.ts
"use server";

import { SystemTaskType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  InvokeEduBuilderPayload,
  LessonDbContext,
} from "@/app/actions/invoke-edu-builder";

const BASE = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://spoonacademy.com"}/api/webhooks/system-tasks`;
const hookUrl = (taskId: string) => `${BASE}/${taskId}`;

// Maps spoon number (1,2,3,4...) to the 7-step cycle index (1,3,5, 8,10,12...)
function getSpoonSpriteOrderIndex(spoon: number): number {
  const milestoneIndex = Math.ceil(spoon / 3);
  return (spoon - 1) * 2 + (milestoneIndex - 1) + 1;
}

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

  // Only block if the lesson actually finished generating content!
  if (existing && (existing.title || existing.visualContent)) {
    throw new Error(`Lesson ${spoon} already exists and is ready.`);
  }

  return prisma.$transaction(async (tx) => {
    // 1. Lookup existing SpriteProfile (or create default Vox fallback if missing)
    let spriteProfile = await tx.spriteProfile.findUnique({
      where: { userId },
    });

    if (!spriteProfile) {
      const chosenSlug = payload.spriteSlug || "vox";
      const sprite = await tx.sprite.findUnique({
        where: { slug: chosenSlug },
      });

      if (!sprite) {
        throw new Error(`Sprite "${chosenSlug}" not found. Run seed-sprites first.`);
      }

      spriteProfile = await tx.spriteProfile.create({
        data: {
          userId,
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
    }

    // 2. Upsert Lesson: creates the row if new, or reuses the empty shell if a prior build failed/timed out!
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

    const spriteOrderIndex = getSpoonSpriteOrderIndex(spoon);

    const taskPayload = JSON.stringify({
      ...payload,
      foundationLessonId: lesson.id,
      spriteProfileId: spriteProfile.id,
      spriteOrderIndex,
    });

    const metadata = {
      type: payload.type,
      userId,
      courseId: foundationCourseId,
      foundationCourseId,
      foundationLessonId: lesson.id,
      spriteProfileId: spriteProfile.id,
      spriteOrderIndex,
      day: spoon,
      spoon,
    };

    // 3. Create Spoon, Vocab, and Sprite SystemTasks
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
          orderIndex: spriteOrderIndex,
        },
      },
    });

    return {
      courseId: foundationCourseId,
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