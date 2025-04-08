import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { words, language, storyId } = await request.json();

    // Debugging logs
    console.log("Received Data:");
    console.log("User ID:", userId);
    console.log("Language:", language);
    console.log("Story ID:", storyId);
    console.log("Words:", JSON.stringify(words, null, 2));

    // Validate input
    if (!storyId || !language || !words || !Array.isArray(words)) {
      return NextResponse.json(
        {
          error: "Invalid input. Missing storyId, language, or words",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: { userId },
    });

    // Create Practice Session
    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId: user.id,
        storyId: storyId,
        language: language,
        practiceWords: {
          create: words
            .filter((word) => word.accuracyScore < 80)
            .map((word) => ({
              originalWord: word.word,
              originalContext: word.context || "", // Optional context
              status: word.accuracyScore < 60 ? "NEEDS_PRACTICE" : "IMPROVING",
              difficulty: calculateDifficulty(word.accuracyScore),
            })),
        },
      },
      include: {
        practiceWords: true,
      },
    });

    return NextResponse.json(practiceSession);
  } catch (error) {
    console.error("Full error:", error);

    // More detailed error response
    return NextResponse.json(
      {
        error: "An error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Helper function to calculate difficulty
function calculateDifficulty(accuracyScore) {
  if (accuracyScore < 50) return 3; // Hard
  if (accuracyScore < 70) return 2; // Medium
  return 1; // Easy
}
