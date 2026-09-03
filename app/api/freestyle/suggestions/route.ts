// app/api/freestyle/suggestions/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { targetLanguage, nativeLanguage, chatHistory } = await req.json();

    const systemPrompt = `You are a helpful language tutor assisting a student learning ${targetLanguage}. Their native language is ${nativeLanguage}.
Look at the conversation history and provide hints to help the student reply to the AI's LAST message.

CRITICAL FORMATTING: You MUST respond in raw JSON format exactly like this:
{
  "startingSentence": "A short phrase to start a sentence in ${targetLanguage}...",
  "finishingSentence": "A short phrase to finish a thought in ${targetLanguage}...",
  "vocabulary": [
    { "word": "Word in ${targetLanguage}", "definition": "Meaning in ${nativeLanguage}" },
    // Exactly 4 words related to the topic
  ]
}
DO NOT include markdown, emojis, or anything outside the JSON braces.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map((m: any) => ({ role: m.role, content: m.text }))
    ];

    const apiKey = process.env.NOVITA_API_KEY;
    const response = await fetch("https://api.novita.ai/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash-0731",
        messages: messages,
        response_format: { type: "json_object" },
        max_tokens: 600, // Very small output required
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";
    
    // Extract JSON safely
    const match = rawContent.match(/\{[\s\S]*\}/);
    const parsedData = match ? JSON.parse(match[0]) : {};

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Suggestions API failed:", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}