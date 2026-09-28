"use server";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getPresignedUrls(keys: (string | undefined | null)[]) {
  const urls: Record<string, string> = {};

  await Promise.all(
    keys.map(async (key) => {
      if (!key) return;
      try {
        // STRIP LEADING SLASHES (e.g. "/audio.mp3" becomes "audio.mp3")
        const cleanKey = key.replace(/^\/+/, ""); 

        const command = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: cleanKey, 
          ResponseContentType: "audio/mpeg", // Force browser to treat it as audio
        });
        
        urls[key] = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      } catch (error) {
        console.error(`Error generating presigned URL for ${key}:`, error);
        urls[key] = ""; 
      }
    })
  );

  return urls;
}