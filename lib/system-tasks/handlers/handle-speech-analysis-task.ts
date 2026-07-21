import prisma from "@/lib/prisma";
import { SpeechAnalysisPayloadSchema } from "@/lib/schema/speech-analysis-schema";
import { TaskStatus } from "@prisma/client";
import { NextResponse } from "next/server";



export async function handleSpeechAnalysisTask(task: any, body: any) {
  // Validate incoming payload from Python Lambda
  const parseResult = SpeechAnalysisPayloadSchema.safeParse(body);

  if (!parseResult.success) {
    console.error("Invalid Speech Analysis Payload:", parseResult.error.format());

    // Mark task as failed due to payload mismatch
    await prisma.systemTask.update({
      where: { id: task.id },
      data: {
        status: TaskStatus.FAILED,
        error: "Invalid payload structure received from webhook.",
      },
    });

    return NextResponse.json(
      { message: "Invalid payload format", errors: parseResult.error.format() },
      { status: 400 }
    );
  }

  const { status, errorMessage, review } = parseResult.data;

  // Case A: Lambda reported an execution failure
  if (status === "FAILED") {
    await prisma.systemTask.update({
      where: { id: task.id },
      data: {
        status: TaskStatus.FAILED,
        error: errorMessage || "Speech analysis failed on Lambda.",
      },
    });

    return NextResponse.json({ message: "Task marked as failed." });
  }

  // Case B: Lambda succeeded and returned review metrics
  if (review) {
    await prisma.$transaction([
      // 1. Mark task as COMPLETED
      prisma.systemTask.update({
        where: { id: task.id },
        data: {
          status: TaskStatus.COMPLETED,
          error: null,
        },
      }),

      // 2. Upsert JournalReview
      prisma.journalReview.upsert({
        where: { journalId: task.journalId },
        update: {
          overallScore: review.overallScore,
          accuracyScore: review.accuracyScore,
          fluencyScore: review.fluencyScore,
          completenessScore: review.completenessScore,
          prosodyScore: review.prosodyScore,
          wordAnalysis: review.wordAnalysis,
          summaryFeedback: review.summaryFeedback,
        },
        create: {
          journalId: task.journalId,
          overallScore: review.overallScore,
          accuracyScore: review.accuracyScore,
          fluencyScore: review.fluencyScore,
          completenessScore: review.completenessScore,
          prosodyScore: review.prosodyScore,
          wordAnalysis: review.wordAnalysis,
          summaryFeedback: review.summaryFeedback,
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Review saved successfully." });
  }

  return NextResponse.json({ message: "No review data supplied." }, { status: 400 });
}