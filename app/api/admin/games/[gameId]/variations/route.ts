import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { lambda, createCommand } from "@/lib/aws/lambda";

interface Params {
  params: Promise<{ gameId: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { gameId } = await params;

    const { language, difficulty, variation, count, generateImages } =
      await req.json();

    // 1. Fetch only the code (Lambda uses this to pick the prompt template)
    const baseGame = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, code: true, imageUrl: true },
    });

    if (!baseGame)
      return NextResponse.json({ error: "Game not found" }, { status: 404 });

    // 2. Create tracking task
    const task = await prisma.systemTask.create({
      data: {
        status: "IN_PROGRESS",
        type: "GAME_VARIATION_GENERATION",
        metadata: {
          gameId: baseGame.id,
        },
      },
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://spoon-academy.vercel.app";

    // 3. Lean Payload - Only exactly what Lambda needs to process & return
    const payload = {
      taskId: task.id,
      webhookUrl: `${appUrl}/api/webhook/system-tasks/${task.id}`,
      code: baseGame.code,
      language,
      difficulty,
      variation,
      count,
      generateImages,
      gameReferenceImage: baseGame.imageUrl
    };

    // 4. Fire and forget
    await lambda.send(
      createCommand({
        functionName: "spoon-game-variation-generator",
        payload,
        invocationType: "Event",
      }),
    );

    return NextResponse.json(
      {
        message: "Generation started",
        taskId: task.id,
      },
      { status: 202 },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to initiate" }, { status: 500 });
  }
}
