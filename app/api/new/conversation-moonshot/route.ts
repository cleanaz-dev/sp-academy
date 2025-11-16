// app/api/new/conversation-moonshot/route.ts
import { NextResponse } from "next/server";
import { 
  sendMessage, 
  getUserScore, 
  getMessageTranslation 
} from '@/lib/moonshot/services';
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

    console.log("Received request data:", {
      messageLength: message?.length,
      historyLength: history?.length,
      title,
      vocabularyLength: vocabulary?.length,
      dialogue,
      voiceGender,
      targetLanguage,
      nativeLanguage
    });

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

    console.log("Starting Moonshot API calls...");
    const moonshotStart = Date.now();

    // Run Moonshot services in parallel
    const [aiResponse, translationResponse, userScore] = await Promise.all([
      sendMessage(conversationParams).then(response => {
        console.log("✅ Moonshot sendMessage SUCCESS");
        return response;
      }).catch(error => {
        console.error("❌ Moonshot sendMessage FAILED:", error);
        throw error;
      }),
      
      getMessageTranslation({message, nativeLanguage}).then(response => {
        console.log("✅ Moonshot translation SUCCESS");
        return response;
      }).catch(error => {
        console.error("❌ Moonshot translation FAILED:", error);
        throw error;
      }),
      
      getUserScore(scoringParams).then(response => {
        console.log("✅ Moonshot scoring SUCCESS");
        return response;
      }).catch(error => {
        console.error("❌ Moonshot scoring FAILED:", error);
        throw error;
      }),
    ]);

    const moonshotTime = Date.now() - moonshotStart;
    console.log(`🎯 ALL MOONSHOT CALLS COMPLETED in ${moonshotTime}ms`);

    // ✅ ADD TTS - Synthesize the AI's response (NOT the user's input)
    let audio = null;
    try {
      const ttsStart = Date.now();
      console.log("🎙️ Starting TTS synthesis for AI response...");
      
      // EXPLICIT: Use the AI's message that we're sending back to the user
      const aiMessage = aiResponse.targetLanguage; // This is what the AI says to the user
      console.log(`📝 TTS synthesizing AI message: "${aiMessage?.substring(0, 60)}..."`);
      
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
      messageTranslation: translationResponse.messageTranslation,
      targetLanguage: aiResponse.targetLanguage,
      nativeLanguage: aiResponse.nativeLanguage,
      label: userScore?.label ?? "OK",
      score: userScore?.score ?? null,
      explanation: userScore?.explanation ?? "No explanation provided.",
      improvedResponse: userScore?.improvedResponse ?? null,
      corrections: userScore?.corrections ?? "No corrections provided.",
      audio, // ✅ Contains base64 audio of the AI's message, or null
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