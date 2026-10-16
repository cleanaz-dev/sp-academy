import { prisma } from "@/lib/prisma";

export async function getBossData(bossId: string, userId: string) {
  const bossData = await prisma.foundationBossStage.findFirst({
    where: { 
        id: bossId, 
        user: { id: userId },
        status: "READY"
    },

  });

  return bossData;
}

export type BossData = Awaited<ReturnType<typeof getBossData>>;
// => FoundationBossStage | null