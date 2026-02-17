import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. AUTH & INPUT PARSING
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio");
    const text = formData.get("transcript") as string;
    const dialect = formData.get("dialect") || "fr-FR";
    const conversationId = formData.get("conversationId") as string; // Ensure frontend sends this

    if (!audioFile || !text) {
      return NextResponse.json(
        { error: "Missing audio or transcript" },
        { status: 400 },
      );
    }

    // 2. CALL SPEECHACE API (v9)
    const apiFormData = new FormData();
    apiFormData.append("user_audio_file", audioFile);
    apiFormData.append("text", text);
    apiFormData.append("include_fluency", "1");
    apiFormData.append("no_mc", "1"); // Indicates multiple sentences/lines allowed

    const apiKey = process.env.SPEECHACE_API_KEY;
    const apiUrl = `https://api.speechace.co/api/scoring/text/v9/json?key=${apiKey}&dialect=${dialect}&user_id=${clerkUserId}`;

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

    // 3. PARSE SPEECHACE v9 RESPONSE
    const textScore = result.text_score;
    const wordList = textScore?.word_score_list || [];

    // Map words for frontend
    const words = wordList.map((word: any) => ({
      word: word.word,
      quality_score: word.quality_score,
      phone_score_list: word.phone_score_list,
      syllable_score_list: word.syllable_score_list,
      stress_level: word.stress_level,
      sound_most_like: word.sound_most_like,
    }));

    // v9 uses text_score.speechace_score.pronunciation for the main score
    const mainScore = textScore?.speechace_score?.pronunciation ?? textScore?.quality_score ?? 0;
    
    const pronunciationScore = {
      score: mainScore,
      // CEFR is often inside speechace_score or at root of text_score depending on exact call
      cefr_score: textScore?.cefr_score?.pronunciation ?? textScore?.cefr_score ?? "N/A",
      words,
      overall_fluency: textScore?.speechace_score?.fluency,
    };

    // 4. DATABASE SAVING LOGIC (ConversationReview)
    // We save if score is < 85 (Needs Improvement) OR if it's explicitly tracked
    const shouldSave = mainScore < 85; 

    if (shouldSave && conversationId && clerkUserId) {
      // A. Find Internal User ID (Fixes the Invalid ObjectID error)
      const dbUser = await prisma.user.findFirst({
        where: { userId: clerkUserId },
        select: { id: true },
      });

      if (dbUser) {
        // B. Determine Label based on score
        let label = "Poor";
        if (mainScore >= 90) label = "Excellent";
        else if (mainScore >= 80) label = "Good";
        else if (mainScore >= 70) label = "OK";

        // C. Create the Mistake Object (Matching your schema)
        const newMistake = {
          id: crypto.randomUUID(),
          type: "PRONUNCIATION",
          original: text,
          improved: null, // Pronunciation doesn't have "improved text"
          explanation: `Pronunciation Score: ${mainScore}/100`,
          score: mainScore,
          label: label,
          // We save the full word breakdown so the tooltip can render colors later
          corrections: { words: words }, 
          timestamp: new Date().toISOString(),
        };

        // D. Upsert to Database
        await prisma.conversationReview.upsert({
          where: { conversationId: conversationId },
          create: {
            userId: dbUser.id, // Internal ID
            conversationId,
            mistakes: [newMistake],
          },
          update: {
            mistakes: {
              push: newMistake,
            },
          },
        });
        
        console.log(`Saved ${label} pronunciation attempt (${mainScore}) for user ${dbUser.id}`);
      } else {
        console.warn(`Could not find internal user for Clerk ID: ${clerkUserId}`);
      }
    }

    return NextResponse.json(pronunciationScore);

  } catch (error) {
    console.error("❌ SpeechAce API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}