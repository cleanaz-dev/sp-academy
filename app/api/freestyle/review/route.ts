// app/api/freestyle/review/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { lambda, createCommand } from "@/lib/aws/lambda";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionId,
      messages, // <-- This contains all the hidden grammar & pronunciation data!
      duration,
      mode,
      topic,
      level,
      nativeLanguage,
      targetLanguage,
    } = body;

    console.log("sessionId:", sessionId, "duration:", duration);

    if (!sessionId || !messages) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Format the full transcript just for easy reading in the DB
    const fullTranscript = messages
      .map((m: any) => `[${m.role.toUpperCase()}]: ${m.text}`)
      .join("\n");

    // 2. Update the session in Prisma
    const updatedSession = await prisma.freestyleSession.update({
      where: { id: sessionId },
      data: {
        status: "REVIEW_PENDING",
        duration: duration,
        fullTranscript: fullTranscript,
        messages: messages, // Saves the enriched data to the DB!
      },
    });

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

    const webhookUrl = `${process.env.NEXT_APP_PUBLIC_URL}/webhooks/system-tasks/${task.id}`;

    // 3. The Payload for Lambda
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
      messages, // <--- ADD THIS HERE! Now the Lambda has the pre-computed mistakes!
    };

    const command = createCommand({
      functionName: "spoon-freestyle-review",
      payload,
      invocationType: "Event",
    });

    // 4. Trigger AWS Lambda function (Fire & Forget style)
    await lambda.send(command);

    return NextResponse.json({
      success: true,
      message: "Session saved and Lambda review triggered.",
    });
  } catch (error) {
    console.error("Review Route Error:", error);
    return NextResponse.json({ error: "Failed to process review" }, { status: 500 });
  }
}