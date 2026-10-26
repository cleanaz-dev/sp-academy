// app/api/users/[userId]/sprite/chat/route.ts
import { NextResponse } from 'next/server';
import { isUser } from '@/lib/auth-guard';
import {
  streamText,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

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

RESPONSE RULES:
1. Write 1 to 2 short plain-text sentences suitable for text-to-speech (no markdown, asterisks, or emojis).
2. If the user asks how to use a word, asks for grammar help, examples, or triggers a practice/action, first write your 1-2 sentence spoken response, then on a new line output ---JSON--- followed by a valid JSON object matching this exact structure:
---JSON---
{
  "contextCard": {
    "title": "Short rule or word title",
    "grammarRule": "Simple 1-sentence explanation",
    "examples": [
      { "french": "Example in ${targetLang}", "english": "Translation in ${nativeLang}" }
    ]
  },
  "action": {
    "type": "START_DRILL",
    "targetWord": "word being practiced"
  }
}
Only include "contextCard" if examples/grammar are helpful. Only include "action" if an action/drill should be triggered. If neither is needed, do not output ---JSON---.
`;

  try {
    const result = streamText({
      model: groq(GROQ_LLM),
      instructions: systemPrompt,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 2048,
      onFinish: async ({ text }) => {
        // Check if the LLM returned an action payload
        if (!text.includes('---JSON---')) return;

        const [, rawJson] = text.split('---JSON---');
        if (!rawJson) return;

        try {
          const parsed = JSON.parse(rawJson.trim());

          // If an action is present in the JSON payload, invoke your Lambda!
          if (parsed?.action && process.env.ACTION_LAMBDA_URL) {
            await fetch(process.env.ACTION_LAMBDA_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                lesson: currentLessonTitle,
                action: parsed.action,
                timestamp: new Date().toISOString(),
              }),
            });
          }
        } catch (e) {
          console.error('Failed to parse action JSON:', e);
        }
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