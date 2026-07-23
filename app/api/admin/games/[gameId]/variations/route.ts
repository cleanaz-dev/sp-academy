// app/api/games/[gameId]/variations/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { lambda, createCommand } from '@/lib/aws/lambda';

interface Params {
  params: Promise<{
    gameId: string
  }>
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { gameId } = await params;
    // Client only sends these 3 (matching our form)
    const { language, variation, count } = await req.json();

    // 1. Fetch Base Game (Gets 'code' for Lambda context)
    const baseGame = await prisma.game.findUnique({ where: { id: gameId } });
    if (!baseGame) return NextResponse.json({ error: 'Game not found' }, { status: 404 });

    // 2. Create System Task (Tracking record for the UI to poll later)
    const task = await prisma.systemTask.create({
      data: {
        status: "IN_PROGRESS",
        type: "GAME_VARIATION_GENERATION",
        // Optional: link task to game if your model supports it
        // gameId: gameId 
      }
    });

    // 3. Construct Webhook & Payload
    // TODO: Move "spoon-academy.vercel.app" to process.env.APP_URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spoon-academy.vercel.app';
    const webhookUrl = `${appUrl}/api/webhook/system-tasks/${task.id}`;

    const payload = {
      language,
      variation,
      iterations: count,
      code: baseGame.code, // ✅ FIX: Use DB code, not client input
      taskId: task.id,     // ✅ FIX: Valid key name
      webhookUrl
    };

    // 4. Fire Lambda Asynchronously
    const command = createCommand({
      functionName: "spoon-game-variation-generator",
      payload,
      invocationType: "Event" // Fire and forget
    });

    await lambda.send(command);

    // 5. Return 202 Accepted immediately (Lambda will call webhook later)
    return NextResponse.json({ 
      message: 'Generation started', 
      taskId: task.id 
    }, { status: 202 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Failed to initiate variation generation' }, { status: 500 });
  }
}

