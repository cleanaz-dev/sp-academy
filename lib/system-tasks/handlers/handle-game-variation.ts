import prisma from "@/lib/prisma";
import { SystemTask } from "@prisma/client";
import { NextResponse } from "next/server";
import { gameVariationTaskMetaSchema } from "@/lib/schema/games/game-variation-task-metadata-schema"; // path

export async function handleGameVariation(task: SystemTask, body: any) {
  try {
    const { status, result, error } = body;

    // 1. Validate metadata with Zod
    const metaParse = gameVariationTaskMetaSchema.safeParse(task.metadata);
    if (!metaParse.success) {
      await prisma.systemTask.update({
        where: { id: task.id },
        data: {
          status: "FAILED",
          error: `Metadata validation failed: ${metaParse.error.message}`,
        },
      });
      return NextResponse.json({ message: "Invalid task metadata" }, { status: 400 });
    }

    const { gameVariationId } = metaParse.data;

    if (status === "COMPLETED") {
      console.log("gameVariation result:", JSON.stringify(result, null, 2));

      // 2. Update the existing GameVariation (created in the POST route)
      // Make sure your GameVariation model has a JSON/Text field to store the generated data
      await prisma.gameVariation.update({
        where: { id: gameVariationId },
        data: {
          gameData: result, // <-- rename `data` to whatever your Prisma field is (e.g., `gameData`, `content`)
        },
      });

      // 3. Mark the SystemTask as COMPLETED
      await prisma.systemTask.update({
        where: { id: task.id },
        data: {
          status: "COMPLETED",
          // optionally store the result in the task too
          // result: result 
        },
      });

      return NextResponse.json(
        { success: true, message: "Game variation saved" },
        { status: 200 }
      );
    }

    if (status === "FAILED") {
      await prisma.systemTask.update({
        where: { id: task.id },
        data: {
          status: "FAILED",
          error: error || "Unknown error occurred during Lambda execution",
        },
      });

      return NextResponse.json(
        { success: false, message: "Task marked as failed" },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: "Invalid status provided" }, { status: 400 });
  } catch (err: any) {
    console.error("Error in handleGameVariation:", err);
    return NextResponse.json(
      { message: err.message || "Failed to process game variation" },
      { status: 500 }
    );
  }
}

