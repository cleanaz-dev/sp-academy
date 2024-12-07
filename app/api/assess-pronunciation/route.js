// app/api/assess-pronunciation/route.js
import { performPronunciationAssessment, cleanup, formatAssessmentResults } from "@/lib/azure";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { audioUrl, storyText, storyId } = await req.json();

    if (!audioUrl || !storyText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const assessment = await performPronunciationAssessment(audioUrl, storyText);
    const formattedAssessment = formatAssessmentResults(assessment);

    // Clean up temporary files
    await cleanup();

    return NextResponse.json({
      success: true,
      assessment: formattedAssessment
    });

  } catch (error) {
    console.error('Assessment error:', error);
    return NextResponse.json(
      { error: "Assessment failed", details: error.message },
      { status: 500 }
    );
  }
}