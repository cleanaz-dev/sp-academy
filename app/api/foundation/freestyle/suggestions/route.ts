// app/api/foundation/freestyle/suggestions/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { targetLanguage, nativeLanguage, chatHistory } = await req.json();

    const systemPrompt = `You are a helpful language tutor assisting a beginner learning ${targetLanguage}. Their native language is ${nativeLanguage}.
Look at the conversation history and help the student reply to the AI's LAST message.

CRITICAL FORMATTING: You MUST respond in raw JSON exactly like this:
{
  "starter": "A short opening (max 6 words) in ${targetLanguage} the student can begin their reply with, ending in ...",
  "starterTranslation": "Its meaning in ${nativeLanguage}",
  "vocabulary": [
    { "word": "Word in ${targetLanguage}", "definition": "Meaning in ${nativeLanguage}" }
  ]
}
Rules:
- "vocabulary" has EXACTLY 3 items, useful for replying to the last message.
- Keep everything beginner-friendly and short.
- DO NOT include markdown, emojis, or anything outside the JSON braces.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map((m: any) => ({ role: m.role, content: m.text })),
    ];

    const response = await fetch("https://api.novita.ai/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NOVITA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "xiaomimimo/mimo-v2.6-flash",
        messages,
        response_format: { type: "json_object" },
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";

    // Extract JSON safely
    const match = rawContent.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : {};

    // Normalise so the UI never has to guard against a bad shape
    const clean = {
      starter: String(parsed.starter ?? "").trim(),
      starterTranslation: String(parsed.starterTranslation ?? "").trim(),
      vocabulary: (Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [])
        .filter((v: any) => v?.word && v?.definition)
        .slice(0, 3)
        .map((v: any) => ({ word: String(v.word), definition: String(v.definition) })),
    };

    if (!clean.starter) {
      return NextResponse.json({ error: "Empty suggestion" }, { status: 502 });
    }

    return NextResponse.json(clean);
  } catch (error) {
    console.error("Suggestions API failed:", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}