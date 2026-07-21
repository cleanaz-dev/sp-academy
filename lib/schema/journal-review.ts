import { z } from "zod";

export const WordAnalysisSchema = z.object({
  word: z.string(),
  accuracyScore: z.number(),
  errorType: z.enum(["None", "Omission", "Insertion", "Mispronunciation"]),
  phonemes: z
    .array(
      z.object({
        phoneme: z.string(),
        accuracyScore: z.number(),
      })
    )
    .optional(),
});

export const JournalAnalysisWebhookSchema = z.object({
  taskId: z.string(),
  journalId: z.string(),
  status: z.enum(["SUCCESS", "FAILED"]),
  errorMessage: z.string().optional(),
  
  // Results populated on SUCCESS
  review: z
    .object({
      overallScore: z.number(),
      accuracyScore: z.number(),
      fluencyScore: z.number(),
      completenessScore: z.number(),
      prosodyScore: z.number().optional(),
      wordAnalysis: z.array(WordAnalysisSchema),
      summaryFeedback: z.string().optional(),
    })
    .optional(),
});

export type JournalAnalysisPayload = z.infer<typeof JournalAnalysisWebhookSchema>;