"use server";
import { lambda, createCommand } from "@/lib/aws/lambda";
import { prisma } from "@/lib/prisma";
import { JsonValue } from "@prisma/client/runtime/library";
import { setupFirstLesson } from "@/lib/foundation/setup-first-lesson";
import { setupNextLesson } from "@/lib/foundation/setup-next-lesson";

export interface InvokeEduBuilderPayload {
  userId: string;
  firstName: string;
  gender: string;
  foundationCourseId?: string;
  spoon: number;
  nativeLanguage: string;
  targetLanguage: string;
  levelBand: string;
  goal: string;
  scriptComfort: string;
  type: string;
  isOnboarding: boolean;
  previous_lessons?: JsonValue[];
  sessionId?: string;
}

export type InvokeEduBuilderResult =
  | { ok: true; lessonId: string; taskId: string }
  | { ok: false; error: string };

// Both setup functions must return this exact shape
export interface LessonDbContext {
  courseId: string;
  lessonId: string;
  taskId: string; // lesson task
  vocabTaskId: string; // vocab bridge task
  webhookUrl: string; // lesson callback
  vocabWebhookUrl: string; // vocab callback
}

export async function invokeEduBuilder(
  payload: InvokeEduBuilderPayload,
): Promise<InvokeEduBuilderResult> {
  // 1. DB setup
  let dbContext: LessonDbContext;
  try {
    dbContext = payload.isOnboarding
      ? await setupFirstLesson(payload)
      : await setupNextLesson(payload);
  } catch (error) {
    console.error("❌ Lesson setup failed:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Setup failed",
    };
  }

  // 2. Lambda payload
  const lambdaPayload = {
    ...payload,
    type: "lang",
    day: payload.spoon, // the lambdas read "day", not "spoon"
    foundationCourseId: dbContext.courseId,
    foundationLessonId: dbContext.lessonId,
    webhookUrl: dbContext.webhookUrl,
    vocabWebhookUrl: dbContext.vocabWebhookUrl,
  };

  console.log("Invoking edu builder", {
    userId: payload.userId,
    spoon: payload.spoon,
    ...dbContext,
    previousLessons: payload.previous_lessons?.length ?? 0,
  });

  // 3. Fire the lambda (async)
  try {
    const response = await lambda.send(
      createCommand({
        functionName: "spoon-edu-builder",
        payload: { body: JSON.stringify(lambdaPayload) },
        invocationType: "Event",
      }),
    );

    if (response.StatusCode !== 202) {
      throw new Error(`Unexpected lambda status: ${response.StatusCode}`);
    }

    console.log("✅ Edu builder queued", dbContext);
    return { ok: true, lessonId: dbContext.lessonId, taskId: dbContext.taskId };
  } catch (error) {
    console.error("❌ Error invoking Lambda:", error, new Date().toISOString());

    // Clean up so a retry doesn't hit "lesson already exists"
    await prisma.systemTask
      .updateMany({
        where: { id: { in: [dbContext.taskId, dbContext.vocabTaskId] } },
        data: { status: "FAILED" },
      })
      .catch((e) => console.error("Could not mark tasks failed", e));
    await prisma.foundationLesson
      .delete({ where: { id: dbContext.lessonId } })
      .catch((e) => console.error("Could not delete empty lesson", e));

    return {
      ok: false,
      error: "Could not start the next lesson. Please try again.",
    };
  }
}
