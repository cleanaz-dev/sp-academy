import { z } from 'zod';


const newSchema = z.object({
  targetLanguage: z
    .string()
    .min(1, { message: "Target language response is required" })
    .describe("Your response in target language (5-6 words, present tense, ends with question)"),
  nativeLanguage: z
    .string()
    .min(1, { message: "Native language translation is required" })
    .describe("Translation of your response in the user's native language"),
  userMessageTranslation: z
    .string()
    .min(1, { message: "User message translation is required" })
    .describe("Translation of the user's message in their native language"),
  isCompleted: z
    .boolean()
    .default(false)
    .describe("Indicates if the conversation is completed")
});

const responseSchema = z.toJSONSchema(newSchema);
delete responseSchema.$schema;

export const conversationSchema = responseSchema