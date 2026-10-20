import OpenAI from "openai";

export const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

// Default chat model. Check console.groq.com/docs/models for current IDs,
// since Groq rotates models fairly often.
export const GROQ_CHAT_MODEL =
  process.env.GROQ_MODEL ?? "openai/gpt-oss-20b";

let client: OpenAI | null = null;

export function getGroqClient(): OpenAI {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured.");

  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL: GROQ_BASE_URL,
    });
  }
  return client;
}