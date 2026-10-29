// lib/schema/sprite-schema.ts
import { z } from "zod";

// 2. Context Card Schema (Rendered inside a 1-to-1 turn)
export const ContextCardSchema = z.object({
  title: z.string(),
  grammarRule: z.string(),
  examples: z.array(
    z.object({
      french: z.string(),
      english: z.string(),
    })
  ),
});

// 3. Progress Report Result Schema (Returned by `spoon-sprite-report` Lambda via SystemTask)
export const ProgressReportResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  focusAreas: z.array(z.string()),
  recommendedWords: z.array(z.string()).optional(),
});

// 4. Action Payload Schema
export const SpriteActionSchema = z.object({
  type: z.enum(["START_DRILL", "PROGRESS_REPORT", "BOOKMARK_WORD"]),
  targetWord: z.string().optional(),
  systemTaskId: z.string().optional(), // Links to your existing SystemTask when a Lambda is invoked
});

// 5. Single 1-to-1 Turn inside a SpriteSession (Stored in SpriteSession.turns JSON)
export const SpriteTurnSchema = z.object({
  id: z.string(),
  userPrompt: z.string(),
  assistantReply: z.string(),
  translation: z.string().nullable().optional(), // <-- add this line
  contextCard: ContextCardSchema.nullable().optional(),
  progressReport: ProgressReportResultSchema.nullable().optional(),
  action: SpriteActionSchema.nullable().optional(),
  createdAt: z.string(),
});
export const SpriteSessionTurnsSchema = z.array(SpriteTurnSchema);

// 6. Full SpriteSession Payload Schema (For API responses / History list)
export const SpriteSessionSchema = z.object({
  id: z.string(),
  spriteProfileId: z.string(),
  title: z.string(),
  lessonTitle: z.string().nullable().optional(),
  turns: SpriteSessionTurnsSchema.default([]),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export const SpriteFocusWordSchema = z.object({
  word: z.string(),
  translation: z.string().nullable(),

  reason: z.enum([
    "due_review",
    "weak_pronunciation",
    "low_recognition",
    "low_mastery",
  ]),

  masteryScore: z.number().min(0).max(100),

  // Percentages; null means insufficient evidence.
  recognitionAccuracy: z.number().int().min(0).max(100).nullable(),
  pronunciationAverage: z.number().int().min(0).max(100).nullable(),

  spokenAttempts: z.number().int().nonnegative(),
});

export const SpriteContextSchema = z.object({
  version: z.literal(2),

  userName: z.string(),
  nativeLang: z.string(),
  targetLang: z.string(),

  courseId: z.string().nullable(),
  currentLessonId: z.string().nullable(),
  currentLessonTitle: z.string().nullable(),

  // Null means unknown—not zero ability.
  avgPronunciation: z.number().int().min(0).max(100).nullable(),
  pronunciationWordCount: z.number().int().nonnegative(),
  pronunciationAttemptCount: z.number().int().nonnegative(),

  avgMastery: z.number().int().min(0).max(100).nullable(),
  masteryWordCount: z.number().int().nonnegative(),

  focusWords: z.array(SpriteFocusWordSchema),

  // Recently active across the language profile, not necessarily this lesson.
  recentWords: z.array(z.string()),

  lastUpdated: z.string().datetime(),
});

export const ChalkboardItemSchema = z.object({
  label: z.string(), // e.g., "Contraction" | "Watch Out" | "Stat" | "Pattern"
  target: z.string(), // e.g., "J'ai faim / l'eau" or "58% Pronunciation"
  detail: z.string(), // e.g., "Always drop the vowel before a vowel sound"
  correctionFrom: z.string().nullable().optional(), // e.g., "Jai faim" (renders crossed-out -> target)
});

export const ChalkboardSchema = z.object({
  title: z.string(), // e.g., "Progress Snapshot" or "Contractions & Endings"
  mode: z.enum(["lesson_notes", "correction", "progress_snapshot"]).default("lesson_notes"),
  items: z.array(ChalkboardItemSchema).min(1).max(4),
  takeaway: z.string().nullable().optional(), // 1-line bottom summary on the board
});

export type ChalkboardData = z.infer<typeof ChalkboardSchema>;

export type SpriteFocusWord = z.infer<typeof SpriteFocusWordSchema>;


// Export inferred TypeScript types
export type SpriteAIContext = z.infer<typeof SpriteContextSchema>;
export type ContextCardData = z.infer<typeof ContextCardSchema>;
export type ProgressReportResult = z.infer<typeof ProgressReportResultSchema>;
export type SpriteAction = z.infer<typeof SpriteActionSchema>;
export type SpriteTurn = z.infer<typeof SpriteTurnSchema>;
export type SpriteSessionData = z.infer<typeof SpriteSessionSchema>;

