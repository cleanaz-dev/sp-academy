import { NextResponse } from "next/server";
import { getUserScoreNew } from "@/lib/groq/services"; // Your existing LLM service
import prisma from "@/lib/prisma"; 

export async function POST(req: Request) {
  try {
    // 1. GET DATA + IDs
    // We need conversationId and userId to know WHERE to save the review
    const { 
      message, 
      history, 
      targetLanguage, 
      vocabulary, 
      title, 
      conversationId, 
      userId 
    } = await req.json();

    // 2. CALCULATE SCORE (Your existing Logic)
    const userScore = await getUserScoreNew({
      userMessage: message,
      recentHistory: history?.slice(-4) || [],
      targetLanguage,
      vocabulary,
      title,
    });

    // 3. DETERMINE IF WE SHOULD SAVE (Matching your UI Colors)
    // Your UI uses Amber for "OK" and Red for lower.
    // We save if Label is "OK" or "Poor", OR if Score is < 80.
    const scoreVal = userScore?.score ?? 100;
    const labelVal = userScore?.label || "Excellent";
    
    // The "Bad" List
    const badLabels = ["OK", "Poor", "Weak", "Bad"];
    const isLowScore = scoreVal < 80;

    const shouldSave = (badLabels.includes(labelVal) || isLowScore);

    // 4. UPSERT TO DB (Background Task)
    if (shouldSave && conversationId && userId) {
      
      const newMistake = {
        id: crypto.randomUUID(),
        type: "GRAMMAR", // Tagging it so you know it's not pronunciation
        original: message,
        improved: userScore?.improvedResponse,
        explanation: userScore?.explanation,
        score: scoreVal,
        label: labelVal,
        corrections: userScore?.corrections, // Save specific details
        timestamp: new Date().toISOString()
      };

      // Upsert: If review exists, append. If not, create.
      await prisma.conversationReview.upsert({
        where: {
          conversationId: conversationId, // Finds the unique record
        },
        create: {
          userId,
          conversationId,
          mistakes: [newMistake], // Start the list
        },
        update: {
          mistakes: {
            push: newMistake, // Add to the list
          },
        },
      });
      
      console.log(`Saved ${labelVal} grammar mistake to Review`);
    }

    // 5. RETURN RESULT TO FRONTEND (Fluid)
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