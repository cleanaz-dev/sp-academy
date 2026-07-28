// app/actions/journal-actions.ts
"use server";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/aws"; // Import your initialized s3Client

export async function getSignedAudioUrl(s3Key: string) {
  if (!s3Key) return { error: "No S3 key provided" };

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    });

    // Generate a URL that expires in 1 hour (3600 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    return { success: true, url: signedUrl };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return { error: "Failed to generate audio URL" };
  }
}