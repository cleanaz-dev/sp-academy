import prisma from "@/lib/prisma";
import { SpeechAnalysisPayloadSchema } from "@/lib/schema/speech-analysis-schema";
import { TaskStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function handleSpeechAnalysisTask(task: any, body: any) {
  // Validate incoming payload from Python Lambda
  const parseResult = SpeechAnalysisPayloadSchema.safeParse(body);

  if (!parseResult.success) {
    console.error("Invalid Speech Analysis Payload:", parseResult.error.format());

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

  // NOTE: Ensure your Python Lambda sends "review" (not "reviewData") to match this!
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

      // 2. Upsert JournalReview (Now including the LLM Data!)
      prisma.journalReview.upsert({
        where: { journalId: task.journalId },
        update: {
          overallScore: review.overallScore,
          accuracyScore: review.accuracyScore,
          fluencyScore: review.fluencyScore,
          completenessScore: review.completenessScore,
          prosodyScore: review.prosodyScore,
          wordAnalysis: review.wordAnalysis,
          
          // NEW LLM FIELDS
          summaryFeedback: review.summaryFeedback,
          finalTranscript: review.correctedTranscript || review.finalTranscript,
          translation: review.translation,
          grammarMistakes: review.grammarMistakes, // Store as JSON in Prisma
          vocabularySuggestions: review.vocabularySuggestions // Store as JSON in Prisma
        },
        create: {
          journalId: task.journalId,
          overallScore: review.overallScore,
          accuracyScore: review.accuracyScore,
          fluencyScore: review.fluencyScore,
          completenessScore: review.completenessScore,
          prosodyScore: review.prosodyScore,
          wordAnalysis: review.wordAnalysis,
          
          // NEW LLM FIELDS
          summaryFeedback: review.summaryFeedback,
          finalTranscript: review.correctedTranscript || review.finalTranscript,
          translation: review.translation,
          grammarMistakes: review.grammarMistakes, 
          vocabularySuggestions: review.vocabularySuggestions 
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Review saved successfully." });
  }

  return NextResponse.json({ message: "No review data supplied." }, { status: 400 });
}