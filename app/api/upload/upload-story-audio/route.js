// app/api/upload/route.js
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("audio");

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `story-${Date.now()}.mp3`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `audio/${filename}`,
      Body: buffer,
      ContentType: "audio/mpeg",
      ACL: "public-read",
    });

    await s3Client.send(command);

    const audioUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/audio/${filename}`;

    return NextResponse.json({ success: true, audioUrl });
  } catch (error) {
    console.error("S3 upload error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
