// lib/system-tasks/handlers/handle-sprite-notification.ts
import { prisma } from "@/lib/prisma";
import { SystemTask } from "@prisma/client";
import { NextResponse } from "next/server";

export async function handleSpriteNotificationGeneration(
  task: SystemTask,
  body: any,
) {
  const meta = (task.metadata as Record<string, any>) || {};
  const spriteProfileId = body.spriteProfileId || meta.spriteProfileId;
  const defaultOrderIndex = Number(body.orderIndex ?? meta.orderIndex ?? 1);

  if (!spriteProfileId) {
    return NextResponse.json(
      { message: "Missing spriteProfileId" },
      { status: 400 },
    );
  }

  // Supports either a single post { header, body, action, audioUrl, orderIndex }
  // OR an array of posts: { posts: [{ orderIndex: 1, ... }, { orderIndex: 2, ... }] }
  const incomingPosts = Array.isArray(body.posts)
    ? body.posts
    : [
        {
          orderIndex: defaultOrderIndex,
          header: body.header || "Mission Update",
          body: body.body || body.text || "",
          action: body.action ?? null,
          audioUrl: body.audioUrl ?? null,
        },
      ];

  await prisma.$transaction([
    ...incomingPosts.map((post: any) =>
      prisma.spritePost.upsert({
        where: {
          spriteProfileId_orderIndex: {
            spriteProfileId,
            orderIndex: Number(post.orderIndex ?? defaultOrderIndex),
          },
        },
        update: {
          header: post.header,
          body: post.body,
          action: post.action ?? null,
          audioUrl: post.audioUrl ?? null,
        },
        create: {
          spriteProfileId,
          orderIndex: Number(post.orderIndex ?? defaultOrderIndex),
          header: post.header,
          body: post.body,
          action: post.action ?? null,
          audioUrl: post.audioUrl ?? null,
        },
      }),
    ),
    prisma.systemTask.update({
      where: { id: task.id },
      data: {
        status: "COMPLETED",
        output: body,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}