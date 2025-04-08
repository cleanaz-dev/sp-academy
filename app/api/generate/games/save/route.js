import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadImage } from "@/lib/uploadImage";

export async function POST(request) {
  try {
    const {
      title,
      theme,
      description,
      rules,
      gameType,
      difficulty,
      language,
      gameData,
    } = await request.json();

    const allImageUrls = gameData.game.flatMap((game) => game.imageUrl);

    const uploadedImageUrls = await Promise.all(allImageUrls.map(uploadImage));

    const updatedGameData = gameData.game.map((game, index) => ({
      ...game,
      imageUrl: uploadedImageUrls[index] || game.imageUrl, // Use new URL if available
    }));

    const newGame = await prisma.game.create({
      data: {
        title,
        theme,
        description,
        rules,
        type: gameType,
        difficulty: parseInt(difficulty, 10),
        language: language.toUpperCase(),
        gameData: updatedGameData,
      },
    });
    return NextResponse.json(
      { message: "Data received successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the request" },
      { status: 500 },
    );
  }
}
