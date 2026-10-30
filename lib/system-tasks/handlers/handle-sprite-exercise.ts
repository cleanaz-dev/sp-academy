// lib/system-tasks/handlers/handle-sprite-exercise.ts
import { Prisma, SystemTask } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher-server";
import { clearLiveTaskState } from "@/app/actions/system-task-actions";
import { SpriteExerciseWebhookSchema } from "@/lib/schema/sprite-exercise-schema";

export async function handleSpriteExerciseGeneration(
  task: SystemTask,
  body: unknown
) {
  const parsed = SpriteExerciseWebhookSchema.safeParse(body);
  if (!parsed.success) {
    console.error(
      `[sprite-exercise] invalid payload for task ${task.id}:`,
      parsed.error.issues
    );
    return NextResponse.json(
      { message: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { exerciseId, userId, title, content } = parsed.data;

  // 1. Update SpriteExercise row to READY with its 3-round content
  const updatedExercise = await prisma.spriteExercise.update({
    where: { id: exerciseId },
    data: {
      ...(title ? { title } : {}),
      status: "READY",
      content: content as unknown as Prisma.InputJsonValue,
    },
  });

  // 2. Mark SystemTask COMPLETED & clear Redis live-task state
  await Promise.all([
    prisma.systemTask.update({
      where: { id: task.id },
      data: { status: "COMPLETED" },
    }),
    clearLiveTaskState(userId),
  ]);

  // 3. Notify client via Pusher so the Sprite Chat opens the Exercise Arcade immediately!
  try {
    await Promise.all([
      pusherServer.trigger(`user-${userId}`, "sprite-exercise-ready", {
        exerciseId: updatedExercise.id,
        title: updatedExercise.title,
      }),
      pusherServer.trigger(`user-${userId}`, "system-task-completed", {
        taskId: task.id,
        exerciseId: updatedExercise.id,
      }),
    ]);
  } catch (err) {
    console.error("[sprite-exercise] Pusher trigger failed:", err);
  }

  return NextResponse.json({
    ok: true,
    exerciseId: updatedExercise.id,
  });
}