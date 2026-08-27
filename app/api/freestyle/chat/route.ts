// app/api/freestyle/chat/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      mode, 
      topic, 
      targetLanguage, 
      nativeLanguage, 
      chatHistory, 
      isOpening 
    } = body;

    // 1. Build the e-learning focused system prompt
    let systemPrompt = `You are an expert, highly encouraging language tutor leading a fast-paced, 3-minute freestyle speaking challenge. 
The user is practicing their conversational fluency in ${targetLanguage}. Their native language is ${nativeLanguage}.

YOUR PERSONA & STRICT INSTRUCTIONS:
1. Speak STRICTLY and EXCLUSIVELY in ${targetLanguage}.
2. Keep your responses natural, conversational, and brief (1 to 3 sentences maximum). This is a rapid-fire verbal exercise; long paragraphs ruin the flow.
3. ABSOLUTELY NO emojis, markdown, bullet points, brackets, or special characters. Your text will be read aloud by a Text-to-Speech (TTS) engine, and symbols sound broken.
4. Never break character. Never say "As an AI..." or apologize excessively. 
5. Always end your turn with EXACTLY ONE clear, engaging open-ended question to force the user to think on their feet and keep speaking.`;

    if (isOpening) {
      if (mode === "INTRODUCTION") {
        systemPrompt += `\n\nCURRENT TASK: Kick off the session. Give a warm, friendly greeting, introduce yourself as their conversation partner, and ask an easy, welcoming question about their day or why they are learning the language to get them warmed up.`;
      } else if (mode === "SPECIFIC") {
        systemPrompt += `\n\nCURRENT TASK: Start a roleplay or targeted discussion specifically about this topic: "${topic}". Dive immediately into the scenario. Set the scene naturally in one sentence, and ask a highly relevant question to prompt the user's first response.`;
      } else if (mode === "RANDOM") {
        systemPrompt += `\n\nCURRENT TASK: Spark a spontaneous, interesting conversation. Ask a fun, unique, or slightly philosophical open-ended question (e.g., about travel, future technology, food culture, or daily habits) that requires more than a simple yes/no answer.`;
      } else if (mode === "ARGUMENTATIVE") {
        systemPrompt += `\n\nCURRENT TASK: Initiate a lively, friendly debate. Make a bold, somewhat controversial (but polite) claim about a random everyday topic (e.g., "Coffee is highly overrated", or "Working from home is terrible for productivity") and challenge the user to defend their opinion against yours.`;
      }
    }

    // 2. Format the chat history
    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map((m: any) => ({
        role: m.role, // 'user' or 'assistant'
        content: m.text,
      })),
    ];

    const apiKey = process.env.NOVITA_API_KEY;
    if (!apiKey) {
      throw new Error("NOVITA_API_KEY is not configured.");
    }

    // 3. Raw fetch call for the main chat response
    const chatResponse = await fetch("https://api.novita.ai/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "zai-org/glm-5.3-flash",
        messages: messages,
        response_format: { type: "text" },
        max_tokens: 65536,
        temperature: 1,
        top_p: 1,
        min_p: 0,
        top_k: 50,
        presence_penalty: 0,
        frequency_penalty: 0,
        repetition_penalty: 1
      }),
    });

    if (!chatResponse.ok) {
      const errText = await chatResponse.text();
      console.error("Novita Chat Error Response:", errText);
      throw new Error("Failed to get chat completion from Novita");
    }

    const chatData = await chatResponse.json();
    const aiText = chatData.choices?.[0]?.message?.content || "";

    // 4. Raw fetch call for the translation subtitle (Upgraded Prompt)
    const translationPrompt = `You are a professional linguistic translator for an e-learning platform. 
Translate the following ${targetLanguage} text into natural, conversational ${nativeLanguage}. 
Keep the exact tone, warmth, and intent of the original text. Do NOT add any notes, explanations, or quotes. Return ONLY the final translated string.`;

    const translationResponse = await fetch("https://api.novita.ai/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "zai-org/glm-5.3-flash",
        messages: [
          { role: "system", content: translationPrompt },
          { role: "user", content: aiText }
        ],
        response_format: { type: "text" },
        max_tokens: 65536,
        temperature: 0.3, // Lower for translation accuracy
        top_p: 1,
        min_p: 0,
        top_k: 50,
        presence_penalty: 0,
        frequency_penalty: 0,
        repetition_penalty: 1
      }),
    });

    if (!translationResponse.ok) {
      const errText = await translationResponse.text();
      console.error("Novita Translation Error Response:", errText);
      throw new Error("Failed to get translation from Novita");
    }

    const translationData = await translationResponse.json();
    const translation = translationData.choices?.[0]?.message?.content || "";

    // Return to frontend
    return NextResponse.json({ 
      text: aiText, 
      translation 
    });

  } catch (error: any) {
    console.error("Freestyle Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat response" },
      { status: 500 }
    );
  }
}