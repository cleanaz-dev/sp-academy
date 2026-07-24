import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { lambda, createCommand } from "@/lib/aws/lambda";

interface Params {
  params: Promise<{ gameId: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { gameId } = await params;

    const {
      targetLanguage,
      nativeLanguage,
      difficulty,
      variation,
      count,
      generateImages,
    } = await req.json();

    // 1. Fetch schema + imageUrl (imageUrl only used if generateImages is true)
    const baseGame = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, imageUrl: true, gameDataSchema: true },
    });

    if (!baseGame)
      return NextResponse.json({ error: "Game not found" }, { status: 404 });

    if (!baseGame.gameDataSchema)
      return NextResponse.json(
        { error: "Game has no gameDataSchema defined" },
        { status: 400 },
      );

    // 2. Create tracking task
    const task = await prisma.systemTask.create({
      data: {
        status: "IN_PROGRESS",
        type: "GAME_VARIATION_GENERATION",
        metadata: {
          gameId: baseGame.id,
          targetLanguage,
          nativeLanguage,
          difficulty,
          variation,
        },
      },
    });

    const appUrl =
      process.env.NEXT_PUBLIC_URL || "https://spoon-academy.vercel.app";

    // 3. Lean Payload - only exactly what Lambda needs.
    // generateImages boolean is not passed through; its only effect
    // is whether gameReferenceImage gets included at all.
    const payload = {
      taskId: task.id,
      webhookUrl: `${appUrl}/api/webhook/system-tasks/${task.id}`,
      gameDataSchema: baseGame.gameDataSchema,
      targetLanguage,
      nativeLanguage,
      difficulty,
      variation,
      count,
      ...(generateImages ? { gameReferenceImage: baseGame.imageUrl } : {}),
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
