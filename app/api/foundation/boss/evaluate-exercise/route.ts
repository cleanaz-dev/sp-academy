import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { exercise, userAnswer, isCorrect, bossPersona } = body;

    // TODO: You can hook this up to OpenAI to generate a dynamic, in-character response
    // For now, this fallback ensures the UI works and the network error goes away!
    const text = isCorrect 
      ? `Très bien ! That is correct.` 
      : `Non. The correct answer was ${exercise.correctAnswer}.`;

    return NextResponse.json({
      isCorrect,
      text
    });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}