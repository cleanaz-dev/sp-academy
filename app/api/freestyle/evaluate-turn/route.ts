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

    const pronunciationContext = pronunciationData?.words?.length
      ? `PRONUNCIATION DATA: The user's word-level pronunciation scores are: ${JSON.stringify(
          pronunciationData.words.map((w: any) => ({ word: w.word, score: w.accuracyScore }))
        )}. If any word scores poorly (e.g., below 60), log it as a PRONUNCIATION mistake.`
      : "No audio pronunciation data provided. Skip PRONUNCIATION category unless the text clearly contains a phonetic hallucination.";

    const systemPrompt = `You are a strict language evaluator for a student learning ${targetLanguage}.
The student's native language is ${nativeLanguage}.

INSTRUCTIONS:
${levelInstruction}

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
Find ALL mistakes. If there are multiple errors, you MUST return multiple objects inside the "corrections" array.

You MUST respond in valid JSON matching exactly this schema:
{
  "hasMistakes": true or false,
  "corrections": [
    { 
      "category": "GRAMMAR", // MUST BE EXACTLY ONE OF: GENDER, GRAMMAR, PRONUNCIATION, VOCABULARY
      "severity": "MINOR", // MUST BE EXACTLY ONE OF: MINOR, MAJOR, CRITICAL
      "mistake": "exact part of the string that was wrong", 
      "correction": "how to say it correctly", 
      "explanation": "brief explanation in ${nativeLanguage}" 
    }
  ]
}

If there are no mistakes based on their level, return:
{ "hasMistakes": false, "corrections": [] }

Do not wrap in markdown. Return raw JSON only.`;

    const apiKey = process.env.NOVITA_API_KEY;
    if (!apiKey) throw new Error("NOVITA_API_KEY is not configured.");

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
          model: NovitaTextModel.QWEN_3_8_FLASH,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Evaluate this text: "${userText}"` }
          ],
          // Removed response_format to prevent 400 errors on some Qwen models
          max_tokens: 1000,
          temperature: 0.1,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Novita returned ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";

    let parsedContent: any = { hasMistakes: false, corrections: [] };
    try {
      parsedContent = JSON.parse(rawContent);
    } catch (e) {
      console.warn(`[EVAL-${requestId}] ⚠️ AI didn't return perfect JSON. Attempting cleanup...`);
      try {
        const cleaned = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedContent = JSON.parse(cleaned);
      } catch (err) {
        console.error(`[EVAL-${requestId}] ❌ JSON parse failed after cleanup:`, err);
      }
    }

    // Rock-solid fallback so it's NEVER undefined and catches hallucinations
    const corrections = Array.isArray(parsedContent?.corrections) ? parsedContent.corrections : [];
    const hasMistakes = (parsedContent?.hasMistakes === true) || (corrections.length > 0);

    const finalResult = { hasMistakes, corrections };

    console.log(
      `[EVAL-${requestId}] ✅ Finished in ${Date.now() - startTime}ms. Mistakes: ${finalResult.hasMistakes}, Count: ${finalResult.corrections.length}`,
    );

    return NextResponse.json(finalResult);
  } catch (error: any) {
    console.error(`[EVAL-ERROR] ❌`, error.message || error);
    return NextResponse.json({ hasMistakes: false, corrections: [] });
  }
}