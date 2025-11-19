import { z } from "zod";

// Base exercise fields
const baseExercise = z.object({
  title: z.string(),
  header: z.string(),
  feedback: z.string(),
});

// 1. Drag and Drop
const dragAndDropExercise = baseExercise.extend({
  type: z.literal("drag_and_drop"),
  question: z.string(),
  scrambled_words: z.array(z.string()),
  correct_answer: z.string(),
});

// 2. Fill in the Blank
const fillInBlankExercise = baseExercise.extend({
  type: z.literal("fill_in_blank"),
  question: z.string(),
  sentences: z.array(z.string()),
  correct_answer: z.array(z.string()),
});

// 3. Audio Based
const audioBasedExercise = baseExercise.extend({
  type: z.literal("audio_based"),
  question: z.string(),
  audio_script: z.string(),
  multiple_choice: z.array(z.string()),
  correct_answer: z.number(),
  feedback: z.object({
    correct: z.string(),
    incorrect: z.string(),
  }),
});

// 4. Matching Pairs
const matchingPairsExercise = baseExercise.extend({
  type: z.literal("matching_pairs"),
  question: z.string(),
  pairs: z.array(
    z.object({
      word: z.string(),
      match: z.string(),
    }),
  ),
  additional_data: z.object({
    category: z.string(),
    difficulty: z.string(),
  }),
});

// 5. Image Word Input
const imageWordInputExercise = baseExercise.extend({
  type: z.literal("image_word_input"),
  question: z.string(),
  image_prompt: z.string(),
  imageUrl: z.string(),
  correct_answer: z.string(),
  additional_data: z.object({
    vocabulary_focus: z.string(),
    difficulty: z.string(),
  }),
});

// Union of all exercise types
const exerciseSchema = z.discriminatedUnion("type", [
  dragAndDropExercise,
  fillInBlankExercise,
  audioBasedExercise,
  matchingPairsExercise,
  imageWordInputExercise,
]);

// Final response structure
export const languageExercisesSchema = z.object({
  exercises: z.array(exerciseSchema),
});

// Type inference
export type LanguageExercises = z.infer<typeof languageExercisesSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;

// Usage example
export function createLanguageExercisePrompt(
  level: string,
  randomScene1: string,
  randomScene2: string,
) {
  return `Generate ${level} grade-level French language exercises. 
Use image scenario 1: ${randomScene1}
Use image scenario 2: ${randomScene2}

Create a variety of exercise types including drag-and-drop, fill-in-blank, audio-based, matching pairs, and image word input exercises.`;
}

// How to use with Moonshot/OpenAI
import OpenAI from "openai";
import { zodToJsonSchema } from "zod-to-json-schema";

export async function generateLanguageExercises(
  level: string,
  scene1: string,
  scene2: string,
) {
  const client = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: "https://api.moonshot.ai/v1",
  });

  const jsonSchema = zodToJsonSchema(
    languageExercisesSchema,
    "language_exercises",
  );

  const response = await client.chat.completions.create({
    model: "moonshot-v1-8k",
    messages: [
      {
        role: "user",
        content: createLanguageExercisePrompt(level, scene1, scene2),
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "generate_exercises",
          description: "Generate structured language learning exercises",
          parameters: jsonSchema,
        },
      },
    ],
  });

  const toolCall = response.choices[0].message.tool_calls?.[0];
  
  if (!toolCall || toolCall.type !== 'function') {
  throw new Error("No valid tool call found");
}

  const result = JSON.parse(toolCall.function.arguments);
  // Validate and return typed result
  return languageExercisesSchema.parse(result);
}
