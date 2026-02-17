import { z } from 'zod';

// Helper for the inner objects to keep code clean
const correctionItem = z.object({
  original: z.string().nullable(),
  corrected: z.string().nullable(),
  reason: z.string().nullable()
}).nullable(); // The item itself can be null

const scoringSchema = z.object({
  score: z.number().min(1).max(10),
  label: z.enum(["Poor", "OK", "Good", "Great", "Excellent"]),
  
  // FIX 1: Change .optional() to .nullable()
  // The AI must return "explanation": null if not needed, instead of omitting the key.
  explanation: z.string().nullable(), 
  
  improvedResponse: z.string().nullable(),
  
  // FIX 2: The object structure must be explicit.
  // Every key inside 'corrections' MUST be listed here and match the required array.
  corrections: z.object({
    genderAgreement: correctionItem,
    vocabulary: correctionItem,
    article: correctionItem
  }).nullable() // The entire corrections object can be null
});

// Assuming you have the environment set up for z.toJSONSchema 
// (or are using a library that monkey-patches it like zod-to-json-schema)
const responseSchema = z.toJSONSchema(scoringSchema);

// Clean up standard JSON schema stuff that Groq/OpenAI sometimes dislikes
if (responseSchema && typeof responseSchema === 'object') {
  delete (responseSchema as any).$schema;
  // Ensure additionalProperties is false for Strict Mode compliance
  (responseSchema as any).additionalProperties = false;
}

export const userScoreSchema = responseSchema;