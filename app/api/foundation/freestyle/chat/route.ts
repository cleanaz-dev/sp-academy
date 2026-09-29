import { NovitaTextModel } from "@/lib/novita";
import { NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 60;

// ─── Validation Schema (Now includes freestyleData) ────────────
const ChatBodySchema = z.object({
  mode: z.string(),
  level: z.string(),
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
  freestyleData: z.object({
    persona: z.string(),
    requiredChunks: z.array(z.string()),
    npcLine: z.string().optional(),
    nativeSentence: z.string().optional(),
  }).passthrough().optional(), // passthrough in case we pass extra stuff from json
});


export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[FOUNDATION-CHAT-${requestId}] 🟢 Incoming Request`);

  try {
    const rawBody = await req.json();
    const parseResult = ChatBodySchema.safeParse(rawBody);

    if (!parseResult.success) {
      console.error(
        `[FOUNDATION-CHAT-${requestId}] ❌ Validation failed:`,
        z.flattenError(parseResult.error),
      );
      return NextResponse.json(
        { error: "Invalid request body", details: z.flattenError(parseResult.error) },
        { status: 400 },
      );
    }

    const {
      mode,
      level,
      targetLanguage,
      nativeLanguage,
      chatHistory,
      isOpening,
      freestyleData
    } = parseResult.data;

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

    // ─── DYNAMIC FOUNDATION PROMPT ─────────────────────────────
    let systemPrompt = `You are an AI language tutor conducting a specific, highly-structured roleplay simulation.
Target Language: ${targetLanguage}. Native Language: ${nativeLanguage}.

CRITICAL FORMATTING RULES:
1. You MUST respond in valid JSON with EXACTLY two keys:
   - "text": Your response in ${targetLanguage}.
   - "translation": The exact translation of your response into ${nativeLanguage}.
2. Do not wrap in markdown. Return raw JSON only.
3. NO emojis in your text (it messes up text-to-speech).

ROLEPLAY CONTEXT:
Your Persona: ${freestyleData?.persona || "A friendly conversational partner"}
`;

    if (isOpening) {
      // 🚨 FORCE THE AI TO OPEN WITH THE NPC LINE
      systemPrompt += `
      This is the very first message of the interaction.
      You MUST say exactly this line and nothing else: "${freestyleData?.npcLine}"
      Do not add your own greetings, fluff, or extra questions. Just output that exact line in JSON format.
      `;
    } else {
      // 🚨 FORCE THE AI TO BE A STRICT TUTOR FOR THE REQUIRED CHUNKS
      const chunksStr = freestyleData?.requiredChunks?.join(", ") || "";
      
      systemPrompt += `
      The user is a complete beginner (Level Zero). 
      Their mission is to say the equivalent of: "${freestyleData?.nativeSentence}"
      To succeed, they MUST use these required phrases in their response: [${chunksStr}].
      
      INSTRUCTIONS FOR YOUR RESPONSE:
      1. Analyze what the user just said. Did they use the required phrases or successfully convey the meaning?
      2. IF THEY FAILED or got stuck: DO NOT move the conversation forward. Gently prompt them in ${targetLanguage} to try again, hinting at the required words. Keep it very short.
      3. IF THEY SUCCEEDED: Act as your persona, warmly acknowledge them in 1 or 2 very short, simple sentences, and naturally conclude this brief interaction.
      `;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...sanitizedHistory,
    ];

    const apiKey = process.env.NOVITA_API_KEY;
    if (!apiKey) throw new Error("NOVITA_API_KEY is not configured.");

    console.log(`[FOUNDATION-CHAT-${requestId}] 🚀 Sending request to Novita...`);
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
          model: NovitaTextModel.QWEN_3_8_FLASH,
          messages: messages,
          response_format: { type: "json_object" },
          max_tokens: 1500, 
          temperature: isOpening ? 0.1 : 0.7 
        }),
      },
    );

    console.log(
      `[FOUNDATION-CHAT-${requestId}] ⏱️ Novita responded in ${Date.now() - startTime}ms. Status: ${chatResponse.status}`,
    );

    if (!chatResponse.ok) {
      const errText = await chatResponse.text();
      console.error(`[FOUNDATION-CHAT-${requestId}] ❌ Novita Error:`, errText);
      throw new Error(`Novita returned ${chatResponse.status}`);
    }

    const chatData = await chatResponse.json();
    const choice = chatData.choices?.[0];

    if (!choice?.message?.content) {
      throw new Error("Novita returned no message content");
    }

    if (choice.finish_reason === "length") {
      throw new Error("AI response was truncated by max_tokens");
    }

    const rawContent = choice.message.content;

    // 🚨 SAFE JSON EXTRACTION
    let parsedContent: any;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch (e) {
      console.warn(
        `[FOUNDATION-CHAT-${requestId}] ⚠️ AI didn't return perfect JSON. Attempting regex extraction...`,
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
    console.error(`[FOUNDATION-CHAT-ERROR] ❌`, error.message || error);
    return NextResponse.json(
      { error: "Failed to process foundation chat", message: error.message },
      { status: 500 },
    );
  }
}