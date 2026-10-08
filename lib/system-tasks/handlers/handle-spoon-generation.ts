// lib/system-tasks/handlers/handle-spoon-generation.ts
import { FoundationLessonStatus, Prisma, SystemTask } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher-server";
import { foundationLessonWebhookSchema } from "@/lib/schema/foundation/lesson-schema";

const json = (v: unknown) => v as Prisma.InputJsonValue;

export async function handleSpoonGeneration(task: SystemTask, body: unknown) {
  // 1. Validate
  const parsed = foundationLessonWebhookSchema.safeParse(body);
  if (!parsed.success) {
    console.error(`[spoon-generation] invalid payload for task ${task.id}`, parsed.error.issues);
    return NextResponse.json(
      { message: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // 2. Make sure the course exists and belongs to this user
  const course = await prisma.foundationCourse.findFirst({
    where: { id: data.foundationCourseId, userId: data.userId },
    select: { id: true },
  });
  if (!course) {
    return NextResponse.json({ message: "Foundation course not found" }, { status: 404 });
  }

  // 3. Upsert (idempotent on courseId + orderIndex, so lambda retries are safe)
  const where = {
    foundationCourseId_orderIndex: {
      foundationCourseId: data.foundationCourseId,
      orderIndex: data.orderIndex,
    },
  };

  const existing = await prisma.foundationLesson.findUnique({
    where,
    select: { status: true },
  });

  // A retry must never knock a finished lesson back to an earlier state
  const status =
    existing?.status === FoundationLessonStatus.COMPLETED
      ? FoundationLessonStatus.COMPLETED
      : FoundationLessonStatus.IN_PROGRESS;

  const content = {
    title: data.lessonHandoff.theme,
    status,
    visualContent: json(data.visualContent),
    grammarContent: json(data.grammarContent),
    pronunciationData: json(data.pronunciationData),
    listeningContent: json(data.listeningContent),
    quizContent: json(data.quizContent),
    freestyle: json(data.freestyle),
    lessonHandoff: json(data.lessonHandoff),
  };

  const lesson = await prisma.foundationLesson.upsert({
    where,
    create: {
      userId: data.userId,
      foundationCourseId: data.foundationCourseId,
      orderIndex: data.orderIndex,
      ...content,
    },
    update: content,
    select: { id: true },
  });

  // 4. Tell the client it's ready (failure here must not fail the webhook)
  try {
    await pusherServer.trigger(`user-${data.userId}`, "foundation-lesson-ready", {
      lessonId: lesson.id,
      orderIndex: data.orderIndex,
    });
  } catch (err) {
    console.error("[spoon-generation] pusher failed", err);
  }

  // TODO: mark the SystemTask complete the same way your other handlers do

  // The lambda reads `lessonId` from this response to trigger the vocab builder
  return NextResponse.json({ lessonId: lesson.id });
}