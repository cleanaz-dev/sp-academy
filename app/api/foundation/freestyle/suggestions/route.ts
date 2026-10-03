// app/api/foundation/freestyle/suggestions/route.ts
import { NextResponse } from "next/server";
import { z } from "zod"; // Added z import
import prisma from "@/lib/prisma"; // Added Prisma import

const TAG = "[suggestions]";

// Define schema for suggestions body
const SuggestionsBodySchema = z.object({
  userId: z.string(), // Added userId to the schema
  targetLanguage: z.string(),
  nativeLanguage: z.string(),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string(),
      }),
    )
    .default([]),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parseResult = SuggestionsBodySchema.safeParse(rawBody);

    if (!parseResult.success) {
      console.error(`${TAG} ❌ Validation failed:`, z.flattenError(parseResult.error));
      return NextResponse.json(
        { error: "Invalid request body", details: z.flattenError(parseResult.error) },
        { status: 400 },
      );
    }

    const { userId, targetLanguage, nativeLanguage, chatHistory } = parseResult.data;

    console.log(`${TAG} 1. incoming request`, {
      targetLanguage,
      nativeLanguage,
      historyLength: chatHistory?.length,
      lastMessage: chatHistory?.[chatHistory.length - 1],
    });

    // --- Matrix Tracking Setup ---
    // Find or create the Language Profile for this user
    const profile = await prisma.languageProfile.upsert({
        where: {
            userId_languageCode: { userId, languageCode: targetLanguage },
        },
        update: {},
        create: {
            userId,
            languageCode: targetLanguage,
        },
    });
    const languageProfileId = profile.id;
    // --- End Matrix Tracking Setup ---

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
      {
        role: "user",
        content:
          "Give me the hint JSON for replying to the last message above. Respond with the JSON object only.",
      },
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

    const rawResponseBody = await response.text(); // Renamed to avoid conflict with `rawBody`
    console.log(`${TAG} 2. novita status`, response.status, response.ok);
    console.log(`${TAG} 3. novita raw body`, rawResponseBody.slice(0, 3000));

    if (!response.ok) {
      return NextResponse.json(
        { error: "Upstream API error", detail: rawResponseBody.slice(0, 500) },
        { status: 502 },
      );
    }

    let data: any;
    try {
      data = JSON.parse(rawResponseBody);
    } catch (e) {
      console.error(`${TAG} 3b. novita body was not valid JSON`, e);
      return NextResponse.json({ error: "Upstream returned non-JSON" }, { status: 502 });
    }

    const choice = data.choices?.[0];
    const rawContent = choice?.message?.content || "";
    console.log(`${TAG} 4. model output`, {
      finish_reason: choice?.finish_reason,
      contentLength: rawContent.length,
      hasReasoningContent: Boolean(choice?.message?.reasoning_content),
      content: rawContent,
    });

    // Extract JSON safely
    const match = rawContent.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error(`${TAG} 5. no JSON object found in model output`);
      return NextResponse.json({ error: "No JSON in model output" }, { status: 502 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(match[0]);
    } catch (e) {
      console.error(`${TAG} 5b. JSON.parse failed on:`, match[0], e);
      return NextResponse.json({ error: "Model returned invalid JSON" }, { status: 502 });
    }
    console.log(`${TAG} 5. parsed`, parsed);

    // Normalise so the UI never has to guard against a bad shape
    const clean = {
      starter: String(parsed.starter ?? "").trim(),
      starterTranslation: String(parsed.starterTranslation ?? "").trim(),
      vocabulary: (Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [])
        .filter((v: any) => v?.word && v?.definition)
        .slice(0, 3)
        .map((v: any) => ({ word: String(v.word), definition: String(v.definition) })),
    };
    console.log(`${TAG} 6. cleaned`, clean);

    // --- Matrix Tracking ---
    // Track seen for suggested vocabulary words
    if (clean.vocabulary.length > 0) {
      console.log(`${TAG} Tracking seen for suggested vocabulary.`);
      const vocabTrackingPromises = clean.vocabulary.map((vocabItem: any) =>
        prisma.wordStat.upsert({
          where: {
            languageProfileId_word: {
              languageProfileId,
              word: vocabItem.word,
            },
          },
          update: {
            seenCount: { increment: 1 },
            lastSeenAt: new Date(),
          },
          create: {
            languageProfileId,
            word: vocabItem.word,
            seenCount: 1,
            lastSeenAt: new Date(),
            status: "NEW", // Or a more specific status like "SUGGESTED"
          },
        })
      );
      await Promise.all(vocabTrackingPromises);
    }
    // --- End Matrix Tracking ---

    if (!clean.starter) {
      console.error(`${TAG} 6b. cleaned starter is empty, parsed keys were:`, Object.keys(parsed));
      return NextResponse.json({ error: "Empty suggestion" }, { status: 502 });
    }

    return NextResponse.json(clean);
  } catch (error) {
    console.error(`${TAG} route crashed:`, error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}