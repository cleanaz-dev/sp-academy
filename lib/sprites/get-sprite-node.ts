// lib/sprites/get-sprite-node.ts
"use server";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getPresignedUrls } from "@/app/actions/s3";

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
    const targetNodeId = `${p.slug}:${p.nativeVoiceId}:${p.targetVoiceId}:${orderIndex}`;
    console.log("\n==========================================");
    console.log("🔥 [SERVER: getSpriteNode] Looking up nodeId:", targetNodeId);

    const node = await prisma.spriteNode.findUnique({
      where: {
        nodeId: targetNodeId,
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

    console.log("🔥 [SERVER: getSpriteNode] Prisma result:", node);

    if (!node) {
      console.log("❌ [SERVER: getSpriteNode] NO NODE FOUND IN DB FOR:", targetNodeId);
      console.log("==========================================\n");
      return null;
    }

    const keysToSign = [node.nativeAudioUrl, node.targetAudioUrl].filter(
      Boolean
    ) as string[];

    const signedMap =
      keysToSign.length > 0 ? await getPresignedUrls(keysToSign) : {};

    console.log("🔥 [SERVER: getSpriteNode] Signed S3 URLs:", signedMap);
    console.log("==========================================\n");

    return {
      ...node,
      nativeAudioUrl: node.nativeAudioUrl
        ? signedMap[node.nativeAudioUrl] ?? null
        : null,
      targetAudioUrl: node.targetAudioUrl
        ? signedMap[node.targetAudioUrl] ?? null
        : null,
    };
  }
);