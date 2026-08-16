// app/api/conversation/score/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const NOVITA_API_URL = "https://api.novita.ai/openai/v1/chat/completions";
const NOVITA_MODEL = "deepseek/deepseek-v4-flash-0731";

interface Correction {
  original: string;
  corrected: string;
  reason: string;
}

interface NovitaScoreResult {
  score: number;
  label: string;
  explanation?: string;
  improvedResponse?: string;
  corrections?: Correction[];
}

async function getUserScoreNovita({
  userMessage,
  recentHistory,
  targetLanguage,
  vocabulary,
  title,
}: {
  userMessage: string;
  recentHistory: unknown[];
  targetLanguage: string;
  vocabulary?: unknown;
  title?: string;
}): Promise<NovitaScoreResult | null> {
  const systemPrompt = `You are a strict but fair language tutor grading a learner's message in ${targetLanguage}.
Conversation title: ${title ?? "N/A"}
Vocabulary the learner should be using: ${JSON.stringify(vocabulary ?? [])}
Recent conversation history: ${JSON.stringify(recentHistory ?? [])}

Grade the learner's latest message on a 0-100 scale for grammar, vocabulary use, and naturalness.
Respond with ONLY a raw JSON object (no markdown fences, no preamble) matching exactly this shape:
{
  "score": number,
  "label": "Excellent" | "Good" | "OK" | "Weak" | "Poor" | "Bad",
  "explanation": string,
  "improvedResponse": string,
  "corrections": [{ "original": string, "corrected": string, "reason": string }]
}`;

  const response = await fetch(NOVITA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NOVITA_API_KEY}`,
    },
    body: JSON.stringify({
      model: NOVITA_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 4000,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Novita API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const raw: string = data?.choices?.[0]?.message?.content ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean) as NovitaScoreResult;
  } catch {
    console.error("Failed to parse Novita score JSON:", raw);
    return null;
  }
}

function isValidObjectId(id: unknown): id is string {
  return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
}

export async function POST(req: Request) {
  try {
    // 1. VERIFY AUTHENTICATION VIA CLERK
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. PARSE & VALIDATE REQUEST BODY
    const body = await req.json();
    const {
      message,
      history,
      targetLanguage,
      vocabulary,
      title,
      conversationId,
    } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!conversationId || !isValidObjectId(conversationId)) {
      return NextResponse.json(
        { error: "A valid conversationId is required" },
        { status: 400 }
      );
    }

    // 3. CALCULATE SCORE VIA NOVITA AI
    const userScore = await getUserScoreNovita({
      userMessage: message,
      recentHistory: history?.slice(-4) || [],
      targetLanguage: targetLanguage || "English",
      vocabulary,
      title,
    });

    const scoreVal = userScore?.score ?? 100;
    const labelVal = userScore?.label || "Excellent";
    const badLabels = ["OK", "Poor", "Weak", "Bad"];
    const isLowScore = scoreVal < 80;
    const shouldSave = badLabels.includes(labelVal) || isLowScore;

    // 4. PERSIST MISTAKE IF NEEDED
    if (shouldSave) {
      const dbUser = await prisma.user.findFirst({
        where: { userId: clerkUserId },
        select: { id: true },
      });

      if (dbUser) {
        const newMistake: Prisma.InputJsonObject = {
          id: crypto.randomUUID(),
          type: "GRAMMAR",
          original: message,
          improved: userScore?.improvedResponse ?? null,
          explanation: userScore?.explanation ?? null,
          score: scoreVal,
          label: labelVal,
          corrections: (userScore?.corrections ?? []) as unknown as Prisma.InputJsonValue,
          timestamp: new Date().toISOString(),
        };

        // Fetch existing review mistakes if any
        const existingReview = await prisma.conversationReview.findUnique({
          where: { conversationId },
          select: { mistakes: true },
        });

        const currentMistakes: Prisma.InputJsonValue[] = Array.isArray(existingReview?.mistakes)
          ? (existingReview.mistakes as Prisma.InputJsonValue[])
          : existingReview?.mistakes
          ? [existingReview.mistakes as Prisma.InputJsonValue]
          : [];

        const updatedMistakes: Prisma.InputJsonValue[] = [...currentMistakes, newMistake];

        await prisma.conversationReview.upsert({
          where: { conversationId },
          create: {
            userId: dbUser.id,
            conversationId,
            mistakes: [newMistake],
          },
          update: {
            mistakes: updatedMistakes,
          },
        });
      } else {
        console.warn(`User with Clerk ID ${clerkUserId} not found in DB`);
      }
    }

    // 5. RETURN RESULT TO FRONTEND
    return NextResponse.json({
      label: userScore?.label ?? "OK",
      score: userScore?.score ?? null,
      explanation: userScore?.explanation,
      improvedResponse: userScore?.improvedResponse,
      corrections: userScore?.corrections ?? [],
    });
  } catch (error) {
    console.error("Score API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}