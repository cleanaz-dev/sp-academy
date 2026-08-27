// app/api/freestyle/review/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust to your prisma instance path
// import { invokeLambda } from "@/lib/aws"; // Un-comment when AWS SDK is ready

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, messages, duration } = body;

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
        messages: messages, // Save the JSON array of the chat history
      },
    });

    // 3. Trigger your AWS Lambda function (Fire & Forget style)
    // You pass the sessionId so Lambda can pull the transcript, analyze it, 
    // and write the results to the FreestyleReview table.
    
    /* 
    await invokeLambda('YourLambdaFunctionName', {
      sessionId: updatedSession.id,
      targetLanguage: updatedSession.targetLanguage,
      transcript: fullTranscript
    }); 
    */

    return NextResponse.json({ 
      success: true, 
      message: "Session saved and Lambda review triggered." 
    });

  } catch (error) {
    console.error("Review Route Error:", error);
    return NextResponse.json({ error: "Failed to process review" }, { status: 500 });
  }
}