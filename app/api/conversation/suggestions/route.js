import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req) {
  try {
    const { history, targetLanguage, nativeLanguage } = await req.json();

   

    const formattedHistory = history
      .map(
        (msg) =>
          `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    const systemPrompt = `You are a ${targetLanguage} language tutor.
      Provide EXACTLY 2 natural responses as the USER/HUMAN ONLY.

      REQUIRED FORMAT (exactly 2 lines):
      First response in ${targetLanguage} ||| Translation in ${nativeLanguage}
      Second response in ${targetLanguage} ||| Translation in ${nativeLanguage}


      EXAMPLE (THIS IS AN EXAMPLE, USE CONTEXT FOR ACTUAL RESPONSE):
      Assistant: Hello! Do you want to eat something?
      Oui, j'aimerais une pizza, s'il vous plaît. ||| Yes, I would like a pizza, please.
      Une pizza avec du fromage et du jambon, merci ! ||| A pizza with cheese and ham, thank you!

      RULES:
      - Return EXACTLY 2 lines, no more, no less.
      - Each line MUST use the ||| separator.
      - One response should be simple, one more creative.
      - Do not include any explanations or extra text or .
      - Focus on user responses, not assistant replies.`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Based on this conversation, provide exactly 2 responses that the user could respond with:\n${formattedHistory}`,
        },
      ],
    });

    const suggestions = message.content[0].text
      .trim()
      .split("\n")
      .filter((line) => line.includes("|||"))
      .slice(0, 2)
      .map((suggestion) => {
        const [targetText, nativeText] = suggestion.split(/\s*\|\|\|\s*/);
        return {
          targetLanguage: targetText?.trim() || "",
          nativeLanguage: nativeText?.trim() || "",
        };
      });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggestions API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
