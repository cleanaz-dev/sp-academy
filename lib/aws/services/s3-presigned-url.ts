import { redis } from "@/lib/upstash";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Cache for 23 hours in Redis (S3 link valid for 24 hours)
const URL_EXPIRY_SECONDS = 86400; // 24h
const REDIS_TTL_SECONDS = 82800;  // 23h

export async function safePresign(key?: string | null): Promise<string | null> {
  if (!key) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;

  const redisKey = `presigned_img:${key}`;

  try {
    // 1. Check Redis Cache
    const cachedUrl = await redis.get<string>(redisKey);
    if (cachedUrl) {
      return cachedUrl;
    }

    // 2. Cache Miss: Generate URL with ResponseCacheControl header!
    // This forces the browser to store the image in its local disk cache.
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET!,
      Key: key,
      ResponseCacheControl: "public, max-age=86400, immutable", // <-- CRITICAL for browser caching
    });

    const freshUrl = await getSignedUrl(s3, command, {
      expiresIn: URL_EXPIRY_SECONDS,
    });

    // 3. Store in Redis
    await redis.set(redisKey, freshUrl, { ex: REDIS_TTL_SECONDS });

    return freshUrl;
  } catch (err) {
    console.error("[PRESIGN_REDIS_ERROR]", err);
    return null;
  }
}