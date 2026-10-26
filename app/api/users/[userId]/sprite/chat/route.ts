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
This vocabulary is background information only. Do not automatically include it
in responses, and never turn it into an unsolicited vocabulary list.

RESPONSE RULES:
1. Respond only to the learner's latest message and its intent. Do not continue
   an earlier explanation or repeat information unless explicitly asked.

2. Language and conversation-mode requests take priority over lesson and
   vocabulary context. If the learner says something like "English",
   "speak English", or "just speak English", stop teaching and switch to
   English. For that message, respond only with a short acknowledgment,
   such as "Got it. I'll use English."

3. After an English-only request, do not add ${targetLang} words, translations,
   pronunciation guidance, quizzes, or examples unless the learner explicitly
   asks for a translation, an example, or ${targetLang} practice.

4. Otherwise, explain concepts in ${nativeLang}. Use ${targetLang} only when
   it is useful for an explicitly requested example, translation, or practice.
   Include at most one relevant vocabulary item per response.

5. Normal responses must be 1 to 2 short sentences. Give a longer explanation
   only when the learner explicitly asks for more detail. Never repeat the
   same explanation using different wording.

6. Do not use markdown, bullet points, asterisks, or emojis. Write plain text
   suitable for text-to-speech.
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