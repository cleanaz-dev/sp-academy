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
        // Strip leading slashes just in case your mock data has them
        const cleanKey = key.replace(/^\/+/, ""); 

        // Safely grab the right bucket name
        const bucketName = process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME;
        if (!bucketName) throw new Error("AWS_BUCKET_NAME is not defined in env");

        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: cleanKey,
          // We removed ResponseContentType so videos/images don't break!
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