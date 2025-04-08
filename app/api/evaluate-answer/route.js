//api/evaluate-anwer/route.js

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  const { userAnswer, correctAnswer, context, instructions } =
    await request.json();

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `
          Task: Evaluate the user's language learning answer. The user is a beginner, so be extremely lenient about grammar and spelling mistakes. Only give suggestions if absolutely necessary.

      Context: ${context}
      Correct Answer: ${correctAnswer}
      User Answer: ${userAnswer}
      Instructions: ${instructions}

      STRICT RULES FOR YOU:
      - **DO NOT mention accents in any way.**
      - **DO NOT comment on missing or incorrect accents.**
      - **Only provide feedback on meaning, grammar, and overall comprehension.**
      - If the user's answer is understandable, score generously.

      Respond with **ONLY JSON output**:
      {
        "score": 0.0-1.0,
        "feedback": "string",
        "suggestion": "string|null"
      }
        `,
        },
      ],
    });

    const result = JSON.parse(response.content[0].text);
    return NextResponse.json(
      {
        success: true,
        result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
