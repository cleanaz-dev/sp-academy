//api/conversation/translate/route.js

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { text, from, to } = await request.json();

    // Construct the prompt for translation
    const prompt = `Translate the following text from ${from} to ${to}. Only respond with the translation, no additional text:
    "${text}"`;

    // Call Claude for translation
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the translated text from Claude's response
    const translatedText = response.content[0].text;

    return NextResponse.json(
      { 
        translatedText,
        original: text,
        fromLanguage: from,
        toLanguage: to 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Translation error:", error.message);
    return NextResponse.json(
      { error: "Translation failed. Please try again." },
      { status: 500 }
    );
  }
}