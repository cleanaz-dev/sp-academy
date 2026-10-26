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
import { SpriteSessionTurnsSchema } from "@/lib/schema/sprite-schema";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_LLM = "qwen/qwen3.8-27b";

function clean(value: unknown, fallback: string, max = 100) {
  if (typeof value !== "string") return fallback;
  return value.replace(/[\r\n"]/g, " ").trim().slice(0, max) || fallback;
}

function cleanNumber(value: unknown, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return value;
}

function stripGuillemets(str: string): string {
  return str.replace(/[«»]/g, '"').replace(/\s+/g, " ").trim();
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

  const rawSpriteName = clean(body.spriteName, "Vox");
  const spriteName =
    rawSpriteName.charAt(0).toUpperCase() + rawSpriteName.slice(1).toLowerCase();

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

STRICT FORMATTING & RESPONSE RULES:
1. NEVER leave your response blank. Always write 1 to 2 short spoken sentences first.
2. NEVER use French guillemets (« or »). Use standard single quotes (') or double quotes (") if quoting a word.
3. No markdown, asterisks, bullet points, or emojis in the spoken sentences.
4. Immediately after your 1-2 spoken sentences, ALWAYS output ---JSON--- on a new line followed by a valid JSON object containing the ${nativeLang} translation of what you said, and optionally a contextCard or action:
---JSON---
{
  "translation": "Complete ${nativeLang} translation of your spoken response above",
  "contextCard": {
    "title": "Short rule or word title",
    "grammarRule": "Simple 1-sentence explanation in ${nativeLang}",
    "examples": [
      { "french": "Example in ${targetLang}", "english": "Translation in ${nativeLang}" }
    ]
  },
  "action": {
    "type": "START_DRILL",
    "targetWord": "word being practiced"
  }
}
5. Always include "translation" inside the JSON. Only include "contextCard" when teaching a grammar rule or giving examples. Only include "action" (type must be "START_DRILL", "PROGRESS_REPORT", or "BOOKMARK_WORD") when starting a drill or action.
`;

  try {
    const userPrompt = getLastUserText(messages);

    const result = streamText({
      model: groq(GROQ_LLM),
      instructions: systemPrompt,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 4096, // Higher budget so reasoning tokens never starve output text
      onFinish: async ({ text }) => {
        try {
          const [spokenPart, rawJson] = text.split("---JSON---");
          const assistantReply = stripGuillemets(spokenPart || "");

          let parsedJson: any = {};
          if (rawJson) {
            try {
              parsedJson = JSON.parse(rawJson.trim());
            } catch {
              parsedJson = {};
            }
          }

          const validActionTypes = ["START_DRILL", "PROGRESS_REPORT", "BOOKMARK_WORD"];
          const sanitizedAction =
            parsedJson.action && validActionTypes.includes(parsedJson.action.type)
              ? {
                  type: parsedJson.action.type,
                  targetWord: parsedJson.action.targetWord || undefined,
                }
              : null;

          const newTurn = {
            id: crypto.randomUUID(),
            userPrompt: stripGuillemets(userPrompt),
            assistantReply:
              assistantReply ||
              stripGuillemets(parsedJson.translation || "Let's continue practicing."),
            translation: parsedJson.translation
              ? stripGuillemets(String(parsedJson.translation))
              : null,
            contextCard: parsedJson.contextCard ?? null,
            action: sanitizedAction,
            createdAt: new Date().toISOString(),
          };

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
                  turns: updatedTurns as any,
                },
                update: {
                  title: autoTitle,
                  turns: updatedTurns as any,
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