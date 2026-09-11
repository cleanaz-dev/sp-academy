// foundation/contracts.ts
// ─────────────────────────────────────────────────────────────────────────────
// FOUNDATION LESSON PAYLOAD CONTRACTS
// These are the handshake between the Python lambda builders and Next.js.
// The planner prompt must produce exactly these shapes (enforce via Pydantic
// on the Python side — mirror of these schemas). Components render ONLY
// what is typed here. Nothing display-only, every interactive item graded
// against shipped answer keys.
// ─────────────────────────────────────────────────────────────────────────────
import { z } from "zod";

// ── Shared primitives ────────────────────────────────────────────────────────

export const ClozeItemSchema = z.object({
  id: z.string(),                          // stable item id (skillMastery / later spacing)
  hostSentence: z.string(),                // full sentence, blank marked by "___"
  blankPosition: z.number().int().nonnegative(), // word index of the blank
  acceptableAnswers: z.array(z.string()).min(1),
  wrongAnswerFeedback: z.array(
    z.object({
      wrong: z.string(),                   // the anticipated wrong answer
      feedback: z.string(),                // ONE line, actionable
    })
  ).max(2),
});
export type ClozeItem = z.infer<typeof ClozeItemSchema>;

// ── 1. GRAMMAR (Inspect + Complete) ──────────────────────────────────────────
// The "lesson" is: learner dismantles the sentence, then produces the chunk.

export const WordGlossSchema = z.object({
  word: z.string(),            // exact substring of targetSentence
  gloss: z.string(),           // meaning in native language
  role: z.string(),            // e.g. "subject", "verb", "object", "connector"
});

export const GrammarContentSchema = z.object({
  targetSentence: z.string(),
  nativeSentence: z.string(),  // natural translation, not word-for-word
  words: z.array(WordGlossSchema),
  highlightGroup: z.array(z.string()), // words forming the day's chunk — UI highlights these
  clozeItems: z.array(ClozeItemSchema).min(1).max(3),
});
export type GrammarContent = z.infer<typeof GrammarContentSchema>;

// ── 2. PRONUNCIATION (Shadow & Compare) ─────────────────────────────────────
// Data FOR the shadowing task — never descriptions of tongues/mouths.

export const FocusSoundSchema = z.object({
  sound: z.string(),                        // e.g. "rr" — the phoneme label
  positions: z.array(z.number().int().nonnegative()), // char offsets in referenceText
});

export const PronunciationDataSchema = z.object({
  referenceText: z.string(),                // rendered to TTS at build time
  audioS3Key: z.string(),                   // Fish Audio / Azure output
  focusSounds: z.array(FocusSoundSchema).min(1),
  // Scoring targets for Azure pronunciation assessment, per attempt.
  // The component shows the score per focusSound; no pass/fail gate.
});
export type PronunciationData = z.infer<typeof PronunciationDataSchema>;

// ── 3. LISTENING (Hear & Pick) ───────────────────────────────────────────────

export const ListeningContentSchema = z.object({
  id: z.string(),
  referenceText: z.string(),                // what Fish Audio actually says
  audioS3Key: z.string(),
  options: z.array(z.string()).min(3).max(4),
  correctIndex: z.number().int().nonnegative(),
  contrast: z.string(),                     // what this item discriminates, e.g. "rr vs r"
});
export type ListeningContent = z.infer<typeof ListeningContentSchema>;

// ── 4. VISUAL (Respond scene) ────────────────────────────────────────────────
// v1 presents the scene + NPC line. The constraint is already here so v1.5
// can grade replies without regenerating anything.

export const VisualContentSchema = z.object({
  imageS3Key: z.string(),
  sceneDescription: z.string(),             // one sentence, native language
  altText: z.string(),
  npcLine: z.string(),                      // what the character says (audio + optional text)
  constraint: z.object({
    requiredChunk: z.string(),              // a natural reply MUST use this
    validReplies: z.array(z.string()).min(1),
  }),
});
export type VisualContent = z.infer<typeof VisualContentSchema>;

// ── 5. QUIZ (same-day review for v1 — no scheduling yet) ────────────────────

export const QuizItemSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("cloze"),
    cloze: ClozeItemSchema,
  }),
  z.object({
    type: z.literal("listening"),
    listening: ListeningContentSchema.pick({
      id: true, referenceText: true, audioS3Key: true, options: true, correctIndex: true,
    }),
  }),
]);

export const QuizContentSchema = z.object({
  items: z.array(QuizItemSchema).min(3),
  passThreshold: z.number().min(0).max(1).default(0.7), // advisory, not gating in v1
});
export type QuizContent = z.infer<typeof QuizContentSchema>;

// ── 6. FREESTYLE CONFIG (plugs into your existing freestyle engine) ─────────
// Mirrors FreestyleMode / FreestyleLevel enums in your Prisma schema.

export const FreestyleModeSchema = z.enum(["INTRODUCTION", "SPECIFIC", "RANDOM", "ARGUMENTATIVE"]);
export const FreestyleLevelSchema = z.enum(["ZERO", "EASY", "MEDIUM", "FLUENT"]);

export const FreestyleConfigSchema = z.object({
  mode: FreestyleModeSchema,
  level: FreestyleLevelSchema,
  topic: z.string(),                        // matches the lesson theme
  persona: z.string(),                      // who the AI plays (e.g. "Madrid café waiter")
  requiredChunks: z.array(z.string()).min(1), // chunks the conversation MUST surface
  openingLine: z.string(),                  // native language, what the AI says first
});
export type FreestyleConfig = z.infer<typeof FreestyleConfigSchema>;

// ── TOP-LEVEL: what one daily lesson build must return ──────────────────────

export const FoundationLessonPayloadSchema = z.object({
  day: z.number().int().positive(),
  theme: z.string(),
  targetChunks: z.array(z.string()).min(1), // skillMastery keys track these

  grammar: GrammarContentSchema,
  pronunciation: PronunciationDataSchema,
  listening: ListeningContentSchema,
  visual: VisualContentSchema,
  quiz: QuizContentSchema,
  freestyle: FreestyleConfigSchema,
});
export type FoundationLessonPayload = z.infer<typeof FoundationLessonPayloadSchema>;

export const FoundationLessonHandoffSchema = z.object({
  day: z.number().int().positive(),
  theme: z.string(),
  targetChunks: z.array(z.string()).min(1), // skillMastery keys track these

  grammar: GrammarContentSchema,
  pronunciation: PronunciationDataSchema,
  listening: ListeningContentSchema,
  visual: VisualContentSchema,
  quiz: QuizContentSchema,
  freestyle: FreestyleConfigSchema,

  // The following are for the next lesson's build to know what was already done:
  previous_lessons: z.array(z.object({
    day: z.number().int().positive(),
    theme: z.string(),
    targetSentence: z.string(),
    chunks: z.array(z.string()).min(1),
    npcLine: z.string(),
    freestyleTopic: z.string(),
  })).min(1),
});
export type FoundationLessonHandoff = z.infer<typeof FoundationLessonHandoffSchema>;