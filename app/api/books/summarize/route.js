//api/books/summarize/route.js
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    const { text } = data;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `Summarize the following text: "${text}". Only respond with a shorty summary, no additional text.`;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      prompt,
    });

    return NextResponse.json({ summary: response.content[0].text });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}