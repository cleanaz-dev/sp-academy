"use server";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.AWS_BUCKET_NAME!;

// s3 keys in -> { [s3Key]: signedUrl } out
export async function getWordAudioUrls(
  keys: string[]
): Promise<Record<string, string>> {
  const safeKeys = keys.filter(
    (k) =>
      typeof k === "string" &&
      k.startsWith("foundation/words/") &&
      !k.includes("..")
  );

  const entries = await Promise.all(
    safeKeys.map(async (key) => [
      key,
      await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: BUCKET, Key: key }),
        { expiresIn: 3600 }
      ),
    ])
  );

  return Object.fromEntries(entries);
}