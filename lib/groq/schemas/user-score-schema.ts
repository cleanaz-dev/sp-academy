import { z } from 'zod';

const scoringSchema = z.object({
  score: z.number().min(1).max(10),
  label: z.enum(["Poor", "OK", "Good", "Great", "Excellent"]),
  explanation: z.string().min(1).optional(), // 🔥 UNCOMMENT
  improvedResponse: z.string().nullable(),
  corrections: z.object({  // 🔥 UNCOMMENT ALL THIS
    genderAgreement: z.object({
      original: z.string().nullable(),
      corrected: z.string().nullable(),
      reason: z.string().nullable()
    }).optional(),
    vocabulary: z.object({
      original: z.string().nullable(),
      corrected: z.string().nullable(),
      reason: z.string().nullable()
    }).optional(),
    article: z.object({
      original: z.string().nullable(),
      corrected: z.string().nullable(),
      reason: z.string().nullable()
    }).optional()
  }).optional()
});
const responseSchema = z.toJSONSchema(scoringSchema);
delete responseSchema.$schema;

export const userScoreSchema = responseSchema;