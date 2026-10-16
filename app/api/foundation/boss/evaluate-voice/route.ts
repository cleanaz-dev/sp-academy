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
      The Azure pronunciation system evaluated their speech and marked them: ${isCorrect ? "PASS" : "FAIL"}.
      (They were heard saying: "${userText}")
      
      Give a VERY SHORT (1-2 sentences max) in-character reaction. 
      ${isCorrect ? "Praise them briefly in your persona." : "Scold them slightly, tell them their pronunciation is poor, and tell them to try again."}
      Write it in French, followed by the English translation in parentheses.
    `;

    const completion = await groq.chat.completions.create({
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