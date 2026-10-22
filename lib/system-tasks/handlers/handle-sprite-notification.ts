// lib/system-tasks/handlers/handle-sprite-notification.ts
import { prisma } from "@/lib/prisma";
import { SystemTask } from "@prisma/client";
import { NextResponse } from "next/server";

export async function handleSpriteNotificationGeneration(
  task: SystemTask,
  body: any,
) {
  // 1. Handle Lambda failure webhook
  if (body.status === "FAILED") {
    await prisma.systemTask.update({
      where: { id: task.id },
      data: {
        status: "FAILED",
        output: body,
      },
    });
    return NextResponse.json({ ok: false, error: body.error }, { status: 200 });
  }

  const meta = (task.metadata as Record<string, any>) || {};
  const defaultOrderIndex = Number(
    body.orderIndex ?? meta.orderIndex ?? meta.spriteOrderIndex ?? 1,
  );
  const fallbackNodeId = body.nodeId || meta.nodeId;

  // 2. Normalize single post or array of posts from spoon-sprite-builder
  const incomingPosts = Array.isArray(body.posts)
    ? body.posts
    : [
        {
          nodeId: fallbackNodeId,
          spriteSlug: body.spriteSlug || "vox",
          voiceId: body.voiceId || "en-US-boy-01",
          orderIndex: defaultOrderIndex,
          header: body.header || "Mission Update",
          body: body.body || body.text || "",
          action: body.action ?? null,
          audioUrl: body.audioUrl ?? null,
        },
      ];

  // Filter out any malformed items missing a nodeId
  const validPosts = incomingPosts.filter((p: any) => Boolean(p.nodeId || fallbackNodeId));

  if (validPosts.length === 0) {
    return NextResponse.json(
      { message: "Missing nodeId in webhook payload" },
      { status: 400 },
    );
  }

  // 3. Upsert each generated node into SpriteNode & mark SystemTask COMPLETED
  await prisma.$transaction([
    ...validPosts.map((post: any) => {
      const resolvedNodeId = String(post.nodeId || fallbackNodeId);
      const resolvedOrderIndex = Number(post.orderIndex ?? defaultOrderIndex);

      return prisma.spriteNode.upsert({
        where: { nodeId: resolvedNodeId },
        update: {
          header: post.header || "Mission Update",
          body: post.body || "",
          action: post.action ?? null,
          audioUrl: post.audioUrl ?? null,
        },
        create: {
          nodeId: resolvedNodeId,
          spriteSlug: post.spriteSlug || resolvedNodeId.split(":")[0] || "vox",
          voiceId: post.voiceId || resolvedNodeId.split(":")[1] || "en-US-boy-01",
          orderIndex: resolvedOrderIndex,
          header: post.header || "Mission Update",
          body: post.body || "",
          action: post.action ?? null,
          audioUrl: post.audioUrl ?? null,
        },
      });
    }),
    prisma.systemTask.update({
      where: { id: task.id },
      data: {
        status: "COMPLETED",
        result: body,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}