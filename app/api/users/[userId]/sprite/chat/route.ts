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
import { getOrCreateProfileId } from "../session/route";


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

function stripArtifacts(str: string): string {
  return str
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/[«»]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
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
  const sessionId =
    typeof body.sessionId === "string" && body.sessionId.trim()
      ? body.sessionId.trim()
      : undefined;

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

LESSON & VOCABULARY CONTEXT (BACKGROUND ONLY):
- Current lesson: ${currentLessonTitle}
- Mastery score: ${avgMastery}%
- When teaching or practicing: ${adaptiveInstruction}
${topWord ? `- Difficult word: ${topWord}` : ""}
${recentWords ? `- Recently learned words: ${recentWords}` : ""}
This context is background information ONLY. Do NOT automatically force it into greetings or casual messages. If the learner says "Hello", just greet them naturally.

RESPONSE RULES:
1. Respond ONLY to the learner's latest message and its intent.
2. Normal responses must be 1 to 2 short plain-text sentences suitable for text-to-speech. Never use markdown, asterisks, bullet points, or French guillemets (« »).
3. Always model 100% grammatically correct ${targetLang}.
4. After your 1-2 spoken sentences, ALWAYS output ---JSON--- on a new line followed by this exact JSON structure:
---JSON---
{
  "isTranslationRequired": false,
  "translation": null,
  "contextCard": null,
  "action": null
}

JSON FIELD RULES:
- "isTranslationRequired": boolean. Set to TRUE ONLY if your spoken sentences above are written primarily in ${targetLang}. If your spoken sentences are already in ${nativeLang} (even if you quoted a ${targetLang} phrase), you MUST set "isTranslationRequired": false and "translation": null.
- "translation": string | null. Only provide the ${nativeLang} translation if "isTranslationRequired" is true. Otherwise must be null.
- "contextCard": null, OR if teaching a rule/examples: { "title": "Rule Title", "grammarRule": "1-sentence explanation", "examples": [{ "french": "${targetLang} example", "english": "${nativeLang} translation" }] }
- "action": null, OR if starting a drill: { "type": "START_DRILL", "targetWord": "word" }
`;

  try {
    const userPrompt = getLastUserText(messages);

    const result = streamText({
      model: groq(GROQ_LLM),
      instructions: systemPrompt,
      messages: await convertToModelMessages(messages),
      providerOptions: {
        groq: {
          reasoningFormat: "hidden",
        },
      },
      maxOutputTokens: 4096,
      onFinish: async ({ text }) => {
        if (!sessionId) return;
        try {
          const [spokenPart, rawJson] = text.split("---JSON---");
          const assistantReply = stripArtifacts(spokenPart || "");

          let parsedJson: any = {};
          if (rawJson) {
            try {
              const cleaned = rawJson.replace(/```json/gi, "").replace(/```/g, "").trim();
              parsedJson = JSON.parse(cleaned);
            } catch {
              parsedJson = {};
            }
          }

          const isTranslationRequired = Boolean(parsedJson.isTranslationRequired);
          const translation =
            isTranslationRequired && parsedJson.translation
              ? stripArtifacts(String(parsedJson.translation))
              : null;

          const newTurn = {
            id: crypto.randomUUID(),
            userPrompt: stripArtifacts(userPrompt),
            assistantReply: assistantReply || "Let's continue practicing.",
            isTranslationRequired,
            translation,
            contextCard: parsedJson.contextCard ?? null,
            action: parsedJson.action ?? null,
            createdAt: new Date().toISOString(),
          };

          const profileId = await getOrCreateProfileId(userId);
          const existingSession = await prisma.spriteSession.findUnique({
            where: { id: sessionId },
          });

          const existingTurns = Array.isArray(existingSession?.turns)
            ? (existingSession.turns as any[])
            : [];

          const alreadySaved = existingTurns.some(
            (t: any) =>
              t.userPrompt === newTurn.userPrompt &&
              t.assistantReply === newTurn.assistantReply
          );

          if (!alreadySaved) {
            const updatedTurns = [...existingTurns, newTurn];
            const autoTitle =
              existingSession?.title && existingSession.title !== "New Session"
                ? existingSession.title
                : String(userPrompt || currentLessonTitle).slice(0, 48);

            await prisma.spriteSession.upsert({
              where: { id: sessionId },
              create: {
                id: sessionId,
                spriteProfileId: profileId,
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
        } catch (err) {
          console.error("[Chat onFinish Save Error]:", err);
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