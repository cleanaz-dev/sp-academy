import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { SpriteAIContext } from "@/app/actions/compute-sprite-context";

export const getUserSprite = cache(async (userId: string) => {
  const data = await prisma.spriteProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      nativeLanguage: true,
      targetLanguage: true,
      nativeVoiceId: true,
      targetVoiceId: true,
      context: true,
      sprite: {
        select: {
          slug: true,
          name: true,
          avatarUrl: true,
          moodUrls: true,
          persona: true,
        },
      },
    },
  });

  if (!data) return null;

  // Cast Prisma's generic JsonValue into your strict SpriteAIContext type
  return {
    ...data,
    context: (data.context as unknown as SpriteAIContext) ?? null,
  };
});