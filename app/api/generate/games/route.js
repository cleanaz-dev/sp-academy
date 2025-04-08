//api/games/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const games = await prisma.game.findMany();
    return NextResponse.json(
      {
        message: "success",
        games,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to fetch games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 },
    );
  }
}
