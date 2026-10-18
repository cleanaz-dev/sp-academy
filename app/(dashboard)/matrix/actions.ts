import { prisma } from "@/lib/prisma";

export async function getUserMatrix(userId: string) {
  const matrix = await prisma.user.findUnique({
    where: { id: userId },
    select: {
        languageProfiles: true
    }
  });
  return matrix
}
