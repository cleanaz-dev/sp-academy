// @/lib/minimax/services/index.ts
import { miniMax, MINIMAX_MODELS } from '@/lib/minimax';
import type { ConversationParams, AIResponse, ScoringParams, UserScore } from '@/lib/moonshot/types';
import { conversationSchema } from '@/lib/moonshot/schemas/conversation-schema';
import { userScoreSchema } from '@/lib/moonshot/schemas/user-score-schema';

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

Respond with valid JSON only (no markdown) matching this schema:
${JSON.stringify(conversationSchema, null, 2)}`;
}

function getUserScorePrompt({
  targetLanguage,
  recentHistory,
  title,
  vocabulary,
  userMessage,
}: ScoringParams) {
  return `You are a language tutor grading a student's response in ${targetLanguage}.

Student is at a Beginner level. First message is usually a greeting, so score should reflect that.

Review the chat history to understand the context based on the title: "${title}"

Grade the student's response (1-10) based on:
- Whether it is an appropriate response to the conversation (CRITICAL)
- Grammar and vocabulary usage
- Use of suggested vocabulary

### Scoring Guidelines:
- 1-2 (Poor): Off-topic or irrelevant to conversation
- 3-4 (OK): Somewhat relevant but with major issues
- 5-6 (Good): Relevant with some minor issues
- 7-8 (Great): Relevant and mostly correct
- 9-10 (Excellent): Perfectly relevant and correct

### Label Assignment:
- Score 9-10 → "Excellent"
- Score 7-8 → "Great"
- Score 5-6 → "Good"
- Score 3-4 → "OK"
- Score 1-2 → "Poor"

### Important:
- If response is off-topic, score MUST be 1-2, even if grammar is correct
- Context relevance is the top priority
- Only provide improvedResponse if score is 6 or below AND improvement is genuinely needed

### Recent Chat History:
${recentHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

### Student's Response:
"${userMessage}"

### Suggested Vocabulary:
${vocabulary?.map((v) => `${v.targetLanguage} - ${v.nativeLanguage}`).join("\n") || 'No vocabulary provided'}

Respond with valid JSON only (no markdown) matching this schema:
${JSON.stringify(userScoreSchema, null, 2)}`;
}

export const sendMessage = async (params: ConversationParams): Promise<AIResponse> => {
  const prompt = buildPrompt(params);

  const message = await miniMax.messages.create({
    model: MINIMAX_MODELS.M2_5_LIGHTNING,
    max_tokens: 300, // Reduced from 1000
    system: prompt,
    messages: [
      { role: 'user', content: params.message }
    ],
    temperature: 0.3,
  });

  // Extract text from MiniMax response
  let content = '';
  if (message.content && Array.isArray(message.content)) {
    for (const block of message.content) {
      if (block.type === 'text') {
        content = block.text;
        break;
      }
    }
  }

  if (!content) {
    throw new Error("No response from MiniMax");
  }

  // Strip markdown if present
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  const parsed = JSON.parse(content);

  return {
    targetLanguage: parsed.targetLanguage,
    nativeLanguage: parsed.nativeLanguage,
    isCompleted: parsed.isCompleted,
    userMessageTranslation: parsed.userMessageTranslation
  };
};

export const getUserScoreNew = async (params: ScoringParams): Promise<UserScore> => {
  const prompt = getUserScorePrompt(params);

  const message = await miniMax.messages.create({
    model: MINIMAX_MODELS.M2_5_LIGHTNING,
    max_tokens: 200, // Reduced from 500
    system: prompt,
    messages: [
      { role: 'user', content: params.userMessage }
    ],
    temperature: 0.3,
  });

  // Extract text from MiniMax response
  let content = '';
  if (message.content && Array.isArray(message.content)) {
    for (const block of message.content) {
      if (block.type === 'text') {
        content = block.text;
        break;
      }
    }
  }

  if (!content) {
    throw new Error("No scoring response from MiniMax");
  }

  // Strip markdown if present
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  const parsed = JSON.parse(content);

  return {
    score: parsed.score,
    label: parsed.label,
    explanation: "No explanation provided.",
    improvedResponse: parsed.improvedResponse,
    corrections: "No corrections provided.",
  };
};