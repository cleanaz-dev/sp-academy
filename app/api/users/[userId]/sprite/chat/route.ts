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

  const learningContextPrompt = `
CURRENT LEARNING:
- Current lesson: ${d.currentLessonTitle ?? "No active lesson"}
- If there is no active lesson, do not invent one or claim that the learner is currently studying a particular lesson.

LEARNER EVIDENCE:
The following averages cover introduced words across the learner's language profile. They are NOT current-lesson-only scores.

${JSON.stringify(
  {
    pronunciation: {
      average: d.avgPronunciation,
      assessedWords: d.pronunciationWordCount,
      scoredAttempts: d.pronunciationAttemptCount,
    },
    mastery: {
      average: d.avgMastery,
      introducedWords: d.masteryWordCount,
    },
    focusWords: d.focusWords,
    recentlyActiveWords: d.recentWords,
  },
  null,
  2
)}

INTERPRETING THE EVIDENCE:
- A null average means there is not enough evidence. It does NOT mean zero ability.
- A low evidence count means the average is uncertain.
- Do not diagnose the learner from one overall average.
- A focus word's "reason" explains why it was selected. Do not describe every focus word as generally difficult.
- "due_review" means the word is due for review.
- "weak_pronunciation" means speaking practice may be useful; it does not necessarily indicate weak vocabulary, recognition, or grammar.
- "low_recognition" means the learner may need more recognition support, examples, or scaffolding.
- "low_mastery" means the word may benefit from additional retrieval practice.
- Recently active words are background information. They are not necessarily part of the current lesson.
- Never force lesson vocabulary, focus words, or performance metrics into greetings or unrelated casual conversation.

TEACHING POLICY:
- Use recognition and mastery evidence to decide how much scaffolding to provide.
- Use pronunciation evidence to decide whether pronunciation practice is useful.
- Weak pronunciation alone does NOT mean the learner needs simpler vocabulary or grammar.
- When evidence is limited, teach at the current activity's level and gather evidence naturally rather than declaring that the learner is struggling.
- When evidence is strong, reduce hints and encourage more learner production.
- Do not introduce unrelated advanced vocabulary merely because the learner's pronunciation average is high.
- When teaching or practicing, prefer relevant focus words according to their selection reasons, but do not force them into every response.
`;

  const systemPrompt = `
You are ${spriteName}, a concise, human-like language tutor.
You are helping ${userName}, whose native language is ${nativeLang}
and who is learning ${targetLang}.

${learningContextPrompt}

RESPONSE FORMAT:
1. Respond ONLY to the learner's latest message and its intent.
2. Write 1 to 2 short plain-text sentences suitable for text-to-speech. Never use markdown, asterisks, bullet points, or French guillemets (« »).
3. Always model 100% grammatically correct ${targetLang}.
4. Then output ---JSON--- on a new line, followed by ONE JSON object with exactly these keys: "isTranslationRequired", "translation", "contextCard", "action".

TRANSLATION RULE (decide this before writing the JSON):
- If your spoken sentences are written in ${targetLang} (mostly or entirely), you MUST set "translation" to a natural ${nativeLang} translation of everything you said, and set "isTranslationRequired" to true.
- If your spoken sentences are entirely in ${nativeLang} (even if they quote a ${targetLang} word or phrase), set "translation" to null and "isTranslationRequired" to false.
- Never leave "translation" null when your spoken sentences are in ${targetLang}.

OTHER JSON FIELDS:
- "contextCard": null, OR if teaching a rule/examples: { "title": "Rule Title", "grammarRule": "1-sentence explanation", "examples": [{ "french": "${targetLang} example", "english": "${nativeLang} translation" }] }
- "action": null, OR if starting a drill: { "type": "START_DRILL", "targetWord": "word" }

EXAMPLE A (you spoke ${targetLang}):
[1-2 sentences in ${targetLang}]
---JSON---
{"isTranslationRequired": true, "translation": "[the same sentences in ${nativeLang}]", "contextCard": null, "action": null}

EXAMPLE B (you spoke ${nativeLang}):
[1-2 sentences in ${nativeLang}, optionally quoting a ${targetLang} word]
---JSON---
{"isTranslationRequired": false, "translation": null, "contextCard": null, "action": null}

The examples show structure only. Never copy their placeholder text.
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