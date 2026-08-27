import { NextResponse } from "next/server";

export const maxDuration = 60; // Tells Vercel to allow up to 60s if on Pro

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[CHAT-${requestId}] 🟢 Incoming Request`);

  try {
    const body = await req.json();
    const { mode, topic, targetLanguage, nativeLanguage, chatHistory, isOpening } = body;
    
    console.log(`[CHAT-${requestId}] Params: Mode=${mode}, Target=${targetLanguage}, Native=${nativeLanguage}`);

    // 1. Build a prompt that FORCES a JSON response
    let systemPrompt = `You are a conversational language tutor leading a fast-paced speaking challenge. 
Target Language: ${targetLanguage}. Native Language: ${nativeLanguage}.

CRITICAL RULES:
1. You MUST respond in a valid JSON format with EXACTLY two keys:
   - "text": Your response in ${targetLanguage} (Keep it short! 1-3 sentences max. NO emojis. Always end with a question).
   - "translation": The exact translation of your response into ${nativeLanguage}.
2. Do not include markdown blocks like \`\`\`json. Just return the raw JSON object.`;

    if (isOpening) {
      if (mode === "INTRODUCTION") systemPrompt += `\nTASK: Introduce yourself warmly and ask an easy warm-up question.`;
      else if (mode === "SPECIFIC") systemPrompt += `\nTASK: Start a roleplay about: "${topic}". Set the scene and ask a question.`;
      else if (mode === "RANDOM") systemPrompt += `\nTASK: Ask a unique, thought-provoking open-ended question.`;
      else if (mode === "ARGUMENTATIVE") systemPrompt += `\nTASK: Make a controversial statement and challenge them to debate you.`;
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
        model: "zai-org/glm-5.3-flash",
        messages: messages,
        response_format: { type: "json_object" }, // FORCE JSON
        max_tokens: 4000,
        temperature: 0.8,
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

    // Parse the JSON returned by the AI
    let parsedContent;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch (e) {
      console.warn(`[CHAT-${requestId}] ⚠️ AI didn't return perfect JSON. Attempting cleanup...`);
      // Fallback if the AI decided to wrap it in markdown anyway
      const cleaned = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedContent = JSON.parse(cleaned);
    }

    console.log(`[CHAT-${requestId}] ✅ Success. Text: "${parsedContent.text.substring(0, 30)}..."`);

    return NextResponse.json({ 
      text: parsedContent.text, 
      translation: parsedContent.translation 
    });

  } catch (error: any) {
    console.error(`[CHAT-ERROR] ❌`, error.message || error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}