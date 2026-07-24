import prisma from "@/lib/prisma";
import { SystemTask } from "@prisma/client";
import { NextResponse } from "next/server";

export async function handleGameSchema(task: SystemTask, body: any) {
  try {
    const { status, result, error } = body;

    // 1. Extract gameId from metadata (Prisma stores JSON fields as generic objects)
    const metadata = task.metadata as Record<string, any> | null;
    const gameId = metadata?.gameId;

    if (!gameId) {
      await prisma.systemTask.update({
        where: { id: task.id },
        data: {
          status: "FAILED",
          error: "Missing gameId in task metadata",
        },
      });
      return NextResponse.json(
        { message: "Missing gameId in task metadata" },
        { status: 400 }
      );
    }

    // 2. Handle Success
    if (status === "COMPLETED") {
      console.log("gameDataSchema result:", JSON.stringify(result, null, 2));

      // Update Game
      await prisma.game.update({
        where: { id: gameId },
        data: {
          gameDataSchema: result, // Saves the generated JSON schema to the game
        },
      });

      // Update SystemTask
      await prisma.systemTask.update({
        where: { id: task.id },
        data: {
          status: "COMPLETED",
          result: result, // Save the output directly on the task
        },
      });

      return NextResponse.json(
        { success: true, message: "Schema saved successfully" },
        { status: 200 }
      );
    }

    // 3. Handle Failure from Lambda
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
      // Return 200 so the Lambda doesn't try to retry the webhook request endlessly
    }

    return NextResponse.json(
      { message: "Invalid status provided" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Error in handleGameSchema:", err);
    return NextResponse.json(
      { message: err.message || "Failed to process game schema" },
      { status: 500 }
    );
  }
}