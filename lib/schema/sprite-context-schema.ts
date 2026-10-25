import { z } from "zod";

export const SpriteContextSchema = z.object({
  userName: z.string().default("Student"),
  currentLessonTitle: z.string().default("Basics"),
  topWord: z.string().nullable(),
  recentWords: z.array(z.string()).default([]),
  avgPronunciation: z.number().min(0).max(100).default(0),
  avgMastery: z.number().min(0).max(100).default(0),
  lastUpdated: z.string().datetime(), // good for knowing how fresh the data is
});

export type SpriteAIContext = z.infer<typeof SpriteContextSchema>;