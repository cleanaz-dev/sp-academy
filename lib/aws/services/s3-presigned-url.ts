// ==========================================
// NEW FUNCTION TO GENERATE PRESIGNED URL FOR PRIVATE IMAGE
// ==========================================
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../client";

export async function getPresignedImageUrl(s3Key: string, expiresInSeconds: number = 3600) {
  try {
    if (!s3Key) throw new Error("No S3 key provided");

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    return presignedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
}