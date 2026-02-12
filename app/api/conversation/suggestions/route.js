import { NextResponse } from "next/server";
import { generateSuggestions } from "@/lib/minimax/actions/suggestions";

export async function POST(req) {
  try {
    const { history, targetLanguage, nativeLanguage } = await req.json();

    const suggestions = await generateSuggestions({
      history,
      targetLanguage,
      nativeLanguage,
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggestions API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 },
    );
  }
}