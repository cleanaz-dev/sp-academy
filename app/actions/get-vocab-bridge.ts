"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface GetVocabBridgeParams {
  userId: string;
  vocabId: string;
}

// 1. Export the exact Prisma payload type including relations
export type UserVocabBridge = Prisma.FoundationBridgeGetPayload<{
  include: {
    course: {
      select: {
        id: true;
        nativeLanguage: true;
        targetLanguage: true;
      };
    };
    lesson: {
      select: {
        id: true;
        orderIndex: true;
        title: true;
      };
    };
  };
}>;

export type GetVocabBridgeResult = UserVocabBridge | null;

export async function getVocabBridge({
  userId,
  vocabId,
}: GetVocabBridgeParams): Promise<GetVocabBridgeResult> {
  const bridge = await prisma.foundationBridge.findFirst({
    where: {
      id: vocabId,
      userId: userId, // Guarantees security: users can only fetch their own bridges
    },
    include: {
      course: {
        select: {
          id: true,
          nativeLanguage: true,
          targetLanguage: true,
        },
      },
      lesson: {
        select: {
          id: true,
          orderIndex: true,
          title: true,
        },
      },
    },
  });

  return bridge;
}