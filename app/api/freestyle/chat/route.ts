import { NextResponse } from "next/server";
import { z } from "zod"; // npm install zod if you haven't

export const maxDuration = 60;

// ─── Validation Schema ─────────────────────────────────────────
const ChatBodySchema = z.object({
  mode: z.enum(["INTRODUCTION", "SPECIFIC", "RANDOM", "ARGUMENTATIVE"]),
  level: z.enum(["EASY", "MEDIUM", "FLUENT"]).default("EASY"),        // <-- NEW
  topic: z.string().optional(),
  targetLanguage: z.string(),
  nativeLanguage: z.string(),
  voiceGender: z.enum(["male", "female"]).optional(),                // <-- NEW (for future TTS)
  chatHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    text: z.string(),
  })).default([]),
  isOpening: z.boolean().default(false),
});

// ─── Level-Based Prompt Injections ─────────────────────────────
const LEVEL_INSTRUCTIONS: Record<string, string> = {
  EASY: `
DIFFICULTY: EASY
- Use simple, high-frequency vocabulary (A1-A2).
- Speak in short, clear sentences. Avoid idioms and slang.
- Ask straightforward questions that require simple answers.
- Be patient and encouraging. If the user struggles, rephrase simply.`,
  
  MEDIUM: `
DIFFICULTY: MEDIUM
- Use natural, conversational vocabulary (B1-B2).
- Use some common idioms and colloquialisms.
- Ask open-ended questions that require explanation.
- Correct subtle mistakes gently by rephrasing.`,
  
  FLUENT: `
DIFFICULTY: FLUENT
- Use sophisticated, native-level vocabulary (C1-C2).
- Employ nuance, humor, cultural references, and complex sentence structures.
- Challenge the user's assumptions. Push them to defend opinions.
- Speak at a natural native pace (your text should feel dense and rapid).`,
};

// ─── Mode-Based Opening Prompts ────────────────────────────────
const MODE_OPENING_TASKS: Record<string, (topic?: string) => string> = {
  INTRODUCTION: () => `TASK: Introduce yourself warmly and ask an easy warm-up question.`,
  SPECIFIC: (topic) => `TASK: Start a roleplay about: "${topic}". Set the scene and ask a question.`,
  RANDOM: () => `TASK: Ask a unique, thought-provoking open-ended question.`,
  ARGUMENTATIVE: () => `TASK: Make a controversial statement and challenge them to debate you.`,
};

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[CHAT-${requestId}] 🟢 Incoming Request`);

  try {
    // 1. Parse & validate body
    const rawBody = await req.json();
    const parseResult = ChatBodySchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      console.error(`[CHAT-${requestId}] ❌ Validation failed:`, parseResult.error.flatten());
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { mode, level, topic, targetLanguage, nativeLanguage, chatHistory, isOpening } = parseResult.data;
    
    console.log(`[CHAT-${requestId}] Params: Mode=${mode}, Level=${level}, Target=${targetLanguage}, Native=${nativeLanguage}`);

    // 2. Build dynamic system prompt
    let systemPrompt = `You are a conversational language tutor leading a fast-paced speaking challenge.
Target Language: ${targetLanguage}. Native Language: ${nativeLanguage}.

CRITICAL RULES:
1. You MUST respond in valid JSON with EXACTLY two keys:
   - "text": Your response in ${targetLanguage} (1-3 sentences max. NO emojis. Always end with a question).
   - "translation": The exact translation of your response into ${nativeLanguage}.
2. Do not wrap in markdown. Return raw JSON only.
3. Stay in character as a language tutor.`;

    // Inject level-specific instructions
    systemPrompt += LEVEL_INSTRUCTIONS[level];

    // Inject mode-specific task (only on opening, but keep persona consistent)
    if (isOpening) {
      const taskFn = MODE_OPENING_TASKS[mode];
      systemPrompt += `\n${taskFn(topic)}`;
    } else {
      // For follow-ups, remind the AI of the mode context
      systemPrompt += `\nCONTINUE THE CONVERSATION: Keep the ${mode.toLowerCase()} dynamic going naturally.`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map((m: any) => ({
        role: m.role,
        content: m.text,
      })),
    ];

    const apiKey = process.env.NOVITA_API_KEY;
    if (!apiKey) throw new Error("NOVITA_API_KEY is not configured.");

    console.log(`[CHAT-${requestId}] 🚀 Sending request to Novita...`);
    const startTime = Date.now();

    const chatResponse = await fetch("https://api.novita.ai/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash-0731",
        messages: messages,
        response_format: { type: "json_object" },
        max_tokens: level === "FLUENT" ? 600 : 400,   // Fluent gets more tokens for complex structures
        temperature: level === "FLUENT" ? 0.9 : 0.7,   // More creative at fluent level
      }),
    });

    console.log(`[CHAT-${requestId}] ⏱️ Novita responded in ${Date.now() - startTime}ms. Status: ${chatResponse.status}`);

    if (!chatResponse.ok) {
      const errText = await chatResponse.text();
      console.error(`[CHAT-${requestId}] ❌ Novita Error:`, errText);
      throw new Error(`Novita returned ${chatResponse.status}`);
    }

    const chatData = await chatResponse.json();
    const rawContent = chatData.choices?.[0]?.message?.content || "{}";
    
    console.log(`[CHAT-${requestId}] 📝 Raw AI Content:`, rawContent);

    // Parse JSON with fallback cleanup
    let parsedContent;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch (e) {
      console.warn(`[CHAT-${requestId}] ⚠️ AI didn't return perfect JSON. Attempting cleanup...`);
      const cleaned = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedContent = JSON.parse(cleaned);
    }

    // Validate expected keys exist
    if (!parsedContent.text || !parsedContent.translation) {
      throw new Error("AI response missing required 'text' or 'translation' fields");
    }

    console.log(`[CHAT-${requestId}] ✅ Success. Text: "${parsedContent.text.substring(0, 50)}..."`);

    return NextResponse.json({ 
      text: parsedContent.text, 
      translation: parsedContent.translation,
      meta: { level, mode, requestId }  // Return metadata for frontend tracking
    });

  } catch (error: any) {
    console.error(`[CHAT-ERROR] ❌`, error.message || error);
    return NextResponse.json(
      { error: "Failed to process chat", message: error.message },
      { status: 500 }
    );
  }
}