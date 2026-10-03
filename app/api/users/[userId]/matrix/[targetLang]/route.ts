// app/api/users/[userId]/matrix/[targetLang]/route.ts
import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string; targetLang: string }> }
) {
  try {
    const { userId, targetLang } = await params;

    console.log(`Fetching matrix for userId: ${userId}, targetLang: ${targetLang}`);

    // ==========================================
    // REAL PRISMA CODE (COMMENTED OUT FOR NOW)
    // ==========================================
    /*
    const profile = await prisma.languageProfile.findUnique({
      where: { userId_languageCode: { userId, languageCode: targetLang } },
      include: {
        wordStats: {
          orderBy: { masteryScore: 'desc' }
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ words: [] });
    }

    return NextResponse.json({ words: profile.wordStats });
    */

    // ==========================================
    // MOCK DATA (TO BUILD THE SICK UI)
    // ==========================================
    
    // Simulate network delay for the loading state effect
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockWordStats = [
      {
        id: "1",
        word: "Bonjour",
        seenCount: 14,
        heardCount: 12,
        tappedCorrect: 5,
        tappedWrong: 0,
        spokenAttempts: 3,
        avgSpokenScore: 95,
        masteryScore: 88,
        status: "MASTERED",
      },
      {
        id: "2",
        word: "enchanté",
        seenCount: 8,
        heardCount: 5,
        tappedCorrect: 3,
        tappedWrong: 2,
        spokenAttempts: 2,
        avgSpokenScore: 78,
        masteryScore: 65,
        status: "LEARNING",
      },
      {
        id: "3",
        word: "je",
        seenCount: 22,
        heardCount: 20,
        tappedCorrect: 15,
        tappedWrong: 1,
        spokenAttempts: 10,
        avgSpokenScore: 98,
        masteryScore: 96,
        status: "MASTERED",
      },
      {
        id: "4",
        word: "suis",
        seenCount: 15,
        heardCount: 14,
        tappedCorrect: 10,
        tappedWrong: 3,
        spokenAttempts: 8,
        avgSpokenScore: 88,
        masteryScore: 82,
        status: "MASTERED",
      },
      {
        id: "5",
        word: "Paul",
        seenCount: 5,
        heardCount: 4,
        tappedCorrect: 2,
        tappedWrong: 0,
        spokenAttempts: 1,
        avgSpokenScore: 100,
        masteryScore: 45,
        status: "FAMILIAR",
      },
      {
        id: "6",
        word: "merci",
        seenCount: 3,
        heardCount: 1,
        tappedCorrect: 0,
        tappedWrong: 1,
        spokenAttempts: 0,
        avgSpokenScore: null,
        masteryScore: 15,
        status: "NEW",
      },
      {
        id: "7",
        word: "beaucoup",
        seenCount: 2,
        heardCount: 1,
        tappedCorrect: 0,
        tappedWrong: 0,
        spokenAttempts: 1,
        avgSpokenScore: 45,
        masteryScore: 22,
        status: "NEW",
      },
    ];

    return NextResponse.json({ words: mockWordStats });
  } catch (error) {
    console.error("Failed to fetch matrix:", error);
    return NextResponse.json({ error: "Failed to fetch matrix" }, { status: 500 });
  }
}