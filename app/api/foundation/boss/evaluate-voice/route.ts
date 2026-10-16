import { NextResponse } from "next/server";
import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1" 
});

export async function POST(req: Request) {
  try {
    // Notice we accept "isCorrect" here! Azure graded it before hitting this endpoint.
    const { exercise, userText, isCorrect, bossPersona } = await req.json();

    const prompt = `
      You are ${bossPersona?.name || "a strict French teacher"}. 
      Persona: ${bossPersona?.persona || "Strict but fair."}
      
      The student was asked to speak the phrase: "${exercise.targetText || "bonjour"}"
      The Speech-To-Text AI transcribed what they said as: "${userText}"
      The pronunciation system evaluated their speech and marked them: ${isCorrect ? "PASS" : "FAIL"}.
      
      CRITICAL INSTRUCTIONS:
      1. French has many homophones (e.g., "enchanté" vs "enchantée", "est" vs "et"). The STT often guesses the wrong spelling even if the user's pronunciation was FLAWLESS. 
      2. YOU MUST NEVER penalize the user or mention a spelling difference if the words sound the same.
      3. If the transcribed text is functionally identical or just a homophone, treat it as a brilliant success. Do NOT mention the spelling difference.
      
      Give a VERY SHORT (1-2 sentences max) in-character reaction. 
      ${isCorrect ? "Praise them briefly in your persona." : "Scold them slightly, tell them their pronunciation needs work, and tell them to try again."}
      Write it in French, followed by the English translation in parentheses.
    `;

    const completion = await groq.chat.completions.create({
      // Note: If 'openai/gpt-oss-20b' throws a model error on Groq, 
      // swap this to 'llama3-8b-8192' or 'llama-3.1-8b-instant'
      model: "openai/gpt-oss-20b", 
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({
      isCorrect,
      text: completion.choices[0].message.content?.trim() || (isCorrect ? "Bien." : "Non.")
    });

  } catch (error) {
    console.error("Evaluate Voice Error:", error);
    return NextResponse.json({ isCorrect: false, text: "Je n'ai pas compris." });
  }
}