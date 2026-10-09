import { prisma } from "@/lib/prisma";

export async function getUserLanguage(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { nativeLanguage: true, targetLanguage: true },
  });

  return {
    lang: {
      nativeLanguage: user?.nativeLanguage ?? "en-US",
      targetLanguage: user?.targetLanguage ?? null,
    },
  };
}
