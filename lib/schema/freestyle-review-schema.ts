import { z } from "zod";

// Flexible schema for mistakes since LLM output might vary slightly.
// z.record() requires an explicit key schema in Zod v4 — the old
// single-argument form (z.record(z.unknown())) was removed, not just
// deprecated, and silently throws at parse time for non-empty objects.
export const FreestyleMistakeSchema = z.record(z.string(), z.unknown());

export const FreestyleMetricsSchema = z
  .object({
    pronunciationScore: z.number().min(0).max(100).optional(),
    grammarScore: z.number().min(0).max(100).optional(),
    vocabScore: z.number().min(0).max(100).optional(),
    overallScore: z.number().min(0).max(100).optional(),
  })
  .loose(); // Allows extra fields if the LLM adds them (replaces deprecated .passthrough())

export const FreestyleReviewDataSchema = z.object({
  mistakes: z.array(FreestyleMistakeSchema).default([]),
  overallFeedback: z.string().nullable().optional(),
  metrics: FreestyleMetricsSchema.optional(),
});

// The main payload expected from the Python Lambda
export const FreestyleReviewWebhookSchema = z.object({
  taskId: z.string(),
  sessionId: z.string(),
  status: z.enum(["SUCCESS", "FAILED"]),
  error: z.string().optional(),
  review: FreestyleReviewDataSchema.optional(),
});

// Export inferred types for TypeScript support
export type FreestyleReviewWebhookPayload = z.infer<typeof FreestyleReviewWebhookSchema>;
export type FreestyleReviewData = z.infer<typeof FreestyleReviewDataSchema>;