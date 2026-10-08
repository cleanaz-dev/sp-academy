// lib/system-tasks/handlers/handle-vocab-bridge.ts
import { Prisma, SystemTask } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher-server";
import { foundationBridgeWebhookSchema } from "@/lib/schema/foundation/vocab-schema";

const json = (v: unknown) => v as Prisma.InputJsonValue;

export async function handleVocabBridgeGeneration(task: SystemTask, body: unknown) {
  // 1. Validate
  const parsed = foundationBridgeWebhookSchema.safeParse(body);
  if (!parsed.success) {
    console.error(`[vocab-bridge] invalid payload for task ${task.id}`, parsed.error.issues);
    return NextResponse.json(
      { message: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const { userId, courseId, bridgeIndex } = data.meta;

  console.log(
    `[vocab-bridge] received task ${task.id} (user=${userId}, course=${courseId}, bridgeIndex=${bridgeIndex})`
  );

  // 2. Find the lesson this bridge belongs to (bridgeIndex === lesson.orderIndex)
  const lesson = await prisma.foundationLesson.findUnique({
    where: {
      foundationCourseId_orderIndex: {
        foundationCourseId: courseId,
        orderIndex: bridgeIndex,
      },
    },
    select: { id: true, userId: true },
  });

  if (!lesson || lesson.userId !== userId) {
    // 409 so the vocab lambda knows to retry if the lesson webhook hasn't landed yet
    return NextResponse.json(
      { message: "Lesson not found for this bridge" },
      { status: 409 }
    );
  }

  // 3. Clean up before saving
  // itemId arrives as "", so give each cooldown item a stable id for answer tracking
  const cooldown = data.cooldown.map((item, i) => ({
    ...item,
    itemId: `${bridgeIndex}-${item.mechanic}-${i}`,
  }));

  // wordAudio is sent twice; keep only the top-level copy
  const { wordAudio: _duplicate, ...handoffFragment } = data.handoffFragment;

  const content = {
    userId,
    bridgeScene: json(data.bridgeScene),
    vocabMoment: json(data.vocabMoment),
    cooldown: json(cooldown),
    pronunciationCheck: json(data.pronunciationCheck),
    handoffFragment: json(handoffFragment),
    wordAudio: json(data.wordAudio),
  };

  // 4. Upsert (idempotent on course + bridgeIndex, so retries are safe)
  const bridge = await prisma.foundationBridge.upsert({
    where: {
      foundationCourseId_bridgeIndex: {
        foundationCourseId: courseId,
        bridgeIndex,
      },
    },
    create: {
      foundationCourseId: courseId,
      foundationLessonId: lesson.id,
      bridgeIndex,
      ...content,
    },
    update: content,
    select: { id: true },
  });

  // 5. Notify the client (a Pusher failure must not fail the webhook)
  try {
    await pusherServer.trigger(`user-${userId}`, "foundation-bridge-ready", {
      lessonId: lesson.id,
      bridgeId: bridge.id,
      bridgeIndex,
    });
  } catch (err) {
    console.error("[vocab-bridge] pusher failed", err);
  }

  // 6. Mark the task complete
  await prisma.systemTask.update({
    where: { id: task.id },
    data: { status: "COMPLETED" },
  });

  console.log(
    `[vocab-bridge] completed task ${task.id} (bridgeId=${bridge.id}, lessonId=${lesson.id})`
  );

  return NextResponse.json({ bridgeId: bridge.id, lessonId: lesson.id });
}