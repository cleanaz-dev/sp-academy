// app/api/users/[userId]/sprite/chat/route.ts
import { NextResponse } from 'next/server';
import { isUser } from '@/lib/auth-guard';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 1000;
const MAX_REPLY_TOKENS = 2000;

const GROQ_LLM = "openai/gpt-oss-20b"

function clean(value: unknown, fallback: string, max = 100) {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[\r\n"]/g, ' ').trim().slice(0, max) || fallback;
}

function cleanNumber(value: unknown, fallback: number) {
  if (typeof value !== 'number') return fallback;
  return value;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
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

  const spriteName = clean(body.spriteName, 'Vox');
  const d = body.dossier || {};
  
  // Extract the user's specific context from the payload
  const userName = clean(d.userName, 'Student');
  const nativeLang = clean(d.nativeLang, 'English');
  const targetLang = clean(d.targetLang, 'French');
  const currentLessonTitle = clean(d.currentLessonTitle, 'Basics');
  const topWord = clean(d.topWord, '');
  const recentWords = clean(d.recentWords, '');
  const avgPronunciation = cleanNumber(d.avgPronunciation, 0);
  const avgMastery = cleanNumber(d.avgMastery, 0);

  const history: { role: 'user' | 'assistant'; content: string }[] = (
    Array.isArray(body.messages) ? body.messages : []
  )
    .filter(
      (m: any) =>
        m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
    )
    .slice(-MAX_MESSAGES)
    .map((m: any) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));

  // --- THE GOD-TIER PROMPT ---
  // This uses everything from your DB schema to make the AI incredibly smart
  const adaptiveInstruction = avgPronunciation > 80 
    ? `They are doing great (Pronunciation: ${avgPronunciation}%). Use slightly more advanced vocabulary to challenge them.`
    : `They are struggling (Pronunciation: ${avgPronunciation}%). Be highly encouraging, use very simple words, and praise their effort.`;

  const systemPrompt = `
    You are an AI language tutor named ${spriteName}. 
    You are talking to your student, ${userName}. 
    ${userName} speaks native ${nativeLang} and is learning ${targetLang}.
    
    CURRENT CONTEXT:
    - They are currently working on a lesson called: "${currentLessonTitle}".
    - ${adaptiveInstruction}
    - Their overall mastery score is ${avgMastery}%.
    
    VOCABULARY FOCUS:
    ${topWord ? `- They are struggling with the word: "${topWord}". Try to naturally weave this word into your response to test them.` : ''}
    ${recentWords ? `- They recently learned these words: ${recentWords}. Use them if appropriate.` : ''}

    RULES:
    1. Respond primarily in ${targetLang}. 
    2. Keep responses extremely concise (1 to 2 short sentences max).
    3. Do NOT use markdown formatting, asterisks, or emojis (this breaks the text-to-speech engine).
    4. Act like a real human tutor. Greet them by name if this is the first message.
  `;

  try {
    const completion = await client.chat.completions.create(
      {
        model: GROQ_LLM,
        stream: true,
        max_tokens: MAX_REPLY_TOKENS,
        messages: [{ role: 'system', content: systemPrompt }, ...history],
      },
      { signal: req.signal }
    );

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('Groq chat error:', err);
    return NextResponse.json({ error: 'AI service error' }, { status: 502 });
  }
}