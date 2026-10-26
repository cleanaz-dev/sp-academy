// lib/schema/sprite-schema.ts
import { z } from "zod";

// 1. Pre-computed AI Brain Context (Stored on SpriteProfile.context)
export const SpriteContextSchema = z.object({
  userName: z.string().default("Student"),
  currentLessonTitle: z.string().default("Basics"),
  topWord: z.string().nullable(),
  recentWords: z.array(z.string()).default([]),
  avgPronunciation: z.number().min(0).max(100).default(0),
  avgMastery: z.number().min(0).max(100).default(0),
  lastUpdated: z.string().datetime(),
});

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

// Export inferred TypeScript types
export type SpriteAIContext = z.infer<typeof SpriteContextSchema>;
export type ContextCardData = z.infer<typeof ContextCardSchema>;
export type ProgressReportResult = z.infer<typeof ProgressReportResultSchema>;
export type SpriteAction = z.infer<typeof SpriteActionSchema>;
export type SpriteTurn = z.infer<typeof SpriteTurnSchema>;
export type SpriteSessionData = z.infer<typeof SpriteSessionSchema>;