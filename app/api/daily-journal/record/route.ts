import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { createCommand, lambda } from "@/lib/aws/lambda";
import { uploadPrivateAudioToS3Bucket } from "@/lib/aws/services/s3-upload-audio"; 
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const transcript = formData.get("transcript") as string;
    const targetLanguage = (formData.get("targetLanguage") as string) || "en-US";
    const nativeLanguage = (formData.get("nativeLanguage") as string) || "en-US";
    const entryDate = formData.get("entryDate") ? new Date(formData.get("entryDate") as string) : new Date();

    let s3Key: string | undefined = undefined;
    let audioUrl: string | undefined = undefined;

    if (audioFile) {
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      const fileExtension = audioFile.name.split('.').pop() || 'webm';
      const s3FileName = `journals/${uuidv4()}.${fileExtension}`;

      const uploadResult = await uploadPrivateAudioToS3Bucket(
        audioBuffer,
        s3FileName,
        audioFile.type || "audio/webm"
      );

      s3Key = uploadResult.key;
      audioUrl = uploadResult.url;
    }

    const journal = await prisma.dailyJournal.upsert({
      where: { userId_entryDate: { userId: user.id, entryDate } },
      update: { transcript, s3Key, language: targetLanguage, isCompleted: true },
      create: { transcript, s3Key, language: targetLanguage, entryDate, isCompleted: true, userId: user.id },
    });

    const task = await prisma.systemTask.create({
      data: {
        journalId: journal.id,
        type: "SPEECH_PRONUNCIATION_ANALYSIS",
        status: "PENDING",
        payload: { s3Key, targetLanguage, nativeLanguage, transcript },
      },
    });

    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${appBaseUrl}/api/webhooks/system-tasks/${task.id}`;

    const lambdaPayload = {
      taskId: task.id,
      journalId: journal.id,
      s3Key,
      audioUrl,
      transcript,
      targetLanguage,
      nativeLanguage,
      webhookUrl,
    };

    const command = createCommand({
      functionName: process.env.AWS_LAMBDA_JOURNAL_ANALYSIS_FUNCTION!,
      invocationType: "Event",
      payload: Buffer.from(JSON.stringify(lambdaPayload)),
    });

    await lambda.send(command);

    return NextResponse.json({ success: true, journal, taskId: task.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}