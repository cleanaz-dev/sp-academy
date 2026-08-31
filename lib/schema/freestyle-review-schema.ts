import { z } from "zod";

// Individual mistake — strict shape so frontend components don't crash
export const FreestyleMistakeSchema = z.object({
  type: z.enum(["grammar", "vocabulary", "pronunciation", "fluency"]),
  severity: z.enum(["minor", "major", "critical"]),
  original: z.string().min(1),
  correction: z.string().min(1),
  explanation: z.string().min(1),
  context: z.string().optional(),
});

// Metrics — now includes fluencyScore
export const FreestyleMetricsSchema = z.object({
  overallScore: z.number().min(0).max(100),
  grammarScore: z.number().min(0).max(100),
  vocabScore: z.number().min(0).max(100),
  pronunciationScore: z.number().min(0).max(100).nullable(),
  fluencyScore: z.number().min(0).max(100),
});

// overallFeedback is now an object, not a string
export const FreestyleOverallFeedbackSchema = z.object({
  summary: z.string().min(1),
  strengths: z.array(z.string()).max(3),
  focusAreas: z.array(z.string()).max(3),
  encouragement: z.string().min(1),
});

// The review data itself
export const FreestyleReviewDataSchema = z.object({
  metrics: FreestyleMetricsSchema,
  mistakes: z.array(FreestyleMistakeSchema).max(5),
  overallFeedback: FreestyleOverallFeedbackSchema,
});

// Main webhook payload from Lambda
export const FreestyleReviewWebhookSchema = z.object({
  taskId: z.string(),
  sessionId: z.string(),
  status: z.enum(["SUCCESS", "FAILED"]),
  error: z.string().optional(),
  review: FreestyleReviewDataSchema.optional(),
});

// Types
export type FreestyleReviewWebhookPayload = z.infer<typeof FreestyleReviewWebhookSchema>;
export type FreestyleReviewData = z.infer<typeof FreestyleReviewDataSchema>;
export type FreestyleMistake = z.infer<typeof FreestyleMistakeSchema>;
export type FreestyleMetrics = z.infer<typeof FreestyleMetricsSchema>;
export type FreestyleOverallFeedback = z.infer<typeof FreestyleOverallFeedbackSchema>;