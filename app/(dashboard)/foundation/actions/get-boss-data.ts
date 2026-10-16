import { prisma } from "@/lib/prisma";

export async function getBossData(bossId: string, userId: string) {
  const bossData = await prisma.foundationBossStage.findFirst({
    where: {
      id: bossId,
      userId, // simpler than user: { id: userId }
      status: "READY",
    },
    include: {
      course: {
        select: {
          targetLanguage: true,
          nativeLanguage: true, // drop if you don't need it
        },
      },
    },
  });

  return bossData;
}

export type BossData = Awaited<ReturnType<typeof getBossData>>;
// => (FoundationBossStage & { course: { targetLanguage: string; nativeLanguage: string } }) | null