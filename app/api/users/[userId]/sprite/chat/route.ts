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

import {
  SpriteContextSchema,
  ChalkboardSchema,
  BoardFeedbackSchema,
  type ChalkboardData,
} from "@/lib/schema/sprite-schema";
import {
  DossierUnavailableError,
  type DossierV2,
} from "@/lib/sprites/build-dossier";
import { getCachedDossier } from "@/lib/sprites/get-cached-dossier";
import {
  getCachedBoard,
  saveCachedBoard,
  applyStepDecisionToBoard,
} from "@/lib/sprites/board-cache";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_LLM = "qwen/qwen3.8-27b";
const IS_DEV = process.env.NODE_ENV !== "production";

function clean(value: unknown, fallback: string, max = 100) {
  if (typeof value !== "string") return fallback;
  return (
    value
      .replace(/[\r\n"]/g, " ")
      .trim()
      .slice(0, max) || fallback
  );
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
          (p): p is Extract<typeof p, { type: "text" }> => p.type === "text",
        )
        .map((p) => p.text)
        .join("");
    }
  }
  return "";
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const reqId = crypto.randomUUID().slice(0, 8);
  const tag = `[sprite-chat:${reqId}]`;
  const startedAt = Date.now();

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
      { status: 400 },
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

  // 1. Read Dossier from Upstash Redis Cache (or build if cache miss)
  let dossier: DossierV2;
  try {
    dossier = await getCachedDossier(userId);
  } catch (error) {
    if (error instanceof DossierUnavailableError) {
      return NextResponse.json(
        {
          error: "Learning context isn't ready yet.",
          code: "SPRITE_CONTEXT_UNAVAILABLE",
          ...(IS_DEV ? { reason: error.message } : {}),
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to build learning context" },
      { status: 500 },
    );
  }

  const contextResult = SpriteContextSchema.safeParse(dossier);
  if (!contextResult.success) {
    return NextResponse.json(
      { error: "Server-built sprite context is invalid." },
      { status: 500 },
    );
  }

  const d = contextResult.data;
  const userName = clean(d.userName, "Student");
  const nativeLang = clean(d.nativeLang, "English");
  const targetLang = clean(d.targetLang, "French");
  const currentLessonTitle = d.currentLessonTitle ?? "General practice";

  // 2. Check Upstash Redis for an Active Step-Deck Board on this sessionId
  const cachedBoard = await getCachedBoard(sessionId);
  const hasActiveBoard =
    cachedBoard &&
    cachedBoard.status === "IN_PROGRESS" &&
    cachedBoard.steps.length > 0;

  const currentStep = hasActiveBoard
    ? cachedBoard.steps[cachedBoard.currentStepIndex]
    : null;
  const nextStep =
    hasActiveBoard &&
    cachedBoard.currentStepIndex + 1 < cachedBoard.steps.length
      ? cachedBoard.steps[cachedBoard.currentStepIndex + 1]
      : null;

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

  // 3. Build Board-Aware Instructions
  const boardPromptSection = hasActiveBoard
    ? `
ACTIVE CHALKBOARD STEP-DECK IN PROGRESS:
- Board Title: "${cachedBoard.title}"
- Progress: Step ${cachedBoard.currentStepIndex + 1} of ${cachedBoard.steps.length}
- CURRENT STEP ON SCREEN: ${JSON.stringify(currentStep)}
- NEXT STEP UPCOMING: ${nextStep ? JSON.stringify(nextStep) : "FINAL STEP (Board completes after this!)"}

HOW TO HANDLE THIS TURN:
- If the learner answered the CURRENT STEP correctly (or clicked "Next Step" / "Continue"):
  Set "stepDecision": "ADVANCE", praise briefly in 1 sentence, and introduce the NEXT STEP (or congratulate on finishing if no next step).
- If the learner made a spelling/accent/grammar mistake on CURRENT STEP:
  Option A (minor accent like fatigue -> fatigué): Set "stepDecision": "ADVANCE" and include "feedback": {"status":"retry","correctionFrom":"wrong","correctionTo":"right","note":"1 short tip"}.
  Option B (wrong word/meaning): Set "stepDecision": "STAY" so they stay on this step, give a 1-sentence nudge, and include "feedback": {"status":"retry","correctionFrom":"wrong","correctionTo":"right","note":"1 short tip"}.
- Set "newBoard": null unless the learner explicitly asks to switch to a brand-new topic/quiz.
`
    : `
NO ACTIVE CHALKBOARD DECK YET:
- Whenever the learner asks to explain grammar, start a quiz, practice a word, or review their progress, create a 3-to-4 step deck in "newBoard"!
- Each step in "newBoard.steps" gets the ENTIRE screen to itself. Mix step types naturally:
  1. "teach_concept": Big targetPhrase, translation, formula ("Je + ai + soif"), and grammarTip.
  2. "multiple_choice": A clear prompt, 3 options in "options", and "correctAnswer".
  3. "write_response": A translation/fill-blank prompt, optional "hint", and "correctAnswer".
  4. "pronunciation": A speaking prompt with targetPhrase and phonetic/grammarTip.
- In your spoken text (1-2 sentences max), introduce ONLY Step 1!
`;

  const systemPrompt = `
You are ${spriteName}, a concise, human-like tutor helping ${userName} (native: ${nativeLang}, learning: ${targetLang}).
LESSON: ${currentLessonTitle}
EVIDENCE: ${evidence}

${boardPromptSection}

FORMAT:
1. Write 1-2 short plain-text sentences before "---JSON---" (no markdown, bullets, or asterisks).
2. Then "---JSON---" on a new line, followed by ONE JSON object:
{
  "isTranslationRequired": boolean,
  "translation": string | null,
  "stepDecision": "ADVANCE" | "STAY" | "COMPLETE" | null,
  "feedback": {"status": "correct" | "retry", "correctionFrom": string | null, "correctionTo": string | null, "note": string | null} | null,
  "newBoard": {
    "title": "Short Deck Title",
    "takeaway": "1-sentence summary rule",
    "steps": [
      {
        "type": "teach_concept" | "multiple_choice" | "write_response" | "pronunciation",
        "badge": "Concept" | "Quick Quiz" | "Write It" | "Speak It",
        "prompt": "Instruction for this single step",
        "targetPhrase": "${targetLang} focal phrase or null",
        "translation": "${nativeLang} meaning or null",
        "formula": "Block + Block + Block or null",
        "grammarTip": "1-sentence note or null",
        "hint": "Optional clue or null",
        "options": ["opt1", "opt2", "opt3"] | null,
        "correctAnswer": "expected answer or null"
      }
    ]
  } | null
}
`;

  try {
    const userPrompt = getLastUserText(messages);

    // Pre-process fast client step advances: if user clicked "Next Step" on a teach_concept step
    const isManualStepAdvance =
      /^next step/i.test(userPrompt.trim()) ||
      /^got it, next step/i.test(userPrompt.trim());

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
              if (parsed && typeof parsed === "object") parsedJson = parsed;
            } catch {
              parsedJson = {};
            }
          }

          const translation = parsedJson.translation
            ? stripArtifacts(String(parsedJson.translation))
            : null;
          const isTranslationRequired = Boolean(translation);

          // Resolve the updated Chalkboard state in Redis
          let resolvedBoard: ChalkboardData | null = null;

          if (
            parsedJson.newBoard &&
            Array.isArray(parsedJson.newBoard.steps) &&
            parsedJson.newBoard.steps.length > 0
          ) {
            const candidate = ChalkboardSchema.safeParse({
              title: parsedJson.newBoard.title || currentLessonTitle,
              status: "IN_PROGRESS",
              currentStepIndex: 0,
              steps: parsedJson.newBoard.steps,
              takeaway: parsedJson.newBoard.takeaway ?? null,
              lastFeedback: null,
            });
            if (candidate.success) {
              resolvedBoard = await saveCachedBoard(sessionId, candidate.data);
            }
          } else if (hasActiveBoard && cachedBoard) {
            const decision: "ADVANCE" | "STAY" | "COMPLETE" =
              isManualStepAdvance
                ? "ADVANCE"
                : parsedJson.stepDecision === "ADVANCE" ||
                    parsedJson.stepDecision === "COMPLETE"
                  ? parsedJson.stepDecision
                  : "STAY";

            const fbParsed = BoardFeedbackSchema.safeParse(parsedJson.feedback);
            resolvedBoard = await applyStepDecisionToBoard(
              sessionId,
              cachedBoard,
              decision,
              fbParsed.success ? fbParsed.data : null,
              userPrompt, // <--- records the user's exact answer on that step!
            );
          }

          const newTurn = {
            id: crypto.randomUUID(),
            userPrompt: stripArtifacts(userPrompt),
            assistantReply: assistantReply || "Let's continue practicing.",
            isTranslationRequired,
            translation,
            chalkboard: resolvedBoard,
            contextCard: null,
            action: null,
            createdAt: new Date().toISOString(),
          };

          const profileId = await getOrCreateProfileId(userId);
          const existingSession = await prisma.spriteSession.findUnique({
            where: { id: sessionId },
          });

          const existingTurns = Array.isArray(existingSession?.turns)
            ? (existingSession.turns as any[])
            : [];

          const updatedTurns = [...existingTurns, newTurn];
          const autoTitle =
            existingSession?.title && existingSession.title !== "New Session"
              ? existingSession.title
              : String(userPrompt || currentLessonTitle).slice(0, 48);

          const finalBoardToSave =
            resolvedBoard ?? (existingSession?.board as any) ?? null;

          await prisma.spriteSession.upsert({
            where: { id: sessionId },
            create: {
              id: sessionId,
              spriteProfileId: profileId,
              title: autoTitle,
              lessonTitle: currentLessonTitle,
              turns: updatedTurns,
              board: finalBoardToSave, // <--- NEW: saved to SpriteSession.board!
            },
            update: {
              title: autoTitle,
              turns: updatedTurns,
              ...(finalBoardToSave ? { board: finalBoardToSave } : {}), // <--- NEW!
            },
          });

          console.log(`${tag} turn + board saved`, {
            sessionId,
            step: resolvedBoard
              ? `${resolvedBoard.currentStepIndex + 1}/${resolvedBoard.steps.length}`
              : "none",
            status: resolvedBoard?.status ?? null,
          });
        } catch (error) {
          console.error(`${tag} [Chat onFinish Save Error]:`, error);
        }
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error(`${tag} Groq chat error:`, error);
    return NextResponse.json({ error: "AI service error" }, { status: 502 });
  }
}
