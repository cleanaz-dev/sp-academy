import { NextResponse } from "next/server";
import OpenAI from "openai";

// NOTE: To use Groq, just add: baseURL: "https://api.groq.com/openai/v1" 
// and change the model to "llama3-8b-8192"
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1" 
});

export async function POST(req: Request) {
  try {
    const { exercise, userAnswer, isCorrect, bossPersona } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        isCorrect,
        text: isCorrect ? "Bien." : `Non. La réponse est: ${exercise.correctAnswer}`
      });
    }

    const prompt = `
      You are ${bossPersona?.name || "a strict French teacher"}. 
      Your persona: ${bossPersona?.persona || "Strict but fair."}
      
      The student just completed a grammar/vocabulary exercise. 
      Their answer was mathematically marked as: ${isCorrect ? "CORRECT" : "INCORRECT"}.
      ${!isCorrect ? `The actual correct answer was: ${exercise.correctAnswer}.` : ""}
      
      Give a VERY SHORT (1-2 sentences max) reaction to the student in character. 
      Write it in French, followed by the English translation in parentheses.
    `;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b", // super fast and cheap
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({
      isCorrect,
      text: completion.choices[0].message.content?.trim() || "Bien."
    });

  } catch (error) {
    console.error("Evaluate Exercise Error:", error);
    return NextResponse.json({ isCorrect: false, text: "Erreur de réseau." });
  }
}