import { getGroqClient, GROQ_MODELS } from "@/lib/groq/config";
import type { ConversationParams, AIResponse } from "@/lib/groq/types";
import { conversationSchema } from "../schemas/conversation-schema";

function buildPrompt(params: ConversationParams): string {
  // Safety fallback: if DB is empty, default to Cashier
  const currentScenario =
    params.scenario || "a Cashier at a Fast Food restaurant";

  return `
SYSTEM INSTRUCTIONS:
You are a roleplay partner for a language student.
- Target Language: ${params.targetLanguage}
- User's Native Language: ${params.nativeLanguage}

YOUR PERSONA:
You are ${currentScenario}.
You are polite but efficient.

CURRENT SITUATION:
Topic: ${params.title}
User says: "${params.message}"

VOCABULARY CONTEXT:
${params.vocabulary?.map((v: any) => `${v.targetLanguage} = ${v.nativeLanguage}`).join("\n") || ""}

HISTORY:
${params.history?.slice(-2).map((h: any) => `${h.role}: ${h.content}`).join("\n") || "No history"}

### CRITICAL OUTPUT RULES:
1. Reply in ${params.targetLanguage}.
2. Keep it short (under 10 words).
3. If the user completes the goal (orders food/says thanks), set isCompleted to true.

### JSON RESPONSE FORMAT:
You must return a JSON object with these EXACT specific meanings:
{
   // Your actual reply in ${params.targetLanguage}
   "targetLanguage": "...", 
   
   // TRANSLATE your reply into ${params.nativeLanguage}
   "nativeLanguage": "...", 
   
   // TRANSLATE the user's message ("${params.message}") into ${params.nativeLanguage}
   "userMessageTranslation": "...",
   
   // boolean
   "isCompleted": false 
}
`;
}

export const sendMessage = async (
  params: ConversationParams,
): Promise<AIResponse> => {
  const prompt = buildPrompt(params);
  const groq = getGroqClient(); // sync, no await needed

  const completion = await groq.chat.completions.create({
    model: GROQ_MODELS.GPT_OSS_120B,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: params.message },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "conversation_reply",
        strict: true,
        schema: conversationSchema,
      },
    },
    temperature: 0.3,
    max_tokens: 5000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response");

  const parsed = JSON.parse(content);

  return {
    targetLanguage: parsed.targetLanguage,
    nativeLanguage: parsed.nativeLanguage,
    isCompleted: parsed.isCompleted,
    userMessageTranslation: parsed.userMessageTranslation,
  };
};