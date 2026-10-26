// app/api/users/[userId]/sprite/chat/route.ts
import { NextResponse } from "next/server";
import { isUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  streamText,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { createGroq } from "@ai-sdk/groq";
import {
  SpriteTurnSchema,
  SpriteSessionTurnsSchema,
} from "@/lib/schema/sprite-schema";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_LLM = "openai/gpt-oss-20b";

function clean(value: unknown, fallback: string, max = 100) {
  if (typeof value !== "string") return fallback;
  return value.replace(/[\r\n"]/g, " ").trim().slice(0, max) || fallback;
}

function cleanNumber(value: unknown, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return value;
}

function getLastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      return messages[i].parts
        .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
        .map((p) => p.text)
        .join("");
    }
  }
  return "";
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const user = await isUser(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.messages)) {
    return NextResponse.json({ error: "messages must be an array" }, { status: 400 });
  }
  const messages: UIMessage[] = body.messages;
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : undefined;

  const spriteName = clean(body.spriteName, "Vox");
  const d = body.dossier || {};

  const userName = clean(d.userName, "Student");
  const nativeLang = clean(d.nativeLang, "English");
  const targetLang = clean(d.targetLang, "French");
  const currentLessonTitle = clean(d.currentLessonTitle, "Basics");
  const topWord = clean(d.topWord, "");
  const recentWords = clean(d.recentWords, "");
  const avgPronunciation = cleanNumber(d.avgPronunciation, 0);
  const avgMastery = cleanNumber(d.avgMastery, 0);

  const adaptiveInstruction =
    avgPronunciation > 80
      ? `They are doing great (Pronunciation: ${avgPronunciation}%). Use slightly more advanced vocabulary to challenge them.`
      : `They are struggling (Pronunciation: ${avgPronunciation}%). Be highly encouraging, use very simple words, and praise their effort.`;

  const systemPrompt = `
You are ${spriteName}, a concise, human-like language tutor.
You are helping ${userName}, whose native language is ${nativeLang}
and who is learning ${targetLang}.

LESSON CONTEXT:
- Current lesson: ${currentLessonTitle}
- Mastery score: ${avgMastery}%
- When teaching or practicing: ${adaptiveInstruction}

VOCABULARY CONTEXT:
${topWord ? `- Difficult word: ${topWord}` : ""}
${recentWords ? `- Recently learned words: ${recentWords}` : ""}

RESPONSE RULES:
1. Write 1 to 2 short plain-text sentences suitable for text-to-speech (no markdown, asterisks, or emojis).
2. If the user asks how to use a word, asks for grammar help, examples, or triggers a practice/action, first write your 1-2 sentence spoken response, then on a new line output ---JSON--- followed by a valid JSON object matching this exact structure:
---JSON---
{
  "contextCard": {
    "title": "Short rule or word title",
    "grammarRule": "Simple 1-sentence explanation",
    "examples": [
      { "french": "Example in ${targetLang}", "english": "Translation in ${nativeLang}" }
    ]
  },
  "action": {
    "type": "START_DRILL",
    "targetWord": "word being practiced"
  }
}
Only include "contextCard" if examples/grammar are helpful. Only include "action" if an action/drill should be triggered. If neither is needed, do not output ---JSON---.
`;

  try {
    const userPrompt = getLastUserText(messages);

    const result = streamText({
      model: groq(GROQ_LLM),
      instructions: systemPrompt,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 2048,
      onFinish: async ({ text }) => {
        try {
          const [spokenPart, rawJson] = text.split("---JSON---");
          const assistantReply = spokenPart.trim();

          let parsedJson: any = {};
          if (rawJson) {
            try {
              parsedJson = JSON.parse(rawJson.trim());
            } catch {
              parsedJson = {};
            }
          }

          // Validate the turn using your SpriteTurnSchema
          const newTurn = SpriteTurnSchema.parse({
            id: crypto.randomUUID(),
            userPrompt,
            assistantReply,
            contextCard: parsedJson.contextCard ?? null,
            action: parsedJson.action ?? null,
            createdAt: new Date().toISOString(),
          });

          // Persist to Prisma SpriteSession if user has a SpriteProfile and sessionId
          if (sessionId) {
            const profile = await prisma.spriteProfile.findUnique({
              where: { userId },
              select: { id: true },
            });

            if (profile) {
              const existingSession = await prisma.spriteSession.findUnique({
                where: { id: sessionId },
              });

              const existingTurns = existingSession
                ? SpriteSessionTurnsSchema.catch([]).parse(existingSession.turns)
                : [];

              const updatedTurns = [...existingTurns, newTurn];
              const autoTitle =
                existingSession?.title && existingSession.title !== "New Session"
                  ? existingSession.title
                  : userPrompt.slice(0, 48) || currentLessonTitle;

              await prisma.spriteSession.upsert({
                where: { id: sessionId },
                create: {
                  id: sessionId,
                  spriteProfileId: profile.id,
                  title: autoTitle,
                  lessonTitle: currentLessonTitle,
                  turns: updatedTurns,
                },
                update: {
                  title: autoTitle,
                  turns: updatedTurns,
                },
              });
            }
          }
        } catch (dbErr) {
          console.error("[SpriteSession] Failed to save turn:", dbErr);
        }
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (err) {
    console.error("Groq chat error:", err);
    return NextResponse.json({ error: "AI service error" }, { status: 502 });
  }
}