import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../client";
import { redis } from "@/lib/upstash";

// Default S3 URL validity: 24 hours (86400s)
// Redis cache TTL: 23 hours (82800s) to guarantee zero expired 403 errors
const DEFAULT_URL_EXPIRY_SECONDS = 86400;

export async function getPresignedImageUrl(
  s3Key: string,
  expiresInSeconds: number = DEFAULT_URL_EXPIRY_SECONDS
): Promise<string> {
  if (!s3Key) throw new Error("No S3 key provided");

  // Keep Redis TTL slightly shorter than S3 expiration
  const redisTtl = Math.max(60, expiresInSeconds - 3600);
  const cacheKey = `presigned_img:${s3Key}`;

  try {
    // 1. Check Redis cache first
    const cachedUrl = await redis.get<string>(cacheKey);
    if (cachedUrl) {
      return cachedUrl;
    }
  } catch (err) {
    console.warn(`[REDIS_PRESIGN_READ_ERROR] ${s3Key}:`, err);
    // Continue to S3 if Redis has a hiccup
  }

  // 2. Cache miss: generate presigned URL
  // ResponseCacheControl tells S3 to send browser-cache headers with the image download
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: s3Key,
    ResponseCacheControl: `public, max-age=${expiresInSeconds}, immutable`,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });

  // 3. Store in Redis
  try {
    await redis.set(cacheKey, presignedUrl, { ex: redisTtl });
  } catch (err) {
    console.warn(`[REDIS_PRESIGN_WRITE_ERROR] ${s3Key}:`, err);
  }

  return presignedUrl;
}