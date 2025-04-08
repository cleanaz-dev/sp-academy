//api/games/submit-score/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { gameId, score } = await request.json();

    const user = await prisma.user.findFirst({ where: { userId: userId } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Upsert: Creates if doesn't exist, updates if it does
    const savedScore = await prisma.gameScore.upsert({
      where: {
        userId_gameId: { userId: user.id, gameId }, // Unique constraint
      },
      update: {
        score: Math.max(score), // Keeps the highest score
      },
      create: {
        userId: user.id,
        gameId,
        score,
      },
    });

    return NextResponse.json(
      { message: "Score saved successfully", savedScore },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
