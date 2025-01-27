// app/api/conversation-claude/route.js

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    const { message, history, title, vocabulary, dialogue, voiceGender, tutorLanguage } = data;
    console.log("Gender from API:", voiceGender);
    console.log("Tutor Language:", tutorLanguage);

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
      You are a French language conversation partner. Respond in the following format:
FRENCH: [Your French response]
ENGLISH: [English translation]

Topic: "${title}"

Original Dialogue Scenario:
${dialogue.map((d) => `${d.speaker}: ${d.french} (${d.english})`).join("\n")}

Relevant Vocabulary:
${vocabulary.map((v) => `${v.french} - ${v.english}`).join("\n")}

Previous conversation:
${history.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

User's latest message: "${message}"

User French Level: Beginner

Instructions:
- Respond as if you are the vendor/staff member from the dialogue
- Only Reply in French
- Limit to 1-2 short sentences
- Use vocabulary from the provided list when appropriate
- Stay strictly within the context of ${title} and the original dialogue scenario
- Maintain a natural, conversational tone
- Try to keep conversation flowing by asking questions`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-latest",
        max_tokens: 150,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      });

      const endTime = performance.now();
      const responseTime = (endTime - startTime) / 1000;

      console.log(`AI Response Time: ${responseTime}s`);

      const responseText = response.content[0].text;

      // Parse the response to separate French and English
      const frenchText = responseText.match(/FRENCH:\s*(.*?)(?=ENGLISH:|$)/s);
      const englishText = responseText.match(/ENGLISH:\s*(.*?)$/s);

      return {
        french: frenchText ? frenchText[1].trim() : responseText,
        english: englishText ? englishText[1].trim() : "",
      };
    };

    // Get TTS Function
    const getTextToSpeech = async (text) => {
      let voiceId;
      if (voiceGender === "male") {
        voiceId = process.env.ELEVENLABS_FRENCH_MALE_VOICE_ID;
      } else {
        voiceId = process.env.ELEVENLABS_FRENCH_FEMALE_VOICE_ID;
      }

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
              language: "fr",
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
    const ttsResponse = await getTextToSpeech(aiResponse.french);
    const audioData = await ttsResponse.arrayBuffer();

    console.log("French translation:", aiResponse.french);
    console.log("English translation:", aiResponse.english);

    return NextResponse.json({
      french: aiResponse.french,
      english: aiResponse.english,
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
