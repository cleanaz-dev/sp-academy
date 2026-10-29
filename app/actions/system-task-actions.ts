// app/actions/system-task-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { lambda, createCommand } from "@/lib/aws/lambda";
import { redis } from "@/lib/upstash";

export interface LiveTaskStatus {
  taskId: string;
  taskType: string;
  status: "BUILDING" | "FAILED" | "COMPLETED";
  label: string;
  courseId?: string | null;
  spoon?: number | null;
  bossStageId?: string | null;
  lambdaName?: string | null;
  stage?: string | null;
  errorMessage?: string | null;
  updatedAt: string;
}

const getTaskRedisKey = (userId: string) => `sprite:live-task:${userId}`;

export async function setLiveTaskState(userId: string, state: LiveTaskStatus) {
  try {
    await redis.set(getTaskRedisKey(userId), state, { ex: 7200 });
  } catch (err) {
    console.warn("[setLiveTaskState] Redis write failed:", err);
  }
}

export async function clearLiveTaskState(userId: string) {
  try {
    await redis.del(getTaskRedisKey(userId));
  } catch (err) {
    console.warn("[clearLiveTaskState] Redis del failed:", err);
  }
}

export async function getLiveTaskState(
  userId: string,
): Promise<LiveTaskStatus | null> {
  try {
    const cached = await redis.get<LiveTaskStatus>(getTaskRedisKey(userId));
    if (cached) return cached;
  } catch (err) {
    console.warn("[getLiveTaskState] Redis read failed:", err);
  }
  return null;
}

/**
 * Re-invokes the exact AWS Lambda for a FAILED SystemTask without creating duplicate DB rows
 */
export async function retrySystemTask(taskId: string): Promise<{
  ok: boolean;
  message?: string;
}> {
  try {
    const task = await prisma.systemTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return { ok: false, message: "SystemTask not found" };
    }

    const meta =
      task.metadata && typeof task.metadata === "object"
        ? (task.metadata as Record<string, any>)
        : {};
    const userId = meta.userId as string | undefined;

    // If VOCAB_BRIDGE_GENERATION failed, its parent payload lives on the SPOON_GENERATION task for the same lesson
    let storedPayload = task.payload;
    if (
      !storedPayload &&
      task.type === "VOCAB_BRIDGE_GENERATION" &&
      meta.foundationLessonId
    ) {
      const parentSpoonTask = await prisma.systemTask.findFirst({
        where: {
          type: "SPOON_GENERATION",
          metadata: {
            path: ["foundationLessonId"],
            equals: meta.foundationLessonId,
          },
        },
        orderBy: { createdAt: "desc" },
      });
      storedPayload = parentSpoonTask?.payload ?? null;
    }

    if (!storedPayload) {
      return {
        ok: false,
        message: "No saved payload found on SystemTask to retry.",
      };
    }

    const parsedPayload =
      typeof storedPayload === "string"
        ? JSON.parse(storedPayload)
        : storedPayload;

    // Determine which Lambda function handles this SystemTaskType
    const functionName =
      task.type === "SPRITE_NOTIFICATION_GENERATION"
        ? "spoon-sprite-builder"
        : task.type === "SPOON_BOSS_GENERATION"
          ? meta.lambdaName || "spoon-boss-builder" // or your boss lambda function name
          : "spoon-edu-builder";

    // 1. Reset SystemTask status back to PROCESSING / PENDING
    await prisma.systemTask.update({
      where: { id: task.id },
      data: {
        status: "IN_PROGRESS", // Adjust if your enum uses "PENDING"
        metadata: {
          ...meta,
          retriedAt: new Date().toISOString(),
          errorMessage: null,
          traceback: null,
        },
      },
    });

    // 2. If Boss Stage, set FoundationBossStage status back to BUILDING
    if (task.type === "SPOON_BOSS_GENERATION" && meta.bossStageId) {
      await prisma.foundationBossStage
        .update({
          where: { id: String(meta.bossStageId) },
          data: { status: "BUILDING" },
        })
        .catch(() => {});
    }

    // 3. Re-invoke the AWS Lambda
    const response = await lambda.send(
      createCommand({
        functionName,
        payload: { body: JSON.stringify(parsedPayload) },
        invocationType: "Event",
      }),
    );

    if (response.StatusCode !== 202) {
      throw new Error(`Unexpected Lambda status: ${response.StatusCode}`);
    }

    // 4. Update Redis live state to BUILDING
    if (userId) {
      await setLiveTaskState(userId, {
        taskId: task.id,
        taskType: task.type,
        status: "BUILDING",
        label: getFriendlyTaskLabel(task.type, meta.spoon ?? meta.day),
        courseId: meta.foundationCourseId ?? meta.courseId ?? null,
        spoon: meta.spoon ?? meta.day ?? null,
        bossStageId: meta.bossStageId ?? null,
        updatedAt: new Date().toISOString(),
      });
    }

    return { ok: true };
  } catch (err: any) {
    console.error("🚨 [retrySystemTask] failed:", err);
    return { ok: false, message: err.message || "Could not retry task" };
  }
}

function getFriendlyTaskLabel(taskType: string, spoon?: number | null) {
  switch (taskType) {
    case "SPOON_GENERATION":
      return spoon ? `Spoon ${spoon} Lesson` : "Spoon Lesson";
    case "VOCAB_BRIDGE_GENERATION":
      return spoon ? `Spoon ${spoon} Vocab Bridge` : "Vocab Bridge";
    case "SPOON_BOSS_GENERATION":
      return "Boss Stage Challenge";
    case "SPRITE_NOTIFICATION_GENERATION":
      return "Sprite Dispatch";
    default:
      return "Lesson Content";
  }
}