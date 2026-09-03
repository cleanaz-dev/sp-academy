import prisma from "@/lib/prisma";
import {
  SystemTask,
  LambdaStatus,
  SessionStatus,
  Prisma,
} from "@prisma/client";
import { NextResponse } from "next/server";
import { FreestyleReviewWebhookSchema } from "@/lib/schema/freestyle-review-schema";
import z from "zod";
import { pusherServer } from "@/lib/pusher-server";

export async function handleFreestyleReview(task: SystemTask, body: unknown) {
  try {
    const parsedResult = FreestyleReviewWebhookSchema.safeParse(body);
    console.log("Parsed Freestyle Review:", parsedResult.success);

    if (!parsedResult.success) {
      console.error(
        "Invalid Webhook Payload:",
        z.flattenError(parsedResult.error),
      );
      return NextResponse.json(
        {
          message: "Invalid payload",
          errors: z.flattenError(parsedResult.error),
        },
        { status: 400 },
      );
    }

    const { sessionId, status, review, error } = parsedResult.data;

    // 🚨 1. HANDLE FAILURE
    if (status === "FAILED") {
      console.error(`Lambda failed for session ${sessionId}:`, error);

      await prisma.freestyleReview.upsert({
        where: { freestyleSessionId: sessionId },
        update: { lambdaStatus: LambdaStatus.FAILED },
        create: {
          freestyleSessionId: sessionId,
          lambdaStatus: LambdaStatus.FAILED,
        },
      });

      await prisma.systemTask.update({
        where: { id: task.id },
        data: { status: "FAILED" },
      });

      // Tell the UI that the review failed so it doesn't spin forever
      await pusherServer.trigger(`session-${sessionId}`, "review:completed", {
        sessionId,
        status: "FAILED",
      });

      return NextResponse.json({ message: "Handled failure" }, { status: 200 });
    }

    // 🚨 2. HANDLE SUCCESS
    if (!review) {
      throw new Error("SUCCESS status but no review data");
    }

    // ✅ EXTRACT THE NEW FIELDS HERE
    const {
      mistakes,
      overallFeedback,
      metrics,
      grammarAnalysis,
      vocabUpgrades,
    } = review;

    await prisma.$transaction(async (tx) => {
      await tx.freestyleReview.upsert({
        where: { freestyleSessionId: sessionId },
        update: {
          lambdaStatus: LambdaStatus.SUCCESS,
          // mistakes is Json[] in Prisma, so we pass it as an array
          mistakes: mistakes as Prisma.InputJsonValue[],
          // The rest are Json? in Prisma, so we just cast them as InputJsonValue or null
          overallFeedback: overallFeedback
            ? (overallFeedback as Prisma.InputJsonValue)
            : null,
          metrics: metrics ? (metrics as Prisma.InputJsonValue) : null,
          grammarAnalysis: grammarAnalysis
            ? (grammarAnalysis as Prisma.InputJsonValue)
            : null,
          vocabUpgrades: vocabUpgrades
            ? (vocabUpgrades as Prisma.InputJsonValue)
            : null,
        },
        create: {
          freestyleSessionId: sessionId,
          lambdaStatus: LambdaStatus.SUCCESS,
          mistakes: mistakes as Prisma.InputJsonValue[],
          overallFeedback: overallFeedback
            ? (overallFeedback as Prisma.InputJsonValue)
            : null,
          metrics: metrics ? (metrics as Prisma.InputJsonValue) : null,
          grammarAnalysis: grammarAnalysis
            ? (grammarAnalysis as Prisma.InputJsonValue)
            : null,
          vocabUpgrades: vocabUpgrades
            ? (vocabUpgrades as Prisma.InputJsonValue)
            : null,
        },
      });

      await tx.freestyleSession.update({
        where: { id: sessionId },
        data: { status: SessionStatus.REVIEWED },
      });

      await tx.systemTask.update({
        where: { id: task.id },
        data: { status: "COMPLETED" },
      });
    });

    // Tell the UI that the review is ready!
    await pusherServer.trigger(`session-${sessionId}`, "review:completed", {
      sessionId,
      status: "SUCCESS",
    });

    return NextResponse.json(
      { message: "Review saved successfully" },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Error saving review:", err);

    await prisma.systemTask
      .update({
        where: { id: task.id },
        data: { status: "FAILED" },
      })
      .catch(console.error);

    // Fallback trigger so UI gets unstuck in case of a server crash
    try {
      const parsedBody = body as any;
      if (parsedBody?.sessionId) {
        await pusherServer.trigger(
          `session-${parsedBody.sessionId}`,
          "review:completed",
          {
            sessionId: parsedBody.sessionId,
            status: "FAILED",
          },
        );
      }
    } catch (pusherErr) {
      console.error("Failed to send fallback pusher event", pusherErr);
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
