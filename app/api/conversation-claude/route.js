//api/conversation-claude/route.js

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    const {
      message,
      history,
      title,
      vocabulary,
      dialogue,
      voiceGender,
      targetLanguage = "fr",
      nativeLanguage = "en",
    } = data;

    console.log("Gender from API:", voiceGender);
    console.log("Target Language:", targetLanguage);
    console.log("Native Language:", nativeLanguage);
    console.log("User Message:", message);
    console.log("Title:", title);
    console.log("History:", history);

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
      You are a ${targetLanguage} language conversation partner for ABSOLUTE BEGINNERS.
      
      Key rules for beginner-level responses:
      - Use only basic present tense
      - Maximum 5-6 words per sentence
      - Use only common, basic vocabulary
      - ALWAYS end with a simple question
      - Keep the conversation flowing

      Response format MUST be:
      ➤ [Your response in ${targetLanguage}]
      ⟿ [Translation in ${nativeLanguage}]

      Example:
      ➤ Bonjour, comment ça va ?
      ⟿ Hello, how are you?

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

      **Important Rules:**
      - Use VERY simple language suitable for beginners
      - Keep sentences extremely short and basic
      - Use only present tense
      - ALWAYS include a simple question
      - Prefer yes/no questions
      - Use mostly words from the vocabulary list
      - Response pattern: Short statement + Simple question
      - **Do not add extra text or explanations. Only return the two lines following the correct format.**`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-latest",
        max_tokens: 1500,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      });

      const endTime = performance.now();
      console.log(`AI Response Time: ${(endTime - startTime) / 1000}s`);

      const responseText = response.content[0].text;

      // Improved parsing with regex
      const targetMatch = responseText.match(/➤\s*(.*?)(?=\n|⟿|$)/s);
      const nativeMatch = responseText.match(/⟿\s*(.*?)(?=\n|$)/s);

      return {
        targetLanguage: targetMatch ? targetMatch[1].trim() : responseText,
        nativeLanguage: nativeMatch ? nativeMatch[1].trim() : "",
      };
    };

    const getUserScore = async (userMessage, history, targetLanguage, vocabulary, title) => {
      
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
      console.log("Scoring user response:", userMessage);
    
      // Slice history to the last 4 messages
      const recentHistory = history.slice(-4);
    
      const systemPrompt = `
      You are a language tutor grading a student's response in ${targetLanguage}.
      
      First, review the chat history to understand the context of the conversation based on the title: ${title}
      Then grade the student's response (1-10) based on:
      - Whether it is an appropriate response to the conversation (CRITICAL)
      - Grammar and vocabulary usage
      - Use of suggested vocabulary
      
      Scoring Guidelines:
      - Scores 1-2 (Poor): Off-topic or irrelevant to the conversation context
      - Scores 3-4 (Fair): Somewhat relevant but with major issues
      - Scores 5-6 (Good): Relevant with some minor issues
      - Scores 7-8 (Very Good): Relevant and mostly correct
      - Scores 9-10 (Excellent): Perfectly relevant and correct
      
      Remember:
      - If the response is off-topic or doesn't fit the conversation context, score MUST be 1 or 2 regardless of grammar
      - Consider that the student is a beginner
      - Context relevance is the first priority
      
      **Format your response strictly as follows:**
      Score: [number]
      Explanation: [brief reason]
      Improved Response: [better version if needed, otherwise say "No improvement needed"]
      
      ---
      **Recent Chat History (last 4 messages for context)**  
      ${recentHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}
      
      **Student's Response:** "${userMessage}"
      **Suggested Vocabulary:**  
      ${vocabulary.map((v) => `${v.targetLanguage} - ${v.nativeLanguage}`).join("\n")}
      `;
    
      console.log("Sending prompt to Claude for scoring...");
      console.log("Recent History Sent:", recentHistory);
    
      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });
    
      const responseText = response.content[0].text;
      console.log("Claude's raw response for scoring:", responseText);
    
      // Extract score, explanation, and improved response
      const scoreMatch = responseText.match(/Score:\s*(\d+)/);
      const explanationMatch = responseText.match(/Explanation:\s*(.*?)(?=\n|$)/s);
      const improvedMatch = responseText.match(/Improved Response:\s*(.*?)(?=\n|$)/s);
    
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
      const explanation = explanationMatch ? explanationMatch[1].trim() : "No explanation provided.";
      const improvedResponse = improvedMatch ? improvedMatch[1].trim() : "No improvement needed.";
       
      // Map numerical scores to qualitative labels
      let label = "OK";
      if (score >= 9) label = "Excellent";
      else if (score >= 7) label = "Great";
      else if (score >= 5) label = "Good";
      else if (score >= 3) label = "OK";
      else label = "Poor";
    
      // Determine whether a suggestion is needed
      const shouldSuggest = score <= 6 && improvedResponse !== "No improvement needed.";
    
      return { score, label, explanation, improvedResponse: shouldSuggest ? improvedResponse : null };
    };
    
    

    const getMessageTranslation = async (message, nativeLanguage) => {
      try {
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const prompt = `Translate "${message}" into ${nativeLanguage}, output translation only.`;

        const response = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 500,
          messages: [{ role: "user", content: prompt }],
        });

        return {
          messageTranslation: response.content[0].text,
        };
      } catch (error) {
        console.error("Error fetching translation:", error);
        return { messageTranslation: null, error: error.message };
      }
    };

    // Run AI response and scoring in parallel
    const [aiResponse, translationResponse, userScore] = await Promise.all([
      getAIResponse(),
      getMessageTranslation(message, nativeLanguage),
      getUserScore(message, history, targetLanguage, vocabulary), // Now passing the sliced history!
    ]);
    

    // Get TTS Function
    const getTextToSpeech = async (text) => {
      const voices = {
        fr: {
          male: process.env.ELEVENLABS_FRENCH_MALE_VOICE_ID,
          female: process.env.ELEVENLABS_FRENCH_FEMALE_VOICE_ID,
        },
        es: {
          male: process.env.ELEVENLABS_SPANISH_MALE_VOICE_ID,
          female: process.env.ELEVENLABS_SPANISH_FEMALE_VOICE_ID,
        },
      };

      const voiceId =
        voices[targetLanguage]?.[voiceGender] || voices.fr[voiceGender];

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

    // Fetch TTS
    const ttsResponse = await getTextToSpeech(aiResponse.targetLanguage);
    const audioData = await ttsResponse.arrayBuffer();

    return NextResponse.json({
      messageTranslation: translationResponse.messageTranslation,
      targetLanguage: aiResponse.targetLanguage,
      nativeLanguage: aiResponse.nativeLanguage,
      label: userScore?.label?? "OK", 
      score: userScore?.score ?? null,
      explanation: userScore?.explanation ?? "No explanation provided.",
      improvedResponse: userScore?.improvedResponse ?? null, 
      audio: audioData ? Buffer.from(audioData).toString("base64") : null, 
    });
  } catch (error) {
    console.error("Conversation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
