"use server";
import { getPresignedImageUrl } from "@/lib/aws/services/s3-presigned-url";

export async function getSceneMediaUrls(
  keys: (string | null | undefined)[]
): Promise<Record<string, string>> {
  const valid = keys.filter(
    (k): k is string => !!k && k.startsWith("foundation/") && !k.includes("..")
  );

  const out: Record<string, string> = {};
  await Promise.all(
    valid.map(async (key) => {
      try {
        out[key] = await getPresignedImageUrl(key, 3600);
      } catch (err) {
        console.error("[getSceneMediaUrls] presign failed for", key, err);
      }
    })
  );
  return out;
}