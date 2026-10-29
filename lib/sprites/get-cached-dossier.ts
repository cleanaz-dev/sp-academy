// lib/sprites/get-cached-dossier.ts
import { redis } from "@/lib/upstash";
import { buildDossier, type DossierV2 } from "@/lib/sprites/build-dossier";

const getDossierKey = (userId: string) => `sprite:dossier:v2:${userId}`;
const DOSSIER_TTL_SECONDS = 60 * 10; // 10 minutes

export async function getCachedDossier(
  userId: string,
  forceRefresh = false
): Promise<DossierV2> {
  const key = getDossierKey(userId);

  if (!forceRefresh) {
    try {
      const cached = await redis.get<DossierV2>(key);
      if (cached && typeof cached === "object") {
        return cached;
      }
    } catch (err) {
      console.warn("[getCachedDossier] Redis read failed, falling back to DB:", err);
    }
  }

  // Cache miss: build from Postgres
  const freshDossier = await buildDossier(userId);

  try {
    await redis.set(key, freshDossier, { ex: DOSSIER_TTL_SECONDS });
  } catch (err) {
    console.warn("[getCachedDossier] Redis write failed:", err);
  }

  return freshDossier;
}

/**
 * Call this inside handleSpoonGeneration, handleVocabBridgeGeneration,
 * or handleSpeechAnalysisTask so the next chat turn gets fresh scores!
 */
export async function invalidateDossierCache(userId: string) {
  try {
    await redis.del(getDossierKey(userId));
  } catch (err) {
    console.warn("[invalidateDossierCache] Redis del failed:", err);
  }
}