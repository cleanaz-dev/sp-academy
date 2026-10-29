// lib/schema/foundation/lesson-schema.ts
import { z } from "zod";

const s3Key = z.string().min(1);

export const visualContentSchema = z.object({
  imageS3Key: s3Key,
  npcAudioS3Key: s3Key,
  sceneDescription: z.string(),
  altText: z.string(),
  npcLine: z.string(),
  constraint: z.object({
    requiredChunk: z.string(),
    validReplies: z.array(z.string()),
  }),
});

export const grammarContentSchema = z.object({
  targetSentence: z.string(),
  nativeSentence: z.string(),
  romanizedSentence: z.string().nullable(),
  words: z.array(
    z.object({ word: z.string(), gloss: z.string(), role: z.string() })
  ),
  highlightGroup: z.array(z.string()),
  clozeItems: z.array(
    z.object({
      id: z.string(),
      hostSentence: z.string(),
      blankPosition: z.number().int().min(0),
      acceptableAnswers: z.array(z.string()).min(1),
      wrongAnswerFeedback: z.array(
        z.object({ wrong: z.string(), feedback: z.string() })
      ),
    })
  ),
});

export const pronunciationDataSchema = z.object({
  referenceText: z.string(),
  audioS3Key: s3Key,
  breakdown: z.array(
    z.object({
      text: z.string(),
      phonetic: z.string(),
      hint: z.string().nullable(),
    })
  ),
  focusSounds: z.array(
    z.object({ sound: z.string(), positions: z.array(z.number().int()) })
  ),
});

// 🟢 NEW: Exact millisecond word-level speech timestamps from Whisper
export const wordTimestampSchema = z.object({
  word: z.string(),
  startMs: z.number().int().nonnegative(),
  endMs: z.number().int().nonnegative(),
});

export const listeningContentSchema = z.object({
  id: z.string(),
  referenceText: z.string(),
  audioS3Key: s3Key,
  expectedOrder: z.array(z.string()),
  wordBank: z.array(z.string()),
  contrast: z.string(),
  wordTimestamps: z.array(wordTimestampSchema).optional().default([]), // 🟢 NEW
});

const verbalCloze = z.object({
  type: z.literal("verbal_cloze"),
  prompt: z.string(),
  hint: z.string().nullish(),
  acceptableAnswers: z.array(z.string()).min(1),
  feedback: z.string(),
});

const reorder = z.object({
  type: z.literal("reorder"),
  prompt: z.string(),
  expectedWords: z.array(z.string()).min(1),
  scrambledBank: z.array(z.string()),
});

const trueFalse = z.object({
  type: z.literal("true_false"),
  statement: z.string(),
  isTrue: z.boolean(),
  explanation: z.string(),
});

export const quizContentSchema = z.object({
  items: z
    .array(z.discriminatedUnion("type", [verbalCloze, reorder, trueFalse]))
    .min(1),
  passThreshold: z.number().min(0).max(1),
});

export const freestyleSchema = z.object({
  mode: z.string(),
  level: z.string(),
  topic: z.string(),
  persona: z.string(),
  requiredChunks: z.array(z.string()),
  openingLine: z.string(),
});

export const wordAudioSchema = z.record(
  z.string(),
  z.object({ m: z.string(), f: z.string() })
);

export const wordLexiconEntrySchema = z.object({
  slug: z.string(),
  word: z.string(),
  wordType: z.enum(["WORD", "PHRASE"]).default("WORD"),
  partOfSpeech: z.string().default("OTHER"),
  translation: z.string().default(""),
  lemma: z.string().nullable().optional(),
  grammaticalGender: z.string().nullable().optional(),
  componentWords: z.array(z.string()).default([]),
  audio: z
    .object({
      m: z.string().optional(),
      f: z.string().optional(),
    })
    .default({}),
});

export const wordLexiconSchema = z.record(z.string(), wordLexiconEntrySchema);

export const lessonHandoffSchema = z.object({
  day: z.number().int(),
  theme: z.string(),
  targetSentence: z.string(),
  chunks: z.array(z.string()),
  npcLine: z.string(),
  freestyleTopic: z.string(),
  introNative: z.string(),
  introTarget: z.string(),
  outroNative: z.string(),
  outroTarget: z.string(),
  introNativeAudio: s3Key,
  introTargetAudio: s3Key,
  outroNativeAudio: s3Key,
  outroTargetAudio: s3Key,
  npcAudio: s3Key,
  taughtChunks: z.array(z.string()),
  blankedWords: z.array(z.string()),
  wrongAnswers: z.array(z.string()),
  pronunciationSound: z.string(),
  listeningContrast: z.string(),
  visualRequiredChunk: z.string(),
  sceneDescription: z.string(),
  freestylePersona: z.string(),
  trueFalseStatement: z.string(),
  wordAudio: wordAudioSchema,
  wordLexicon: wordLexiconSchema.optional().default({}),
});

export type WordLexiconEntry = z.infer<typeof wordLexiconEntrySchema>;
export type WordTimestamp = z.infer<typeof wordTimestampSchema>;

/** Full webhook body from the foundation-builder lambda */
export const foundationLessonWebhookSchema = z.object({
  userId: z.string().min(1),
  foundationCourseId: z.string().min(1),
  orderIndex: z.number().int().min(1),
  status: z.string(),
  name: z.string().optional(),
  nativeLang: z.string().optional(),
  targetLang: z.string().optional(),
  visualContent: visualContentSchema,
  grammarContent: grammarContentSchema,
  pronunciationData: pronunciationDataSchema,
  listeningContent: listeningContentSchema,
  quizContent: quizContentSchema,
  freestyle: freestyleSchema,
  lessonHandoff: lessonHandoffSchema,
});

export type VisualContent = z.infer<typeof visualContentSchema>;
export type GrammarContent = z.infer<typeof grammarContentSchema>;
export type PronunciationData = z.infer<typeof pronunciationDataSchema>;
export type ListeningContent = z.infer<typeof listeningContentSchema>;
export type QuizContent = z.infer<typeof quizContentSchema>;
export type QuizItem = QuizContent["items"][number];
export type Freestyle = z.infer<typeof freestyleSchema>;
export type LessonHandoff = z.infer<typeof lessonHandoffSchema>;
export type FoundationLessonWebhook = z.infer<
  typeof foundationLessonWebhookSchema
>;