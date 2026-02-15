import { NextResponse } from "next/server";
import { sendMessage } from "@/lib/groq/services"; // changed to groq from moonshot
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
      messageTranslation: aiResponse.userMessageTranslation, // We get translation here too
      targetLanguage: aiResponse.targetLanguage,
      nativeLanguage: aiResponse.nativeLanguage,
      audio,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}