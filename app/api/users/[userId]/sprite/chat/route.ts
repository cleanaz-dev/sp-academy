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
    You are an AI language tutor named ${spriteName}. 
    You are talking to your student, ${userName}. 
    ${userName} speaks native ${nativeLang} and is learning ${targetLang}.
    
    CURRENT CONTEXT:
    - They are working on a lesson called: "${currentLessonTitle}".
    - ${adaptiveInstruction}
    - Their mastery score is ${avgMastery}%.
    
    VOCABULARY FOCUS:
    ${topWord ? `- Struggling with word: "${topWord}". Try to naturally weave this word into your response.` : ''}
    ${recentWords ? `- Recently learned: ${recentWords}. Use them if appropriate.` : ''}

    CRITICAL RULES:
    1. If the user asks a question or struggles in ${nativeLang}, explain concepts clearly to them in ${nativeLang}. Use ${targetLang} strictly for greetings, examples, and testing.
    2. Keep responses extremely concise (1 to 2 short sentences max).
    3. Do NOT use markdown formatting, asterisks, or emojis (this breaks the text-to-speech engine).
    4. Act like a real human tutor. Greet them by name if this is the first message.
  `;

  try {
    const result = streamText({
      model: groq(GROQ_LLM),
      instructions: systemPrompt, // v7 name for `system`
      messages: await convertToModelMessages(messages), // async; useChat sends UIMessages
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (err) {
    console.error('Groq chat error:', err);
    return NextResponse.json({ error: 'AI service error' }, { status: 502 });
  }
}