// app/api/users/[userId]/sprite/chat/route.ts
import { NextResponse } from "next/server";
import { isUser } from "@/lib/auth-guard";
import {
  streamText,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { createGroq } from "@ai-sdk/groq";

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
2. Always model 100% grammatically correct ${targetLang}. Never tell the learner to say a grammatically incorrect phrase.
3. NEVER use French guillemets (« or »). Use standard single quotes (') or double quotes (").
4. No markdown, asterisks, bullet points, or emojis in the spoken sentences.
5. After your spoken response, if AND ONLY IF you spoke in ${targetLang} (requiring a translation), OR if you need to show a grammar card / trigger an action, output ---JSON--- on a new line followed by a valid JSON object:
---JSON---
{
  "translation": "ONLY include this if your spoken response above was in ${targetLang}. If your spoken response was already in ${nativeLang}, set this to null!",
  "contextCard": {
    "title": "Short rule or word title",
    "grammarRule": "Simple 1-sentence explanation in ${nativeLang}",
    "examples": [
      { "french": "Correct example in ${targetLang}", "english": "Translation in ${nativeLang}" }
    ]
  },
  "action": {
    "type": "START_DRILL",
    "targetWord": "word being practiced"
  }
}
6. CRITICAL TRANSLATION RULE: If your spoken response is already in ${nativeLang} (even if it quotes 1 or 2 ${targetLang} words), set "translation": null. Only provide a "translation" string when your spoken response is written in ${targetLang}.
7. Only include "contextCard" when teaching a grammar rule or giving examples. Only include "action" (type must be "START_DRILL", "PROGRESS_REPORT", or "BOOKMARK_WORD") when starting a drill or action.
`;

  try {
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
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (err) {
    console.error("Groq chat error:", err);
    return NextResponse.json({ error: "AI service error" }, { status: 502 });
  }
}