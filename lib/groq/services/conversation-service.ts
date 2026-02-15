import { groq, GROQ_MODELS } from '@/lib/groq';
import type { ConversationParams, AIResponse } from '@/lib/groq/types';
import { conversationSchema } from '../schemas/conversation-schema';



function buildPrompt(params: ConversationParams): string {
  return `You are a ${params.targetLanguage} language conversation partner for ABSOLUTE BEGINNERS.
Your Role: Cashier at Fast Food
Topic: ${params.title}

Dialogue Scenario:
${params.dialogue?.map(d => `${d.speaker}: ${d.targetLanguage} (${d.nativeLanguage})`).join('\n')}

Vocabulary to use:
${params.vocabulary?.map(v => `${v.targetLanguage} - ${v.nativeLanguage}`).join('\n')}

Recent messages:
${params.history?.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User says: "${params.message}"

Rules: 5-6 words, present tense, end with question, use vocabulary above.
Critical: At the fast food counter, no checks — just roleplay and say 'Thanks, come again' when appropriate
OUTPUT IN JSON SCHEMA target language, native language, user message translation and isCompleted.`;
}

// Main function
export const sendMessage = async (params: ConversationParams): Promise<AIResponse> => {
  const prompt = buildPrompt(params);

  const completion = await groq.chat.completions.create({
    model: GROQ_MODELS.LLAMA_3_1_8B,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: params.message }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "translation",
        strict: true,
        schema: conversationSchema
      },
    },
    temperature: 0.3,
    max_tokens: 1000,
  });

  const content = completion.choices[0].message.content;
  if (!content) throw new Error("No response");

  const parsed = JSON.parse(content);
  console.log("parsed:", parsed)

  return {
    targetLanguage: parsed.targetLanguage,
    nativeLanguage: parsed.nativeLanguage,
    isCompleted: parsed.isCompleted, 
    userMessageTranslation: parsed.userMessageTranslation
  };
};
