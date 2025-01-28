// app/api/conversation-claude/route.js

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("data from Claude API:", data);
    const {
      message,
      history,
      title,
      vocabulary,
      dialogue,
      voiceGender,

      targetLanguage = "fr", // default to French
      nativeLanguage = "en", // default to English
    } = data;

    console.log("Gender from API:", voiceGender);
    console.log("Target Language:", targetLanguage);
    console.log("Native Language:", nativeLanguage);

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // AI Response Function
    const getAIResponse = async () => {
      const startTime = performance.now();

      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const systemPrompt = `
      You are a ${targetLanguage} language conversation partner. 
      
      Respond using EXACTLY this format with these symbols:
      ➤ [Your response in ${targetLanguage}]
      ⟿ [Translation in ${nativeLanguage}]
      
      Topic: "${title}"
      
      Original Dialogue Scenario:
      ${dialogue
        .map((d) => `${d.speaker}: ${d.targetLanguage} (${d.nativeLanguage})`)
        .join("\n")}
      
      Relevant Vocabulary:
      ${vocabulary
        .map((v) => `${v.targetLanguage} - ${v.nativeLanguage}`)
        .join("\n")}
      
      Previous conversation:
      ${history.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}
      
      User's latest message: "${message}"
      
      User Language Level: Beginner
      
      Instructions:
      - Respond as if you are the vendor/staff member from the dialogue
      - Use EXACTLY the symbols ➤ and ⟿ to separate languages
      - Limit to 1-2 short sentences
      - Use vocabulary from the provided list when appropriate
      - Stay strictly within the context of ${title}
      - Maintain a natural, conversational tone
      - Try to keep conversation flowing by asking questions`;

      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 250,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      });

      const endTime = performance.now();
      const responseTime = (endTime - startTime) / 1000;
      console.log(`AI Response Time: ${responseTime}s`);

      const responseText = response.content[0].text;

      // Parse the response to separate target and native language
      // Parse using symbols
      const targetText = responseText.match(/➤\s*(.*?)(?=⟿|$)/s);
      const nativeText = responseText.match(/⟿\s*(.*?)$/s);

      return {
        targetLanguage: targetText ? targetText[1].trim() : responseText,
        nativeLanguage: nativeText ? nativeText[1].trim() : "",
      };
    };

    // Get TTS Function with language-specific voices
    const getTextToSpeech = async (text) => {
      // Voice mapping object
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

      const voiceId =
        voices[targetLanguage]?.[voiceGender] || voices.fr[voiceGender]; // fallback to French

      const response = await fetch(
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
              language: targetLanguage,
              use_speaker_boost: true,
            },
            optimize_streaming_latency: 3,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("TTS failed");
      }

      return response;
    };

    // Run AI response in parallel with any other tasks
    const [aiResponse] = await Promise.all([
      getAIResponse(),
      // Add other parallel tasks here if needed
    ]);

    // Get TTS stream
    const ttsResponse = await getTextToSpeech(aiResponse.targetLanguage);
    const audioData = await ttsResponse.arrayBuffer();

    console.log("Target language response:", aiResponse.targetLanguage);
    console.log("Native language translation:", aiResponse.nativeLanguage);

    return NextResponse.json({
      targetLanguage: aiResponse.targetLanguage,
      nativeLanguage: aiResponse.nativeLanguage,
      audio: Buffer.from(audioData).toString("base64"),
    });
  } catch (error) {
    console.error("Conversation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
