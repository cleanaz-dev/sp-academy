import { cache } from "react";
import { prisma } from "@/lib/prisma"; // adjust to your prisma import

export const getUserSprite = cache(async (userId: string) => {
  return prisma.spriteProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      nativeLanguage: true,
      targetLanguage: true,
      nativeVoiceId: true,
      targetVoiceId: true,
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
});