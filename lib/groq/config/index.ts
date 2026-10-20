import OpenAI from "openai";

export const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

// Check console.groq.com/docs/models for current IDs; Groq rotates models often.
export const GROQ_MODELS = {
  GPT_OSS_120B: "openai/gpt-oss-120b",
  GPT_OSS_20B: "openai/gpt-oss-20b",
  LLAMA_70B: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
  LLAMA_8B: "llama-3.1-8b-instant",
} as const;

// Kept so the earlier /api/chat route still works
export const GROQ_CHAT_MODEL = GROQ_MODELS.LLAMA_70B;

let client: OpenAI | null = null;

export function getGroqClient(): OpenAI {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured.");

  if (!client) {
    client = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });
  }
  return client;
}

// Lazy `groq` export for files that import it directly. The client is only
// created on first use, so a missing key at build time won't crash the build.
export const groq = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return Reflect.get(getGroqClient(), prop);
  },
});