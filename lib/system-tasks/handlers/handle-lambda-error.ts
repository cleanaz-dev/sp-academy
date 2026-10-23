// lib/system-tasks/handlers/handle-lambda-error.ts
import { SystemTask } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher-server";

export interface LambdaErrorPayload {
  status?: "FAILED" | "ERROR" | "failed" | "error";
  ok?: false;
  lambdaName?: string;
  error: string;
  traceback?: string | null;
  stage?: string | null;
}

/**
 * Type guard to check if an incoming webhook body is a Lambda error report
 */
export function isLambdaErrorPayload(body: unknown): body is LambdaErrorPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  const statusUpper = typeof b.status === "string" ? b.status.toUpperCase() : "";
  return (
    statusUpper === "FAILED" ||
    statusUpper === "ERROR" ||
    (b.ok === false && typeof b.error === "string")
  );
}

/**
 * Handles any Lambda failure reported to /api/webhooks/system-tasks/[taskId]
 */
export async function handleLambdaError(
  task: SystemTask,
  body: LambdaErrorPayload
) {
  const prevMeta =
    task.metadata && typeof task.metadata === "object"
      ? (task.metadata as Record<string, any>)
      : {};

  const lambdaName = body.lambdaName || "unknown-lambda";
  const errorMessage = body.error || "Unknown Lambda error";
  const traceback = body.traceback || null;
  const failedAt = new Date().toISOString();

  console.error(
    `🚨 [handleLambdaError] Task ${task.id} (${task.type}) FAILED in [${lambdaName}]:`,
    errorMessage
  );

  // 1. Mark the SystemTask as FAILED and attach full diagnostic info to metadata
  await prisma.systemTask.update({
    where: { id: task.id },
    data: {
      status: "FAILED",
      metadata: {
        ...prevMeta,
        failedAt,
        lambdaName,
        stage: body.stage ?? null,
        errorMessage,
        traceback,
      },
    },
  });

  // 2. If a Boss Stage generation failed, mark the FoundationBossStage row as FAILED
  if (task.type === "SPOON_BOSS_GENERATION" && prevMeta.bossStageId) {
    await prisma.foundationBossStage
      .update({
        where: { id: String(prevMeta.bossStageId) },
        data: { status: "FAILED" },
      })
      .catch((err) =>
        console.error("[handleLambdaError] failed to mark bossStage FAILED:", err)
      );
  }

  // 3. Notify client via Pusher so UI / Sprite can offer a 1-click Retry button!
  const userId = prevMeta.userId;
  if (userId) {
    try {
      await pusherServer.trigger(`user-${userId}`, "system-task-failed", {
        taskId: task.id,
        taskType: task.type,
        courseId: prevMeta.foundationCourseId ?? prevMeta.courseId ?? null,
        spoon: prevMeta.spoon ?? prevMeta.day ?? null,
        bossStageId: prevMeta.bossStageId ?? null,
        lambdaName,
        stage: body.stage ?? null,
        errorMessage,
      });
    } catch (err) {
      console.error("[handleLambdaError] pusher notification failed:", err);
    }
  }

  return NextResponse.json({
    ok: true,
    taskId: task.id,
    status: "FAILED",
    lambdaName,
  });
}