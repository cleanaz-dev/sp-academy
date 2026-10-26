// app/api/users/[userId]/sprite/chat/route.ts
import { NextResponse } from 'next/server';
import { isUser } from '@/lib/auth-guard';
import {
  streamText,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
  tool,
  stepCountIs,
  type UIMessage,
} from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Note: Ensure the model you use on Groq supports tool calling 
// (e.g., 'llama-3.3-70b-versatile' or 'openai/gpt-oss-20b')
const GROQ_LLM = 'openai/gpt-oss-20b';

function clean(value: unknown, fallback: string, max = 100) {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[\r\n"]/g, ' ').trim().slice(0, max) || fallback;
}

function cleanNumber(value: unknown, fallback: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return value;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  const user = await isUser(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!Array.isArray(body.messages)) {
    return NextResponse.json({ error: 'messages must be an array' }, { status: 400 });
  }
  const messages: UIMessage[] = body.messages;

  const spriteName = clean(body.spriteName, 'Vox');
  const d = body.dossier || {};

  const userName = clean(d.userName, 'Student');
  const nativeLang = clean(d.nativeLang, 'English');
  const targetLang = clean(d.targetLang, 'French');
  const currentLessonTitle = clean(d.currentLessonTitle, 'Basics');
  const topWord = clean(d.topWord, '');
  const recentWords = clean(d.recentWords, '');
  const avgPronunciation = cleanNumber(d.avgPronunciation, 0);
  const avgMastery = cleanNumber(d.avgMastery, 0);

  const adaptiveInstruction =
    avgPronunciation > 80
      ? `They are doing great (Pronunciation: ${avgPronunciation}%). Use slightly more advanced vocabulary to challenge them.`
      : `They are struggling (Pronunciation: ${avgPronunciation}%). Be highly encouraging, use very simple words, and praise their effort.`;

  const systemPrompt = `
You are ${spriteName}, a concise, human-like language tutor.
You are helping ${userName}, whose native language is ${nativeLang}
and who is learning ${targetLang}.

LESSON CONTEXT:
- Current lesson: ${currentLessonTitle}
- Mastery score: ${avgMastery}%
- When teaching or practicing: ${adaptiveInstruction}

VOCABULARY CONTEXT:
${topWord ? `- Difficult word: ${topWord}` : ''}
${recentWords ? `- Recently learned words: ${recentWords}` : ''}

TOOL & COMPONENT RULES:
1. When the learner asks how to use a word, asks for examples, or needs a grammar breakdown, call the "showGrammarCard" tool to display a visual card, accompanied by a 1-sentence spoken intro.
2. When the learner requests to start a drill, bookmark a word, or log an action, call "triggerBackendAction".
3. Keep spoken text responses to 1 to 2 short plain-text sentences suitable for text-to-speech (no markdown or emojis).
`;

  try {
    const result = streamText({
      model: groq(GROQ_LLM),
      instructions: systemPrompt,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 2048,
      // Allows the model to call a tool AND speak a response in the same turn
      stopWhen: stepCountIs(2), 
      tools: {
        // 1. UI Component Tool: Renders <ContextCard /> in the assistant stage
        showGrammarCard: tool({
          description: 'Display a structured grammar or vocabulary breakdown card with examples to the student.',
          inputSchema: z.object({
            title: z.string().describe('Short title of the grammar rule or word'),
            grammarRule: z.string().describe('Clear, concise explanation of the rule or usage'),
            examples: z.array(
              z.object({
                french: z.string().describe(`The example phrase in ${targetLang}`),
                english: z.string().describe(`The translation in ${nativeLang}`),
              })
            ).min(1).max(3),
          }),
          execute: async (cardData) => {
            // Returning the data sends it straight to message.parts on the client!
            return cardData;
          },
        }),

        // 2. Action / Lambda Tool: Invokes your Lambda or external service
        triggerBackendAction: tool({
          description: 'Trigger a backend Lambda action such as starting a pronunciation drill, saving a word to the bank, or logging mastery.',
          inputSchema: z.object({
            actionType: z.enum(['START_DRILL', 'BOOKMARK_WORD', 'LOG_STRUGGLE']),
            targetWord: z.string().describe('The word or phrase associated with the action'),
            metadata: z.string().optional().describe('Any extra context for the payload'),
          }),
          execute: async ({ actionType, targetWord, metadata }) => {
            // --- INVOKE YOUR LAMBDA / WEBHOOK HERE ---
            const payload = {
              userId,
              actionType,
              targetWord,
              lesson: currentLessonTitle,
              metadata,
              timestamp: new Date().toISOString(),
            };

            if (process.env.ACTION_LAMBDA_URL) {
              await fetch(process.env.ACTION_LAMBDA_URL, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.LAMBDA_SECRET_KEY}`,
                },
                body: JSON.stringify(payload),
              });
            }

            // Return the payload so the UI can also render an Action Pill / Component
            return {
              status: 'executed',
              ...payload,
            };
          },
        }),
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (err) {
    console.error('Groq chat error:', err);
    return NextResponse.json({ error: 'AI service error' }, { status: 502 });
  }
}