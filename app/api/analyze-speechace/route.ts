// app/api/analyze-speechace/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    
    const audioFile = formData.get("audio");
    const text = formData.get("transcript");
    const dialect = formData.get("dialect") || "fr-FR";
    // conversationRecordId is available if you need to save it to DB later
    // const conversationRecordId = formData.get("conversationRecordId");

    if (!audioFile || !text) {
      return NextResponse.json(
        { error: "Missing audio or transcript" },
        { status: 400 },
      );
    }

    const apiFormData = new FormData();
    apiFormData.append("user_audio_file", audioFile);
    apiFormData.append("text", text);
    apiFormData.append("include_fluency", "1"); 
    // "no_mc" is useful if your text has multiple sentences/lines
    apiFormData.append("no_mc", "1"); 

    const apiKey = process.env.SPEECHACE_API_KEY;
    // v9 endpoint is correct
    const apiUrl = `https://api.speechace.co/api/scoring/text/v9/json?key=${apiKey}&dialect=${dialect}&user_id=${userId}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      body: apiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ SpeechAce API error:", errorText);
      throw new Error(`SpeechAce API error: ${response.status}`);
    }

    const result = await response.json();

    // 🔍 DEBUG: Log the structure if you are unsure
    console.log("SpeechAce Result:", JSON.stringify(result, null, 2));

    // ✅ FIX 1: word_score_list is inside text_score
    const textScore = result.text_score; 
    const wordList = textScore?.word_score_list || [];

    const words = wordList.map((word: any) => ({
      word: word.word,
      quality_score: word.quality_score, 
      phone_score_list: word.phone_score_list, 
      syllable_score_list: word.syllable_score_list,
      // stress_level often comes inside syllable_score_list, but sometimes at word level depending on dialect
      stress_level: word.stress_level, 
      sound_most_like: word.sound_most_like, 
    }));

    const pronunciationScore = {
      // ✅ FIX 2: v9 structure for overall score
      score: textScore?.speechace_score?.pronunciation ?? 0,
      
      // Note: CEFR is sometimes derived or explicitly returned as "ielts_score" or "pte_score" in v9. 
      // If "cefr_score" is missing, you might need to map it manually or check "ielts_score".
      cerf_score: textScore?.cefr_score?.pronunciation, 
      
      words, 
      overall_fluency: textScore?.speechace_score?.fluency,
    };

    return NextResponse.json(pronunciationScore);

  } catch (error) {
    console.error("❌ SpeechAce API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}