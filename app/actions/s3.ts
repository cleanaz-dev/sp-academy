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

// New Batch Function
export async function getPresignedUrls(keys: (string | undefined | null)[]) {
  const urls: Record<string, string> = {};

  await Promise.all(
    keys.map(async (key) => {
      if (!key) return;
      try {
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: key,
        });
        urls[key] = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      } catch (error) {
        console.error(`Error generating presigned URL for ${key}:`, error);
        urls[key] = ""; // Fallback to empty string on failure
      }
    })
  );

  return urls;
}