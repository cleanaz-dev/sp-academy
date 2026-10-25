// app/api/users/[userId]/sprite/chat/route.ts
import { NextResponse } from 'next/server';
import { isUser } from '@/lib/auth-guard';
import OpenAI from 'openai';

// OpenAI SDK pointed at Groq
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 1000;
const MAX_REPLY_TOKENS = 150;

// Client-supplied values go into the system prompt, so strip newlines/quotes and cap length
function clean(value: unknown, fallback: string, max = 40) {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[\r\n"]/g, ' ').trim().slice(0, max) || fallback;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> } // Next.js 15+ format
) {
  const { userId } = await params;

  // 1. Auth
  // TODO(auth): also verify the logged-in session's user id === userId.
  // isUser() below only checks that this id exists in the DB, not who is calling.
  const user = await isUser(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // 2. Parse body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const targetLang = clean(body.targetLang, 'French');
  const spriteName = clean(body.spriteName, 'Vox');
  const topWord = clean(body.topWord, 'bonjour');

  // Only allow user/assistant messages (no client-injected "system"), capped in count and size
  const history: { role: 'user' | 'assistant'; content: string }[] = (
    Array.isArray(body.messages) ? body.messages : []
  )
    .filter(
      (m: any) =>
        m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
    )
    .slice(-MAX_MESSAGES)
    .map((m: any) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));

  // 3. Build the hidden "System Prompt" on the server
  const systemPrompt = `
    You are an AI language tutor named ${spriteName}.
    The user is learning ${targetLang}.
    Their current focus word from the Word Matrix is "${topWord}".
    If they are just starting the chat, casually mention their focus word.
    Keep responses to 1-2 short sentences. Do not use markdown formatting.
  `;

  // 4. Call Groq and stream plain text back
  try {
    const completion = await client.chat.completions.create(
      {
        model: 'llama-3.3-70b-versatile',
        stream: true,
        max_tokens: MAX_REPLY_TOKENS,
        messages: [{ role: 'system', content: systemPrompt }, ...history],
      },
      { signal: req.signal } // stop the Groq call if the user disconnects
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