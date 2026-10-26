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
import { getOrCreateProfileId } from "../sessions/route";
// NOTE: adjust this import path to wherever SpriteContextSchema lives
import { SpriteContextSchema } from "@/lib/schema/sprite-schema";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_LLM = "qwen/qwen3.8-27b";

function clean(value: unknown, fallback: string, max = 100) {
  if (typeof value !== "string") return fallback;
  return value.replace(/[\r\n"]/g, " ").trim().slice(0, max) || fallback;
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
        .filter(
          (p): p is Extract<typeof p, { type: "text" }> => p.type === "text"
        )
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
    return NextResponse.json(
      { error: "messages must be an array" },
      { status: 400 }
    );
  }

  const messages: UIMessage[] = body.messages;

  const sessionId =
    typeof body.sessionId === "string" && body.sessionId.trim()
      ? body.sessionId.trim()
      : undefined;

  const rawSpriteName = clean(body.spriteName, "Vox");
  const spriteName =
    rawSpriteName.charAt(0).toUpperCase() +
    rawSpriteName.slice(1).toLowerCase();

  // Validate the dossier instead of trusting it blindly
  const contextResult = SpriteContextSchema.safeParse(body.dossier);
  if (!contextResult.success) {
    return NextResponse.json(
      {
        error:
          "Sprite context is missing or outdated. Recompute it before chatting.",
        code: "SPRITE_CONTEXT_REFRESH_REQUIRED",
      },
      { status: 409 }
    );
  }

  const d = contextResult.data;

  const userName = clean(d.userName, "Student");
  const nativeLang = clean(d.nativeLang, "English");
  const targetLang = clean(d.targetLang, "French");
  const currentLessonTitle = d.currentLessonTitle ?? "General practice";

  const evidence = JSON.stringify({
    pronunciation: {
      avg: d.avgPronunciation,
      words: d.pronunciationWordCount,
      attempts: d.pronunciationAttemptCount,
    },
    mastery: { avg: d.avgMastery, words: d.masteryWordCount },
    focusWords: d.focusWords,
    recentWords: d.recentWords,
  });

  const learningContextPrompt = `
LESSON: ${d.currentLessonTitle ?? "none"}. If none, don't invent or imply an active lesson.

EVIDENCE (profile-wide averages over introduced words, NOT current-lesson scores):
${evidence}

READING THE EVIDENCE:
- A null average means not enough data, not zero ability. Low counts mean an uncertain average.
- Never diagnose the learner from one overall average.
- A focus word's "reason" is why it was picked, not proof it's generally hard:
  due_review = due for review; weak_pronunciation = speaking practice may help (not necessarily weak vocab/grammar);
  low_recognition = give more examples/scaffolding; low_mastery = more retrieval practice.
- recentWords are background, not necessarily the current lesson.

TEACHING POLICY:
- Scale scaffolding by recognition/mastery. Suggest pronunciation practice based on pronunciation evidence.
- Weak pronunciation alone never means simpler vocab or grammar; strong pronunciation never means advanced vocab.
- Limited evidence: teach at the activity's level and gather evidence naturally; don't say the learner is struggling.
  Strong evidence: fewer hints, more learner production.
- When teaching/practicing, prefer focus words per their reasons. Never force words or metrics into greetings or casual chat.
`;

  const systemPrompt = `
You are ${spriteName}, a concise, human-like tutor helping ${userName} (native: ${nativeLang}, learning: ${targetLang}).

${learningContextPrompt}

FORMAT:
1. Answer only the learner's latest message and its intent.
2. 1-2 short plain-text sentences for text-to-speech: no markdown, asterisks, bullets, or « ».
3. All ${targetLang} must be 100% grammatically correct.
4. Then "---JSON---" on a new line, then ONE JSON object with exactly: isTranslationRequired, translation, contextCard, action.

TRANSLATION (decide before writing the JSON):
- Spoken text mostly/entirely ${targetLang}: translation = natural ${nativeLang} translation of everything, isTranslationRequired = true. Never null here.
- Spoken text entirely ${nativeLang} (even if quoting a ${targetLang} word): translation = null, isTranslationRequired = false.

JSON FIELDS:
- contextCard: null, or when teaching a rule: {"title": "...", "grammarRule": "1 sentence", "examples": [{"french": "${targetLang} example", "english": "${nativeLang} translation"}]}
- action: null, or to start a drill: {"type": "START_DRILL", "targetWord": "word"}

Structure examples (never copy placeholder text):
A: <1-2 sentences in ${targetLang}>
---JSON---
{"isTranslationRequired":true,"translation":"<same in ${nativeLang}>","contextCard":null,"action":null}
B: <1-2 sentences in ${nativeLang}>
---JSON---
{"isTranslationRequired":false,"translation":null,"contextCard":null,"action":null}
`;

  try {
    const userPrompt = getLastUserText(messages);

    const result = streamText({
      model: groq(GROQ_LLM),
      instructions: systemPrompt,
      reasoning: "low",
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
              const cleanedJson = rawJson
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

              const parsed = JSON.parse(cleanedJson);

              parsedJson =
                parsed && typeof parsed === "object" ? parsed : {};
            } catch {
              parsedJson = {};
            }
          }

          // A non-empty translation IS the signal; don't depend on the model's boolean
          const translation = parsedJson.translation
            ? stripArtifacts(String(parsedJson.translation))
            : null;

          const isTranslationRequired = Boolean(translation);

          const newTurn = {
            id: crypto.randomUUID(),
            userPrompt: stripArtifacts(userPrompt),
            assistantReply:
              assistantReply || "Let's continue practicing.",
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
            (turn: any) =>
              turn.userPrompt === newTurn.userPrompt &&
              turn.assistantReply === newTurn.assistantReply
          );

          if (alreadySaved) return;

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
        } catch (error) {
          console.error("[Chat onFinish Save Error]:", error);
        }
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error("Groq chat error:", error);

    return NextResponse.json({ error: "AI service error" }, { status: 502 });
  }
}