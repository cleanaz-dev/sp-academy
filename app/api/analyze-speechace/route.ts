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
    const conversationRecordId = formData.get("conversationRecordId");

    if (!audioFile || !text) {
      return NextResponse.json(
        { error: "Missing audio or transcript" },
        { status: 400 },
      );
    }

    const apiFormData = new FormData();
    apiFormData.append("user_audio_file", audioFile);
    apiFormData.append("text", text);
    apiFormData.append("include_fluency", "1"); // ✅ Valid parameter

    const apiKey = process.env.SPEECHACE_API_KEY;
    const apiUrl = `https://api.speechace.co/api/scoring/text/v9/json?key=${apiKey}&dialect=${dialect}&user_id=${userId}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: apiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ SpeechAce API error:", errorText);
      throw new Error(`SpeechAce API error: ${response.status}`);
    }

    const result = await response.json();

    // 🔥 EXTRACT WORD-LEVEL SCORES (Already in the response!)
    const words = result.word_score_list?.map((word: any) => ({
      word: word.word,
      quality_score: word.quality_score, // 0-100 score
      phone_score_list: word.phone_score_list, // Phoneme-level scores
      syllable_score_list: word.syllable_score_list,
      stress_level: word.stress_level,
      sound_most_like: word.sound_most_like, // What they actually said
    })) || [];

    const pronunciationScore = {
      score: result.text_score?.speechace_score?.pronunciation,
      cerf_score: result.text_score?.cefr_score?.pronunciation,
      words, // 🔥 Word-level data
      overall_fluency: result.text_score?.speechace_score?.fluency,
    };

    console.log("📦 Word scores:", words);

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