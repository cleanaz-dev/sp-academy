import prisma from "@/lib/prisma";
import { SystemTask, TaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

interface ImagePayload {
  imageUrl?: string | null;
  aiAvatarUrl?: string | null;
  maleAiAvatarUrl?: string | null;
  femaleAiAvatarUrl?: string | null;
}

interface ConversationImageWebhookBody {
  systemTaskId?: string;
  conversationId?: string;
  status?: "COMPLETED" | "FAILED";
  images?: ImagePayload;
  error?: string;
}

export async function handleConversationImages(
  task: SystemTask,
  body: ConversationImageWebhookBody
) {
  try {
    const { status, images = {}, error } = body;

    // 1. Resolve conversationId from body or task metadata fallback
    const taskMetadata = (task.metadata as Record<string, any>) || {};
    const conversationId = body.conversationId || taskMetadata.conversationId;

    if (!conversationId) {
      throw new Error("Missing conversationId in webhook body and task metadata");
    }

    // 2. Handle Lambda Failure State
    if (status === "FAILED" || error) {
      await prisma.systemTask.update({
        where: { id: task.id },
        data: {
          status: TaskStatus.FAILED,
          metadata: {
            ...taskMetadata,
            error: error || "Image generation failed in Lambda",
            failedAt: new Date().toISOString(),
          },
        },
      });

      return NextResponse.json(
        { message: "Task marked as failed", error },
        { status: 200 }
      );
    }

    const {
      imageUrl,
      aiAvatarUrl,
      maleAiAvatarUrl,
      femaleAiAvatarUrl,
    } = images;

    // 3. Atomically update both Conversation and SystemTask in a transaction
    const [updatedConversation, updatedTask] = await prisma.$transaction([
      // Update Conversation record with permanent S3 URLs
      prisma.conversation.update({
        where: { id: conversationId },
        data: {
          ...(imageUrl && { imageUrl }),
          ...(aiAvatarUrl && { aiAvatarUrl }),
          ...(maleAiAvatarUrl && { aiAvatarMaleUrl: maleAiAvatarUrl }),
          ...(femaleAiAvatarUrl && { aiAvatarFemaleUrl: femaleAiAvatarUrl }),
        },
      }),

      // Update SystemTask to COMPLETED with output metadata
      prisma.systemTask.update({
        where: { id: task.id },
        data: {
          status: TaskStatus.COMPLETED,
        },
      }),
    ]);

    // 4. Revalidate cache for the frontend UI
    revalidatePath(`/conversations/${conversationId}`);
    revalidatePath("/conversations");

    return NextResponse.json(
      {
        success: true,
        message: "Conversation images updated and task completed successfully",
        conversationId: updatedConversation.id,
        taskId: updatedTask.id,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(`[handleConversationImages] Error processing task ${task.id}:`, err);

    // Mark task as FAILED if something went wrong during database transaction
    await prisma.systemTask.update({
      where: { id: task.id },
      data: {
        status: TaskStatus.FAILED,
        metadata: {
          ...((task.metadata as Record<string, any>) || {}),
          error: err.message,
          failedAt: new Date().toISOString(),
        },
      },
    }).catch((dbErr) => console.error("Failed to update task to FAILED status:", dbErr));

    return NextResponse.json(
      { message: "Failed to handle conversation images", error: err.message },
      { status: 500 }
    );
  }
}