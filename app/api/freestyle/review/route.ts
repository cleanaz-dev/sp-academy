// app/api/freestyle/review/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust to your prisma instance path
import { lambda, createCommand } from "@/lib/aws/lambda";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, messages, duration } = body;
    console.log("sessionId:", sessionId, "messages:", messages, "duration:", duration)

    if (!sessionId || !messages) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Format the full transcript for Lambda (Deepseek) to read easily
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
        messages: messages, 
      },
    });

    const task = await prisma.systemTask.create({
      data: {
        type: "FREESTYLE_REVIEW",
        metadata: {
          sessionId,
        }
      }
    })

    const webhookUrl = `${process.env.NEXT_APP_PUBLIC_URL}/webhooks/system-tasks/${task.id}`

    const payload = {
      taskId: task.id,
      sessionId,
      webhookUrl
    }

    const command = createCommand({
      functionName: "spoon-freestyle-review",
      payload,
      invocationType: "Event"
    })

    // 3. Trigger your AWS Lambda function (Fire & Forget style)
    // You pass the sessionId so Lambda can pull the transcript, analyze it, 
    // and write the results to the FreestyleReview table.
    
    await lambda.send(command)
    
    return NextResponse.json({ 
      success: true, 
      message: "Session saved and Lambda review triggered." 
    });

  } catch (error) {
    console.error("Review Route Error:", error);
    return NextResponse.json({ error: "Failed to process review" }, { status: 500 });
  }
}