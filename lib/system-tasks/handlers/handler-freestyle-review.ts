import prisma from "@/lib/prisma";
// 1. Import the Enums and Prisma namespace for correct typing
import { 
  SystemTask, 
  LambdaStatus, 
  SessionStatus, 
  Prisma 
} from "@prisma/client"; 
import { NextResponse } from "next/server";
import { FreestyleReviewWebhookSchema } from "@/lib/schema/freestyle-review-schema";
import z from "zod";

export async function handleFreestyleReview(
  task: SystemTask,
  body: unknown // Replaced 'any' with 'unknown' for stricter type safety
) {
  try {
    const parsedResult = FreestyleReviewWebhookSchema.safeParse(body);

    if (!parsedResult.success) {
      console.error("Invalid Webhook Payload:", z.flattenError(parsedResult.error));
      return NextResponse.json(
        { message: "Invalid payload", errors: z.flattenError(parsedResult.error)},
        { status: 400 }
      );
    }

    const { sessionId, status, review, error } = parsedResult.data;

    // 2. Handle Lambda Failures (Using LambdaStatus enum)
    if (status === "FAILED") {
      console.error(`Lambda failed for session ${sessionId}:`, error);

      await prisma.freestyleReview.upsert({
        where: { freestyleSessionId: sessionId },
        update: { lambdaStatus: LambdaStatus.FAILED },
        create: { freestyleSessionId: sessionId, lambdaStatus: LambdaStatus.FAILED }
      });

      await prisma.systemTask.update({
        where: { id: task.id },
        // NOTE: If SystemTask uses an enum for status, import and use it here (e.g., SystemTaskStatus.FAILED)
        data: { status: "FAILED" }, 
      });

      return NextResponse.json({ message: "Handled failure" }, { status: 200 });
    }

    // 3. Handle Successful Execution
    const mistakes = review?.mistakes || []; 
    const overallFeedback = review?.overallFeedback || null;
    const metrics = review?.metrics || {};

    await prisma.$transaction(async (tx) => {
      // Upsert the review data
      await tx.freestyleReview.upsert({
        where: { freestyleSessionId: sessionId },
        update: {
          lambdaStatus: LambdaStatus.SUCCESS,
          // 4. Cast Zod objects to Prisma.InputJsonValue to satisfy strict TS rules
          mistakes: mistakes as Prisma.InputJsonValue[],
          overallFeedback: overallFeedback, 
          metrics: metrics as Prisma.InputJsonValue,
        },
        create: {
          freestyleSessionId: sessionId,
          lambdaStatus: LambdaStatus.SUCCESS,
          mistakes: mistakes as Prisma.InputJsonValue[],
          overallFeedback: overallFeedback,
          metrics: metrics as Prisma.InputJsonValue,
        },
      });

      // Mark the Session as REVIEWED (Using SessionStatus enum)
      await tx.freestyleSession.update({
        where: { id: sessionId },
        data: { status: SessionStatus.REVIEWED },
      });

      // Complete the Task
      await tx.systemTask.update({
        where: { id: task.id },
        // NOTE: Same here, use your enum if applicable (e.g., SystemTaskStatus.COMPLETED)
        data: { status: "COMPLETED" },
      });
    });

    return NextResponse.json({ message: "Review saved successfully" }, { status: 200 });
    
  } catch (err: any) {
    console.error("Error saving review:", err);
    
    await prisma.systemTask.update({
      where: { id: task.id },
      data: { status: "FAILED" }
    }).catch(console.error);

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}