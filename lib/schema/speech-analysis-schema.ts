// lib/schema/speech-analysis-schema.ts
import z from "zod";

// 1. Azure Word Analysis
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

// 2. Novita / DeepSeek Grammar Schema
export const GrammarMistakeSchema = z.object({
  original: z.string(),
  correction: z.string(),
  explanation: z.string(),
});

// 3. Novita / DeepSeek Vocabulary Schema
export const VocabularySuggestionSchema = z.object({
  word: z.string(),
  meaning: z.string(),
  example: z.string(),
});

// 4. Main Payload Schema
export const SpeechAnalysisPayloadSchema = z.object({
  taskId: z.string().optional(),
  journalId: z.string().optional(),
  status: z.enum(["SUCCESS", "FAILED"]),
  errorMessage: z.string().optional(),
  
  review: z
    .object({
      // Azure Metrics
      overallScore: z.number(),
      accuracyScore: z.number(),
      fluencyScore: z.number(),
      completenessScore: z.number(),
      prosodyScore: z.number().optional(),
      wordAnalysis: z.array(WordAnalysisSchema),
      
      // Novita / LLM Data (Marked as optional in case the LLM API fails)
      summaryFeedback: z.string().optional(),
      finalTranscript: z.string().optional(),
      correctedTranscript: z.string().optional(),
      translation: z.string().optional(),
      grammarMistakes: z.array(GrammarMistakeSchema).optional(),
      vocabularySuggestions: z.array(VocabularySuggestionSchema).optional(),
    })
    .optional(),
});