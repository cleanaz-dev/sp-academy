import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { lambda, createCommand } from "@/lib/aws/lambda";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionId,
      messages,
      mistakes = [],
      duration,
      mode,
      topic,
      level,
      nativeLanguage,
      targetLanguage,
    } = body;

    console.log("sessionId:", sessionId, "duration:", duration);

    if (!sessionId || !messages) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Format the full transcript just for easy reading in the DB
    const fullTranscript = messages
      .map((m: any) => `[${m.role.toUpperCase()}]: ${m.text}`)
      .join("\n");

    // 2. Separate the mistakes into 3 distinct buckets for the Lambda (Added .toUpperCase())
    const grammarAndGenderMistakes = mistakes.filter(
      (m: any) => 
        m.category?.toUpperCase() === "GRAMMAR" || 
        m.category?.toUpperCase() === "GENDER"
    );
    const vocabMistakes = mistakes.filter(
      (m: any) => m.category?.toUpperCase() === "VOCABULARY"
    );
    const pronunciationMistakes = mistakes.filter(
      (m: any) => m.category?.toUpperCase() === "PRONUNCIATION"
    );

    // 3. Update the session in Prisma
    const updatedSession = await prisma.freestyleSession.update({
      where: { id: sessionId },
      data: {
        status: "REVIEW_PENDING",
        duration: duration,
        fullTranscript: fullTranscript,
        messages: messages, // Saves the enriched data to the DB!
      },
    });

    // 4. Create a SINGLE system task (Lambda will handle the 3 parallel LLM calls)
    const task = await prisma.systemTask.create({
      data: {
        type: "FREESTYLE_REVIEW",
        metadata: {
          sessionId,
          mode,
          level,
          nativeLanguage,
          targetLanguage,
        },
      },
    });

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/system-tasks/${task.id}`;

    // 5. The Payload for Lambda with the separated mistake buckets
    const payload = {
      taskId: task.id,
      sessionId,
      webhookUrl,
      mode,
      topic,
      level,
      nativeLanguage,
      targetLanguage,
      duration,
      fullTranscript,
      messages,
      // We pass the separated buckets so Lambda can easily fire 3 concurrent calls
      separatedMistakes: {
        grammarAndGender: grammarAndGenderMistakes,
        vocabulary: vocabMistakes,
        pronunciation: pronunciationMistakes,
      },
      // Keep the raw array just in case
      mistakes,
    };

    const command = createCommand({
      functionName: "spoon-freestyle-review",
      payload,
      invocationType: "Event",
    });

    // 6. Trigger AWS Lambda function (Fire & Forget style)
    await lambda.send(command);

    return NextResponse.json({
      success: true,
      message: "Session saved and Lambda review triggered.",
    });
  } catch (error) {
    console.error("Review Route Error:", error);
    return NextResponse.json(
      { error: "Failed to process review" },
      { status: 500 },
    );
  }
}