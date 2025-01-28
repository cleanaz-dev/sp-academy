//api/conversation/text-to-speech/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("Received Data:", data);

    const { text, voiceGender, targetLanguage } = data; // Fixed typo in targetLanguage

    // Validate input
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { message: "Invalid input. 'text' is required and must be a string." },
        { status: 400 }
      );
    }

    // Log the received language and gender
    console.log("Target Language:", targetLanguage);
    console.log("Voice Gender:", voiceGender);

    const voices = {
      fr: {
        male: process.env.ELEVENLABS_FRENCH_MALE_VOICE_ID,
        female: process.env.ELEVENLABS_FRENCH_FEMALE_VOICE_ID,
      },
      es: {
        male: process.env.ELEVENLABS_SPANISH_MALE_VOICE_ID,
        female: process.env.ELEVENLABS_SPANISH_FEMALE_VOICE_ID,
      },
      // Add more languages as needed
    };

    // Get voice ID with better error handling
    const selectedVoices = voices[targetLanguage] || voices.fr; // fallback to French
    const voiceId = selectedVoices[voiceGender] || selectedVoices.female; // fallback to female

    console.log("Selected Voice ID:", voiceId);

    const ttsResponse = await fetch( // Changed variable name from response to ttsResponse
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            language: targetLanguage || 'fr', // Use the target language here
            use_speaker_boost: true,
          },
          optimize_streaming_latency: 3,
        }),
      }
    );

    // Log the response for debugging
    console.log("TTS API Response Status:", ttsResponse.status);

    if (!ttsResponse.ok) {
      const errorDetails = await ttsResponse.text();
      console.error("TTS API Error Details:", errorDetails);
      return NextResponse.json(
        { message: `TTS API Error: ${errorDetails}` },
        { status: ttsResponse.status }
      );
    }

    // Convert audio stream to base64
    const audioData = await ttsResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioData).toString("base64");

    console.log("Successfully processed Text-to-Speech request.");

    return NextResponse.json({ audio: audioBase64 }, { status: 200 });
  } catch (error) {
    console.error("Error processing Text-to-Speech request:", error);
    return NextResponse.json(
      { message: "Error processing request. Please try again." },
      { status: 500 }
    );
  }
}