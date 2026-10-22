// app/actions/get-sprite-node.ts
"use server";

import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type SpriteNodeRecord = {
  nodeId: string;
  header: string | null;
  nativeBody: string;
  targetBody: string | null;
  nativeAudioUrl: string | null;
  targetAudioUrl: string | null;
  action: string | null;
};

export const getSpriteNode = cache(
  async (
    p: { slug: string; nativeVoiceId: string; targetVoiceId: string },
    orderIndex: number
  ): Promise<SpriteNodeRecord | null> => {
    return prisma.spriteNode.findUnique({
      where: {
        nodeId: `${p.slug}:${p.nativeVoiceId}:${p.targetVoiceId}:${orderIndex}`,
      },
      select: {
        nodeId: true,
        header: true,
        nativeBody: true,
        targetBody: true,
        nativeAudioUrl: true,
        targetAudioUrl: true,
        action: true,
      },
    });
  }
);