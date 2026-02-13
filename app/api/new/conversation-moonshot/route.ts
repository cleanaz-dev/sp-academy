// app/api/new/conversation-moonshot/route.ts
import { NextResponse } from "next/server";
import { sendMessage, getUserScoreNew } from "@/lib/moonshot/services";
import type { ConversationParams, ScoringParams, SpeechAceResults } from "@/lib/moonshot/types";
import { textToSpeech } from "@/lib/deepgram/services/tts-service";

export async function POST(req: Request) {
  console.log("=== CONVERSATION API START ===");
  const startTime = Date.now();

  try {
    const data = await req.json();
    const {
      message,
      history,
      title,
      vocabulary,
      dialogue,
      voiceGender = "female",
      targetLanguage = "fr",
      nativeLanguage = "en",
    } = data;
    // console.log("data:", data)
    // console.log("Received request data:", {
    //   messageLength: message?.length,
    //   historyLength: history?.length,
    //   title,
    //   vocabularyLength: vocabulary?.length,
    //   dialogue,
    //   voiceGender,
    //   targetLanguage,
    //   nativeLanguage
    // });

    if (!message) {
      console.error("Validation error: Message is required");
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

     const conversationParams: ConversationParams = {
      message,
      history,
      title,
      vocabulary,
      dialogue,
      targetLanguage,
      nativeLanguage,
    };

    const scoringParams: ScoringParams = {
      userMessage: message,
      recentHistory: history?.slice(-4) || [],
      targetLanguage,
      vocabulary,
      title,
    };

    console.log("Starting Moonshot API calls...");
    const moonshotStart = Date.now();

    const [aiResponse, userScore] = await Promise.all([
      sendMessage(conversationParams)
        .then((response) => {
          console.log("✅ Moonshot sendMessage SUCCESS");
          return response;
        })
        .catch((error) => {
          console.error("❌ Moonshot sendMessage FAILED:", error);
          throw error;
        }),
      getUserScoreNew(scoringParams)
        .then((response) => {
          console.log("✅ Moonshot scoring SUCCESS");
          return response;
        })
        .catch((error) => {
          console.error("❌ Moonshot scoring FAILED:", error);
          throw error;
        }),
    ]);

    const moonshotTime = Date.now() - moonshotStart;
    console.log(`🎯 ALL MOONSHOT CALLS COMPLETED in ${moonshotTime}ms`);

    // ✅ TTS Logic (Works exactly the same with the new function)
    let audio = null;
    try {
      const ttsStart = Date.now();
      console.log("🎙️ Starting Deepgram TTS synthesis for AI response...");

      const aiMessage = aiResponse.targetLanguage;
      
      if (aiMessage) {
        audio = await textToSpeech(aiMessage, {
          language: targetLanguage,
          voiceGender: voiceGender,
        });

        const ttsTime = Date.now() - ttsStart;
        console.log(`✅ Deepgram TTS SUCCESS - ${ttsTime}ms`);
      } else {
        console.warn("⚠️ No AI message available for TTS");
      }
    } catch (ttsError: any) {
      console.error("❌ TTS FAILED (non-critical):", ttsError.message);
    }

    const totalTime = Date.now() - startTime;
    console.log(`=== CONVERSATION API SUCCESS - Total: ${totalTime}ms ===`);

    const responseData = {
      messageTranslation: aiResponse.userMessageTranslation,
      targetLanguage: aiResponse.targetLanguage,
      nativeLanguage: aiResponse.nativeLanguage,
      label: userScore?.label ?? "OK",
      score: userScore?.score ?? null,
      explanation: userScore?.explanation ?? "No explanation provided.",
      improvedResponse: userScore?.improvedResponse ?? null,
      corrections: userScore?.corrections ?? "No corrections provided.",
      audio,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`=== CONVERSATION API ERROR - Total: ${totalTime}ms ===`);
    console.error("Main error:", error?.message);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}