import { NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 60;

const MAX_TOKENS_BY_LEVEL = {
  ZERO: 180,
  EASY: 240,
  MEDIUM: 320,
  FLUENT: 450,
} as const;

// ─── Validation Schema ─────────────────────────────────────────
const ChatBodySchema = z.object({
  mode: z.enum(["INTRODUCTION", "SPECIFIC", "RANDOM", "ARGUMENTATIVE"]),
  level: z.enum(["ZERO", "EASY", "MEDIUM", "FLUENT"]).default("EASY"), // 🚨 ADDED "ZERO"
  topic: z.string().optional(),
  targetLanguage: z.string(),
  nativeLanguage: z.string(),
  voiceGender: z.enum(["male", "female"]).optional(),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string(),
      }),
    )
    .default([]),
  isOpening: z.boolean().default(false),
});

// ─── Level-Based Prompt Injections ─────────────────────────────
const LEVEL_INSTRUCTIONS: Record<string, string> = {
  // 🚨 ADDED "ZERO" INSTRUCTIONS
  ZERO: `
DIFFICULTY: ZERO / ABSOLUTE BEGINNER (Pre-A1)
- You MUST speak using ONLY 1 or 2 extremely short sentences.
- Use only the most basic, elementary vocabulary (colors, basic foods, simple greetings, yes/no).
- Avoid all complex grammar.
- Ask only very simple, direct questions (e.g., "What is your name?", "Do you like apples?").
- Be overwhelmingly encouraging, warm, and patient.`,

  EASY: `
DIFFICULTY: EASY (A1-A2)
- Be warm, patient, and highly supportive.
- Speak in short, clear sentences. Avoid idioms, slang, and complex grammar.
- React happily to their input before asking the next simple question.
- If they struggle, gently steer the conversation to something very familiar (hobbies, food, weather).`,

  MEDIUM: `
DIFFICULTY: MEDIUM (B1-B2)
- Be casually conversational and curious, like a friendly acquaintance.
- Use natural vocabulary, some common idioms, and transitional phrases.
- Acknowledge their ideas and share a brief perspective of your own before asking a thoughtful follow-up question.
- Correct subtle mistakes naturally by just using the right word in your response.`,

  FLUENT: `
DIFFICULTY: FLUENT (C1-C2)
- Be highly engaging and dynamic, like speaking with a native friend or colleague.
- Speak at a natural native pace using nuance, humor, cultural references, and complex sentence structures.
- Don't just ask questions—debate, joke, or deeply agree with them. 
- Challenge their assumptions and push them to expand on their opinions.`,
};

// ─── Mode-Based Opening Prompts ────────────────────────────────
const MODE_OPENING_TASKS: Record<string, (topic?: string) => string> = {
  INTRODUCTION: () =>
    `TASK: Warmly introduce yourself, share a brief, friendly detail about your day, and ask a simple warm-up question to get them talking.`,
  SPECIFIC: (topic) =>
    `TASK: Start a natural roleplay or conversation about: "${topic}". Set the scene conversationally, make a statement, and ask a question to draw them in.`,
  RANDOM: () =>
    `TASK: Share a brief, interesting thought about a completely random everyday topic, then ask them an engaging, open-ended question about it.`,
  ARGUMENTATIVE: () =>
    `TASK: Make a strong, slightly controversial statement. Briefly explain your stance and challenge them to share their perspective.`,
};

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[CHAT-${requestId}] 🟢 Incoming Request`);

  try {
    const rawBody = await req.json();
    const parseResult = ChatBodySchema.safeParse(rawBody);

    if (!parseResult.success) {
      console.error(
        `[CHAT-${requestId}] ❌ Validation failed:`,
        parseResult.error.flatten(),
      );
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const {
      mode,
      level,
      topic,
      targetLanguage,
      nativeLanguage,
      chatHistory,
      isOpening,
    } = parseResult.data;

    console.log(
      `[CHAT-${requestId}] Params: Mode=${mode}, Level=${level}, Target=${targetLanguage}, Native=${nativeLanguage}`,
    );

    // Clean up chat history to prevent consecutive user prompts from crashing DeepSeek
    const sanitizedHistory: any[] = [];
    for (const m of chatHistory) {
      const lastMsg = sanitizedHistory[sanitizedHistory.length - 1];
      if (lastMsg && lastMsg.role === m.role) {
        lastMsg.content += `\n\n${m.text}`;
      } else {
        sanitizedHistory.push({ role: m.role, content: m.text });
      }
    }

    let systemPrompt = `You are a friendly, conversational native speaker having a natural voice chat with a learner.
