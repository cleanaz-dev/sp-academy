// app/api/freestyle/evaluate-turn/route.ts
import { NovitaTextModel } from "@/lib/novita";
import { NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 30; // 30 seconds is plenty for a single turn evaluation

const EvaluateBodySchema = z.object({
  userText: z.string().min(1),
  targetLanguage: z.string(),
  nativeLanguage: z.string(),
  level: z.enum(["EASY", "MEDIUM", "FLUENT"]).default("EASY"),
});

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    const body = await req.json();
    const parseResult = EvaluateBodySchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { userText, targetLanguage, nativeLanguage, level } = parseResult.data;
    
    console.log(`[EVAL-${requestId}] Evaluating turn. Level: ${level}, Text: "${userText}"`);

    // 1. Build the dynamic level-based instruction
    let levelInstruction = "";
    if (level === "EASY") {
      levelInstruction = "Be lenient. Only flag major, critical grammar or vocabulary errors that impede understanding. Ignore minor preposition or tense mistakes. Keep corrections very simple.";
    } else if (level === "MEDIUM") {
      levelInstruction = "Flag standard grammatical errors, incorrect verb conjugations, and unnatural phrasing. Provide clear corrections.";
    } else if (level === "FLUENT") {
      levelInstruction = "Be highly strict. Flag any unnatural phrasing, lack of advanced vocabulary, or slight grammatical imperfections. Suggest native-level idioms and advanced phrasing.";
    }

    // 2. Build the System Prompt
    const systemPrompt = `You are a strict language evaluator for a student learning ${targetLanguage}.
The student's native language is ${nativeLanguage}.

INSTRUCTIONS:
${levelInstruction}
Evaluate the user's text: "${userText}".

CRITICAL RULE:
You MUST respond in valid JSON matching exactly this schema:
{
  "hasMistakes": boolean,
  "corrections": [
    { 
      "mistake": "exact part of the string that was wrong", 
      "correction": "how to say it correctly", 
      "explanation": "brief explanation in ${nativeLanguage} (the student's native language)" 
    }
  ]
}

If there are no mistakes based on their level, return:
{ "hasMistakes": false, "corrections": [] }

Do not wrap in markdown (no \`\`\`json). Return raw JSON only.`;

    const apiKey = process.env.NOVITA_API_KEY;
    if (!apiKey) throw new Error("NOVITA_API_KEY is not configured.");

    // 3. Call Novita (Deepseek)
    const startTime = Date.now();
    const response = await fetch("https://api.novita.ai/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: NovitaTextModel.DEEPSEEK_V4_FLASH,
        messages: [{ role: "system", content: systemPrompt }],
        response_format: { type: "json_object" },
        max_tokens: 300, 
        temperature: 0.1, // Low temperature for consistent JSON output
      }),
    });

    if (!response.ok) {
      throw new Error(`Novita returned ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";
    
    // 4. Parse JSON safely
    let parsedContent: any
    try {
      parsedContent = JSON.parse(rawContent);
    } catch (e) {
      console.warn(`[EVAL-${requestId}] ⚠️ AI didn't return perfect JSON. Attempting cleanup...`);
      const cleaned = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedContent = JSON.parse(cleaned);
    }

    console.log(`[EVAL-${requestId}] ✅ Finished in ${Date.now() - startTime}ms. Mistakes: ${parsedContent.hasMistakes}`);

    return NextResponse.json(parsedContent);

  } catch (error: any) {
    console.error(`[EVAL-ERROR] ❌`, error.message || error);
    // If it fails, we gracefully return no mistakes so the UI doesn't break
    return NextResponse.json({ hasMistakes: false, corrections: [] });
  }
}