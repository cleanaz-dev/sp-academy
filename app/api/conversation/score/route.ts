import { NextResponse } from "next/server";
import { getUserScoreNew } from "@/lib/groq/services"; 
import prisma from "@/lib/prisma"; 

export async function POST(req: Request) {
  try {
    // 1. GET DATA
    // Rename userId to clerkUserId to avoid confusion
    const { 
      message, 
      history, 
      targetLanguage, 
      vocabulary, 
      title, 
      conversationId, 
      userId: clerkUserId // <--- This is "user_2m..."
    } = await req.json();

    // 2. CALCULATE SCORE
    const userScore = await getUserScoreNew({
      userMessage: message,
      recentHistory: history?.slice(-4) || [],
      targetLanguage,
      vocabulary,
      title,
    });

    // 3. DETERMINE IF WE SHOULD SAVE
    const scoreVal = userScore?.score ?? 100;
    const labelVal = userScore?.label || "Excellent";
    const badLabels = ["OK", "Poor", "Weak", "Bad"];
    const isLowScore = scoreVal < 8; // Assuming 1-10 scale based on your previous prompts
    const shouldSave = (badLabels.includes(labelVal) || isLowScore);

    // 4. UPSERT TO DB
    if (shouldSave && conversationId && clerkUserId) {
      
      // --- FIX STARTS HERE ---
      // We must find the INTERNAL MongoDB ID associated with this Clerk ID
      const dbUser = await prisma.user.findFirst({
        where: { userId: clerkUserId }, // Search by the Clerk ID string
        select: { id: true } // We only need the internal ObjectId
      });

      if (dbUser) {
        const newMistake = {
          id: crypto.randomUUID(),
          type: "GRAMMAR",
          original: message,
          improved: userScore?.improvedResponse,
          explanation: userScore?.explanation,
          score: scoreVal,
          label: labelVal,
          corrections: userScore?.corrections,
          timestamp: new Date().toISOString()
        };

        await prisma.conversationReview.upsert({
          where: {
            conversationId: conversationId,
          },
          create: {
            userId: dbUser.id, // <--- Use the Internal ObjectId, NOT the Clerk ID
            conversationId,
            mistakes: [newMistake], 
          },
          update: {
            mistakes: {
              push: newMistake, 
            },
          },
        });
        console.log(`Saved ${labelVal} grammar mistake for internal user ${dbUser.id}`);
      } else {
        console.warn(`Could not find internal user for Clerk ID: ${clerkUserId}`);
      }
      // --- FIX ENDS HERE ---
    }

    // 5. RETURN RESULT
    return NextResponse.json({
      label: userScore?.label ?? "OK",
      score: userScore?.score ?? null,
      explanation: userScore?.explanation,
      improvedResponse: userScore?.improvedResponse,
      corrections: userScore?.corrections,
    });

  } catch (error) {
    console.error("Score API Error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}