// lib/schema/sprite-exercise-schema.ts
import { z } from "zod";

// ROUND 1: 2x2 Pruna 3D Visual Match Grid
export const VisualMatchCardSchema = z.object({
  id: z.string(),
  word: z.string(),            // Target language word/phrase (e.g., "J'ai soif")
  translation: z.string(),     // Native gloss (e.g., "I am thirsty")
  imageS3Key: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  audioS3Key: z.string().optional().nullable(),
  audioUrl: z.string().optional().nullable(),
});

export const VisualMatchRoundSchema = z.object({
  type: z.literal("visual_match"),
  title: z.string().default("Visual Match"),
  instruction: z.string().default("Match each phrase to its 3D scene"),
  cards: z.array(VisualMatchCardSchema).min(2).max(4),
});

// ROUND 2: Binary Sentence Dash (2-Choice Per Slot Trap Builder)
export const BinaryForkSlotSchema = z.object({
  correct: z.string(), // e.g., "fatigué"
  trap: z.string(),    // e.g., "fatigue"
  whyTrap: z.string().optional().nullable(), // Short tip if they tap the trap
});

export const BinarySentenceItemSchema = z.object({
  id: z.string(),
  promptNative: z.string(), // e.g., "I was tired yesterday."
  fullTarget: z.string(),   // e.g., "Hier, j'étais fatigué."
  audioS3Key: z.string().optional().nullable(),
  audioUrl: z.string().optional().nullable(),
  forks: z.array(BinaryForkSlotSchema).min(2).max(6),
});

export const BinarySentenceDashRoundSchema = z.object({
  type: z.literal("binary_sentence_dash"),
  title: z.string().default("Sentence Dash"),
  instruction: z.string().default("Pick the right block at each step"),
  items: z.array(BinarySentenceItemSchema).min(1).max(3),
});

// ROUND 3: 3-Rep Speech Burst (Overcharge the Energy Core!)
export const SpeechBurstRoundSchema = z.object({
  type: z.literal("speech_burst"),
  title: z.string().default("3x Voice Overcharge"),
  instruction: z
    .string()
    .default("Say the target phrase 3 times to shatter the shield and earn +1 ⚡!"),
  targetPhrase: z.string(),
  translation: z.string(),
  phoneticHint: z.string().optional().nullable(),
  audioS3Key: z.string().optional().nullable(),
  audioUrl: z.string().optional().nullable(),
  requiredReps: z.number().int().min(2).max(4).default(3),
});

export const SpriteExerciseContentSchema = z.object({
  visualMatch: VisualMatchRoundSchema,
  sentenceDash: BinarySentenceDashRoundSchema,
  speechBurst: SpeechBurstRoundSchema,
});

export const SpriteExerciseWebhookSchema = z.object({
  exerciseId: z.string(),
  userId: z.string(),
  courseId: z.string().nullable().optional(),
  title: z.string().optional(),
  content: SpriteExerciseContentSchema,
});

export type VisualMatchCard = z.infer<typeof VisualMatchCardSchema>;
export type BinarySentenceItem = z.infer<typeof BinarySentenceItemSchema>;
export type SpriteExerciseContent = z.infer<typeof SpriteExerciseContentSchema>;