// lib/upstash.ts
"use server";

import { Redis } from "@upstash/redis";
import crypto from "crypto";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export type UserGenerationData = {
  firstName?: string;
  nativeLanguage?: string;
  targetLanguage?: string;
  level?: string;
  goals?: string[];
  [key: string]: any;
};

/**
 * Generates a short random token, stores the user's onboarding data in Upstash
 * for 10 minutes (600s), and returns the token for the URL (?setup=token).
 */
export async function setUserGeneration(
  data: UserGenerationData
): Promise<string> {
  const token = crypto.randomBytes(6).toString("hex");
  const key = `user_gen:${token}`;

  await redis.set(key, data, { ex: 600 });

  return token;
}

/**
 * Reads the onboarding generation data from Upstash using the token from searchParams.
 */
export async function getUserGeneration(
  token?: string | null
): Promise<UserGenerationData | null> {
  if (!token) return null;

  const key = `user_gen:${token}`;
  const data = await redis.get<UserGenerationData>(key);

  return data ?? null;
}

/**
 * Optional helper if you want to manually delete it once generation finishes
 */
export async function deleteUserGeneration(token: string): Promise<void> {
  await redis.del(`user_gen:${token}`);
}