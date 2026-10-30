// app/actions/invoke-trial-builder.ts
"use server";

import { lambda, createCommand } from "@/lib/aws/lambda";
import { prisma } from "@/lib/prisma";
import { setupFirstLesson } from "@/lib/foundation/setup-first-lesson";
import { PaymentStatus, Prisma } from "@prisma/client";
import { setLiveTaskState } from "@/app/actions/system-task-actions";
import type {
  InvokeEduBuilderPayload,
  InvokeEduBuilderResult,
} from "./invoke-edu-builder";

export async function invokeTrialBuilder(
  payload: InvokeEduBuilderPayload
): Promise<InvokeEduBuilderResult> {
  // 1. Mark Billing as TRIAL (No Stripe checkout needed)
  await prisma.billingInformation.upsert({
    where: { userId: payload.userId },
    create: {
      userId: payload.userId,
      paymentStatus: PaymentStatus.TRIAL,
      isActive: true,
    },
    update: {
      paymentStatus: PaymentStatus.TRIAL,
      isActive: true,
    },
  });

  // 2. Set up Lesson, Course, SystemTask, & SpriteProfile in Postgres
  let dbContext;
  try {
    dbContext = await setupFirstLesson(payload);
  } catch (error) {
    console.error("❌ Trial lesson setup failed:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Trial setup failed",
    };
  }

  // 3. Assemble payload for spoon-trial-builder
  const trialLambdaPayload = {
    ...payload,
    day: payload.spoon || 1,
    foundationCourseId: dbContext.courseId,
    foundationLessonId: dbContext.lessonId,
    webhookUrl: dbContext.webhookUrl,
  };

  // 4. Save payload to the SystemTask (so retry works if needed)
  await prisma.systemTask
    .update({
      where: { id: dbContext.taskId },
      data: {
        payload: trialLambdaPayload as unknown as Prisma.InputJsonValue,
      },
    })
    .catch((e) => console.warn("Could not save payload to SystemTask:", e));

  // 5. Tell Redis we are building Spoon 1
  await setLiveTaskState(payload.userId, {
    taskId: dbContext.taskId,
    taskType: "SPOON_GENERATION",
    status: "BUILDING",
    label: "Spoon 1 Trial Lesson",
    courseId: dbContext.courseId,
    spoon: 1,
    updatedAt: new Date().toISOString(),
  });

  // 6. Invoke spoon-trial-builder
  try {
    const response = await lambda.send(
      createCommand({
        functionName: "spoon-trial-builder",
        payload: { body: JSON.stringify(trialLambdaPayload) },
        invocationType: "Event",
      })
    );

    if (response.StatusCode !== 202) {
      throw new Error(`Trial lambda failed with status: ${response.StatusCode}`);
    }

    return { ok: true, lessonId: dbContext.lessonId, taskId: dbContext.taskId };
  } catch (err) {
    console.error("❌ Error invoking spoon-trial-builder:", err);
    return { ok: false, error: "Could not start free trial." };
  }
}