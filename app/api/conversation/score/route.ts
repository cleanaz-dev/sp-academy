import { NextResponse } from "next/server";
import { getUserScoreNew } from "@/lib/moonshot/services";

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}