Target Language: ${targetLanguage}. Native Language: ${nativeLanguage}.

CRITICAL FORMATTING RULES:
1. You MUST respond in valid JSON with EXACTLY two keys:
   - "text": Your response in ${targetLanguage}.
   - "translation": The exact translation of your response into ${nativeLanguage}.
2. Do not wrap in markdown. Return raw JSON only.
3. NO emojis in your text (it messes up text-to-speech).

CONVERSATIONAL RULES:
- Keep your response brief but conversational (2-4 sentences max).
- ALWAYS react to what the user just said first (e.g., "That's interesting!", "I totally agree").
- Share a brief thought of your own to make it feel like a real dialogue.
- End your turn by naturally passing the conversation back to them, usually with a relevant question.`;

    // Inject level-specific instructions
    systemPrompt += `\n${LEVEL_INSTRUCTIONS[level]}`;

    if (isOpening) {
      const taskFn = MODE_OPENING_TASKS[mode];
      systemPrompt += `\n\n${taskFn(topic)}`;
    } else {
      systemPrompt += `\n\nTASK: CONTINUE THE CONVERSATION. Acknowledge what the user just said, add a natural conversational thought of your own, and ask a follow-up question to keep the ${mode.toLowerCase()} dynamic alive.`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...sanitizedHistory,
    ];

    const apiKey = process.env.NOVITA_API_KEY;
    if (!apiKey) throw new Error("NOVITA_API_KEY is not configured.");

    console.log(`[CHAT-${requestId}] 🚀 Sending request to Novita...`);
    const startTime = Date.now();

    const chatResponse = await fetch(
      "https://api.novita.ai/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-v4-flash-0731",
          messages: messages,
          response_format: { type: "json_object" },
          // 🚨 SAFE TOKEN LIMITS SO THE API DOES NOT CRASH
          max_tokens: level === "FLUENT" ? 600 : 400,
          temperature: level === "FLUENT" ? 0.9 : 0.7,
        }),
      },
    );

    console.log(
      `[CHAT-${requestId}] ⏱️ Novita responded in ${Date.now() - startTime}ms. Status: ${chatResponse.status}`,
    );

    if (!chatResponse.ok) {
      const errText = await chatResponse.text();
      console.error(`[CHAT-${requestId}] ❌ Novita Error:`, errText);
      throw new Error(`Novita returned ${chatResponse.status}`);
    }

    const chatData = await chatResponse.json();

    const choice = chatData.choices?.[0];

    if (!choice?.message?.content) {
      throw new Error("Novita returned no message content");
    }

    console.log(`[CHAT-${requestId}] Usage:`, chatData.usage);
    console.log(`[CHAT-${requestId}] Finish reason:`, choice.finish_reason);

    if (choice.finish_reason === "length") {
      throw new Error("AI response was truncated by max_tokens");
    }

    const rawContent = choice.message.content;
    // const rawContent = chatData.choices?.[0]?.message?.content || "{}";

    // 🚨 SAFE JSON EXTRACTION
    let parsedContent: any;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch (e) {
      console.warn(
        `[CHAT-${requestId}] ⚠️ AI didn't return perfect JSON. Attempting regex extraction...`,
      );
      const match = rawContent.match(/\{[\s\S]*\}/);
      if (match) {
        parsedContent = JSON.parse(match[0]);
      } else {
        throw new Error("Could not extract valid JSON from response");
      }
    }

    if (!parsedContent.text || !parsedContent.translation) {
      throw new Error(
        "AI response missing required 'text' or 'translation' fields",
      );
    }

    return NextResponse.json({
      text: parsedContent.text,
      translation: parsedContent.translation,
      meta: { level, mode, requestId },
    });
  } catch (error: any) {
    console.error(`[CHAT-ERROR] ❌`, error.message || error);
    return NextResponse.json(
      { error: "Failed to process chat", message: error.message },
      { status: 500 },
    );
  }
}
