import { NextResponse } from "next/server";
import { sendMessage, getUserScoreNew } from "@/lib/minimax/services"; // Changed import
import type { ConversationParams, ScoringParams } from "@/lib/moonshot/types";
import { textToSpeech } from "@/lib/aws/services/polly-tts-service";

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

    // Prepare params for services
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

    console.log("Starting MiniMax API calls...");
    const moonshotStart = Date.now();

    // Run Moonshot services in parallel (now only 2 calls!)
    const [aiResponse, userScore] = await Promise.all([
      sendMessage(conversationParams)
        .then((response) => {
          console.log("✅ MiniMax sendMessage SUCCESS");
          return response;
        })
        .catch((error) => {
          console.error("❌ MiniMax sendMessage FAILED:", error);
          throw error;
        }),
      getUserScoreNew(scoringParams)
        .then((response) => {
          console.log("✅ MiniMax scoring SUCCESS");
          return response;
        })
        .catch((error) => {
          console.error("❌ MiniMax scoring FAILED:", error);
          throw error;
        }),
    ]);

    const moonshotTime = Date.now() - moonshotStart;
    console.log(`🎯 ALL MiniMax CALLS COMPLETED in ${moonshotTime}ms`);

    // ✅ ADD TTS - Synthesize the AI's response (NOT the user's input)
    let audio = null;
    try {
      const ttsStart = Date.now();
      console.log("🎙️ Starting TTS synthesis for AI response...");

      const aiMessage = aiResponse.targetLanguage;
      console.log(
        `📝 TTS synthesizing AI message: "${aiMessage?.substring(0, 60)}..."`,
      );

      if (aiMessage) {
        audio = await textToSpeech(aiMessage, {
          language: targetLanguage,
          voiceGender: voiceGender,
        });

        const ttsTime = Date.now() - ttsStart;
        console.log(`✅ TTS SUCCESS - ${ttsTime}ms`);
      } else {
        console.warn("⚠️ No AI message available for TTS");
      }
    } catch (ttsError) {
      console.error("❌ TTS FAILED (non-critical):", ttsError.message);
      // Continue without audio - don't block the response
    }

    const totalTime = Date.now() - startTime;
    console.log(`=== CONVERSATION API SUCCESS - Total: ${totalTime}ms ===`);

    const responseData = {
      messageTranslation: aiResponse.userMessageTranslation, // ✅ Now comes from sendMessage
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
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`=== CONVERSATION API ERROR - Total: ${totalTime}ms ===`);
    console.error("Main error:", error?.message);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
