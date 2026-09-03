// app/api/freestyle/evaluate-turn/route.ts
import { NovitaTextModel } from "@/lib/novita";
import { NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 30;

const EvaluateBodySchema = z.object({
  userText: z.string().min(1),
  targetLanguage: z.string(),
  nativeLanguage: z.string(),
  level: z.enum(["EASY", "MEDIUM", "FLUENT", "ZERO"]).default("EASY"),
  pronunciationData: z.any().optional(),
});

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);

  try {
    const body = await req.json();
    const parseResult = EvaluateBodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { userText, targetLanguage, nativeLanguage, level, pronunciationData } =
      parseResult.data;

    console.log(
      `[EVAL-${requestId}] Evaluating turn. Level: ${level}, Text: "${userText}"`,
    );

    // 1. Level-based strictness mapped to Severity
    let levelInstruction = "";
    if (level === "EASY") {
      levelInstruction = "Be lenient. Only flag CRITICAL or MAJOR errors that impede understanding. Ignore MINOR mistakes.";
    } else if (level === "MEDIUM") {
      levelInstruction = "Flag CRITICAL, MAJOR, and standard MINOR grammatical/gender errors. Provide clear corrections.";
    } else if (level === "FLUENT") {
      levelInstruction = "Be highly strict. Flag everything including MINOR unnatural phrasing or vocabulary choices.";
    } else if (level === "ZERO") {
      levelInstruction = "Be extremely lenient. ONLY flag CRITICAL errors that completely prevent understanding.";
    }

    // 2. Format Pronunciation Context if it exists
    const pronunciationContext = pronunciationData?.words?.length
      ? `PRONUNCIATION DATA: The user's word-level pronunciation scores are: ${JSON.stringify(
          pronunciationData.words.map((w: any) => ({ word: w.word, score: w.accuracyScore }))
        )}. If any word scores poorly (e.g., below 60), log it as a PRONUNCIATION mistake.`
      : "No audio pronunciation data provided. Skip PRONUNCIATION category unless the text clearly contains a phonetic hallucination (a word that makes no sense but sounds similar to the right word).";

    // 3. Build the System Prompt
    const systemPrompt = `You are a strict language evaluator for a student learning ${targetLanguage}.
The student's native language is ${nativeLanguage}.

INSTRUCTIONS:
${levelInstruction}
Evaluate the user's text: "${userText}".

${pronunciationContext}

You MUST categorize every mistake into exactly ONE of these categories:
- GENDER: Incorrect articles (le/la, un/une, etc.) or noun-adjective agreement.
- GRAMMAR: Incorrect verb conjugations, wrong prepositions, or bad syntax.
- VOCABULARY: Using the wrong word entirely, or phrasing that sounds unnatural.
- PRONUNCIATION: Mispronounced words based on the provided data, or obvious phonetic transcription errors.

You MUST assign a severity to every mistake:
- MINOR: Slight error, meaning is perfectly clear.
- MAJOR: Noticeable error, but mostly understandable.
- CRITICAL: Meaning is lost, severely altered, or impossible to understand.

CRITICAL RULE:
Find ALL mistakes. If there are multiple errors (e.g., a gender error AND a pronunciation error), you MUST return multiple objects inside the "corrections" array.

You MUST respond in valid JSON matching exactly this schema:
{
  "hasMistakes": boolean,
  "corrections": [
    { 
      "category": "GENDER | GRAMMAR | PRONUNCIATION | VOCABULARY",
      "severity": "MINOR | MAJOR | CRITICAL",
      "mistake": "exact part of the string that was wrong", 
      "correction": "how to say it correctly", 
      "explanation": "brief explanation in ${nativeLanguage}" 
    }
    // Add an object like this for EACH mistake found
  ]
}

If there are no mistakes based on their level, return:
{ "hasMistakes": false, "corrections": [] }

Do not wrap in markdown (no \`\`\`json). Return raw JSON only.`;

    const apiKey = process.env.NOVITA_API_KEY;
    if (!apiKey) throw new Error("NOVITA_API_KEY is not configured.");

    // 4. Call Novita (Deepseek)
    const startTime = Date.now();
    const response = await fetch(
      "https://api.novita.ai/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: NovitaTextModel.DEEPSEEK_V4_FLASH,
          messages: [{ role: "system", content: systemPrompt }],
          response_format: { type: "json_object" },
          max_tokens: 500, // Increased to support multiple mistakes
          temperature: 0.1, // Low temperature for consistent JSON output
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Novita returned ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";

    // 5. Parse JSON safely
    let parsedContent: any;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch (e) {
      console.warn(
        `[EVAL-${requestId}] ⚠️ AI didn't return perfect JSON. Attempting cleanup...`,
      );
      const cleaned = rawContent
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      parsedContent = JSON.parse(cleaned);
    }

    console.log(
      `[EVAL-${requestId}] ✅ Finished in ${Date.now() - startTime}ms. Mistakes: ${parsedContent.hasMistakes}`,
    );

    return NextResponse.json(parsedContent);
  } catch (error: any) {
    console.error(`[EVAL-ERROR] ❌`, error.message || error);
    // If it fails, we gracefully return no mistakes so the UI doesn't break
    return NextResponse.json({ hasMistakes: false, corrections: [] });
  }
}