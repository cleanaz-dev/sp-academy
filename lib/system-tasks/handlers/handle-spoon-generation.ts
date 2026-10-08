// lib/system-tasks/handlers/handle-spoon-generation.ts
import { FoundationLessonStatus, Prisma, SystemTask } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher-server";
import { foundationLessonWebhookSchema } from "@/lib/schema/foundation/lesson-schema";

const json = (v: unknown) => v as Prisma.InputJsonValue;

export async function handleSpoonGeneration(task: SystemTask, body: unknown) {
  // Log the full incoming body (indented) before anything can reject it
  console.log(
    `[spoon-generation] received body for task ${task.id}:\n${JSON.stringify(body, null, 2)}`
  );

  // 1. Validate
  const parsed = foundationLessonWebhookSchema.safeParse(body);
  if (!parsed.success) {
    console.error(
      `[spoon-generation] invalid payload for task ${task.id}:\n${JSON.stringify(
        parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          code: i.code,
          message: i.message,
        })),
        null,
        2
      )}`
    );
    return NextResponse.json(
      { message: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const data = parsed.data;

  console.log(
    `[spoon-generation] payload valid (user=${data.userId}, course=${data.foundationCourseId}, orderIndex=${data.orderIndex})`
  );

  // 2. Make sure the course exists and belongs to this user
  const course = await prisma.foundationCourse.findFirst({
    where: { id: data.foundationCourseId, userId: data.userId },
    select: { id: true },
  });
  if (!course) {
    console.warn(
      `[spoon-generation] course not found: course=${data.foundationCourseId} user=${data.userId} task=${task.id}`
    );
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

  console.log(
    `[spoon-generation] upserting lesson (existing=${existing?.status ?? "none"} -> status=${status})`
  );

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
   // 6. Mark the task complete
    await prisma.systemTask.update({
      where: { id: task.id },
      data: { status: "COMPLETED" },
    });
  
  console.log(`[spoon-generation] ✅ lesson saved & completed taskId=${task.id} lessonId=${lesson.id}`);

  // The lambda reads `lessonId` from this response to trigger the vocab builder
  return NextResponse.json({ lessonId: lesson.id });
}