// app/api/daily-journal/record/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { createCommand, lambda } from "@/lib/aws/lambda";
import { uploadPrivateAudioToS3Bucket } from "@/lib/aws/services/s3-upload-audio"; 
import { v4 as uuidv4 } from "uuid";

// app/api/daily-journal/record/route.ts
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
    const language = (formData.get("language") as string) || "en-US";
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
      update: { transcript, s3Key, language, isCompleted: true },
      create: { transcript, s3Key, language, entryDate, isCompleted: true, userId: user.id },
    });

    return NextResponse.json({ success: true, journal });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();
//     const audioFile = formData.get("audio") as File | null;
//     const transcript = formData.get("transcript") as string;
//     const language = (formData.get("language") as string) || "en-US";
//     const entryDate = formData.get("entryDate") ? new Date(formData.get("entryDate") as string) : new Date();

//     let s3Key: string | undefined = undefined;
//     let audioUrl: string | undefined = undefined;

//     // 1. Upload to S3 ONLY if an audio file was provided
//     if (audioFile) {
//       const arrayBuffer = await audioFile.arrayBuffer();
//       const audioBuffer = Buffer.from(arrayBuffer);

//       const fileExtension = audioFile.name.split('.').pop() || 'webm';
//       const s3FileName = `journals/${uuidv4()}.${fileExtension}`;

//       const uploadResult = await uploadPrivateAudioToS3Bucket(
//         audioBuffer,
//         s3FileName,
//         audioFile.type || "audio/webm"
//       );
      
//       s3Key = uploadResult.key;
//       audioUrl = uploadResult.url;
//     }

//     // 2. Save DailyJournal
//     const journal = await prisma.dailyJournal.create({
//       data: {
//         transcript,
//         s3Key, // Now optional, will save as null/undefined if no audio was uploaded
//         // audioUrl is completely removed from the model here
//         language,
//         entryDate,
//         isCompleted: true,
//       },
//     });

//     // // 3. Create SystemTask to track async evaluation
//     // const task = await prisma.systemTask.create({
//     //   data: {
//     //     journalId: journal.id,
//     //     type: "SPEECH_PRONUNCIATION_ANALYSIS",
//     //     status: "PENDING",
//     //     payload: { s3Key, language, transcript },
//     //   },
//     // });

//     // // 4. Asynchronously invoke Python Lambda (Event = non-blocking)
//     // const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";
//     // const webhookUrl = `${appBaseUrl}/api/webhooks/journal-analysis`;

//     // const lambdaPayload = {
//     //   taskId: task.id,
//     //   journalId: journal.id,
//     //   s3Key,
//     //   audioUrl, // Passed from the local variable so the lambda still has access to it
//     //   transcript,
//     //   language,
//     //   webhookUrl,
//     // };

//     // const command = createCommand({
//     //   functionName: "",
//     //   invocationType: "Event",
//     //   payload: Buffer.from(JSON.stringify(lambdaPayload)),
//     // })

//     // await lambda.send(command)

//     // return NextResponse.json({ success: true, journal, taskId: task.id });
//     return NextResponse.json({ success: true, journal });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }