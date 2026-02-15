import { NextResponse } from "next/server";
import { sendMessage } from "@/lib/groq/services";
import { textToSpeech } from "@/lib/deepgram/services/tts-service";

export async function POST(req: Request) {
  try {
    const { message, history, targetLanguage, voiceGender, nativeLanguage, dialogue, title, vocabulary } = await req.json();

    // 1. Get AI Response (Fastest part)
    const aiResponse = await sendMessage({
      message,
      history,
      targetLanguage,
      nativeLanguage,
      dialogue, 
      title,
      vocabulary
    });

    // 2. Generate Audio (Deepgram is fast)
    let audio = null;
    if (aiResponse.targetLanguage) {
      try {
        audio = await textToSpeech(aiResponse.targetLanguage, {
          language: targetLanguage,
          voiceGender: voiceGender || "female",
        });
      } catch (e) {
        console.error("TTS Failed", e);
      }
    }

    return NextResponse.json({
      messageTranslation: aiResponse.userMessageTranslation,
      targetLanguage: aiResponse.targetLanguage,
      nativeLanguage: aiResponse.nativeLanguage,
      audio,
    });
  } catch (error) {
    // Proper error handling for TypeScript
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("API Route Error:", {
      message: errorMessage,
      stack: errorStack,
      error: error
    });
    
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
  }
}