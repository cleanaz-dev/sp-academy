// app/api/daily-journal/record/route.ts
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { createCommand, lambda } from "@/lib/aws/lambda";



const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const transcript = formData.get("transcript") as string;
    const language = (formData.get("language") as string) || "en-US";
    const entryDate = formData.get("entryDate") ? new Date(formData.get("entryDate") as string) : new Date();

    // 1. Upload to S3 (Standard step)
    // ... S3 Upload logic ...
    const s3Key = "journals/sample-key.webm"; 
    const audioUrl = "https://your-s3-bucket.s3.amazonaws.com/" + s3Key;

    // 2. Save DailyJournal
    const journal = await prisma.dailyJournal.create({
      data: {
        transcript,
        s3Key,
        audioUrl,
        language,
        entryDate,
        isCompleted: true,
      },
    });

    // 3. Create SystemTask to track async evaluation
    const task = await prisma.systemTask.create({
      data: {
        journalId: journal.id,
        type: "SPEECH_PRONUNCIATION_ANALYSIS",
        status: "PENDING",
        payload: { s3Key, language, transcript },
      },
    });

    // 4. Asynchronously invoke Python Lambda (Event = non-blocking)
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";
    const webhookUrl = `${appBaseUrl}/api/webhooks/journal-analysis`;

    const lambdaPayload = {
      taskId: task.id,
      journalId: journal.id,
      s3Key,
      audioUrl,
      transcript,
      language,
      webhookUrl,
    };


    const command = createCommand({
      functionName: "",
      invocationType: "Event",
      payload: Buffer.from(JSON.stringify(lambdaPayload)),
    })

    await lambda.send(command)

    return NextResponse.json({ success: true, journal, taskId: task.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}