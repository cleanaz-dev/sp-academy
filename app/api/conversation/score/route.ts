import { NextResponse } from "next/server";
import { getUserScoreNew } from "@/lib/groq/services";

export async function POST(req: Request) {
  try {
    const { message, history, targetLanguage, vocabulary, title } = await req.json();

    // This is the slow LLM call
    const userScore = await getUserScoreNew({
      userMessage: message,
      recentHistory: history?.slice(-4) || [],
      targetLanguage,
      vocabulary,
      title,
    });

    return NextResponse.json({
      label: userScore?.label ?? "OK",
      score: userScore?.score ?? null,
      explanation: userScore?.explanation,
      improvedResponse: userScore?.improvedResponse,
      corrections: userScore?.corrections,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("User Score API Error:", {
      message: errorMessage,
      stack: errorStack,
      error: error
    });
    
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
  }
}