import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    console.log("formData:", formData)
    
    // Match what analyzeSpeechAce sends: "audio" and "transcript"
    const audioFile = formData.get("audio");
    const text = formData.get("transcript");
    const dialect = formData.get("dialect") || "fr-FR";
    const conversationRecordId = formData.get("conversationRecordId");

    console.log("📝 SpeechAce request:", { 
      hasAudio: !!audioFile, 
      textLength: text?.length,
      dialect,
      conversationRecordId
    });

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 },
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: "No transcript provided" },
        { status: 400 },
      );
    }

    const apiFormData = new FormData();
    apiFormData.append("user_audio_file", audioFile);
    apiFormData.append("text", text);
    apiFormData.append("include_fluency", "1")

    const apiKey = process.env.SPEECHACE_API_KEY;
    const apiUrl = `https://api.speechace.co/api/scoring/text/v9/json?key=${apiKey}&dialect=${dialect}&user_id=${userId}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: apiFormData,
    });

    console.log("🎯 SpeechAce Response Status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ SpeechAce API error:", errorText);
      throw new Error(`SpeechAce API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    // console.log("result:", JSON.stringify(result, null, 2));


    console.log("📦 SpeechAce Pronunciation Score:", result.text_score?.speechace_score.pronunciation)
    console.log("📦 SpeechAce CERF Score:", result.text_score?.cefr_score.pronunciation)
    const pronunciationScore = {
      score: result.text_score?.speechace_score.pronunciation,
      cerf_score: result.text_score?.cefr_score.pronunciation
    }

    return NextResponse.json(pronunciationScore);
  } catch (error) {
    console.error("❌ SpeechAce API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}