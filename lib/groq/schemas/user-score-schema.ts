import { z } from 'zod';

const scoringSchema = z.object({
  score: z
    .number()
    .min(1)
    .max(10)
    .describe("Score from 1-10 based on relevance, grammar, and vocabulary usage"),
  label: z
    .enum(["Poor", "OK", "Good", "Great", "Excellent"])
    .describe("Overall performance label"),
  // explanation: z
  //   .string()
  //   .min(1)
  //   .describe("Brief explanation of the score"),
  improvedResponse: z
    .string()
    .nullable()
    .describe("Improved version of the response, or null if no improvement needed"),
  // corrections: z.object({
  //   genderAgreement: z.object({
  //     original: z.string().nullable(),
  //     corrected: z.string().nullable(),
  //     reason: z.string().nullable()
  //   }).describe("Gender agreement corrections"),
  //   vocabulary: z.object({
  //     original: z.string().nullable(),
  //     corrected: z.string().nullable(),
  //     reason: z.string().nullable()
  //   }).describe("Vocabulary corrections"),
  //   article: z.object({
  //     original: z.string().nullable(),
  //     corrected: z.string().nullable(),
  //     reason: z.string().nullable()
  //   }).describe("Article corrections")
  // }).describe("Detailed corrections by category")
});

const responseSchema = z.toJSONSchema(scoringSchema);
delete responseSchema.$schema;

export const userScoreSchema = responseSchema;