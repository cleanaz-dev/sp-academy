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

    // Debugging Logs
    // console.log("Gender from API:", voiceGender);
    // console.log("Target Language:", targetLanguage);
    // console.log("Native Language:", nativeLanguage);
    // console.log("User Message:", message);
    // console.log("Title:", title);
    // console.log("History:", history);

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

    const getUserScore = async (
      userMessage,
      history,
      targetLanguage,
      vocabulary,
      title
    ) => {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      console.log("Scoring user response:", userMessage);

      // Slice history to the last 4 messages
      const recentHistory = history.slice(-4);

      const systemPrompt = `
      You are a language tutor grading a student's response in ${targetLanguage}.
      
      First, review the chat history to understand the context of the conversation based on the title: "${title}".
      
      Student is at a Beginner level, first message is usally a greeting, so score should reflect.

      Then, grade the student's response (1-10) based on:
      - Whether it is an appropriate response to the conversation (CRITICAL)
      - Grammar and vocabulary usage
      - Use of suggested vocabulary  
      
      ### Scoring Guidelines:  
      - Scores 1-2 (Poor): Off-topic or irrelevant to the conversation context  
      - Scores 3-4 (Fair): Somewhat relevant but with major issues  
      - Scores 5-6 (Good): Relevant with some minor issues  
      - Scores 7-8 (Very Good): Relevant and mostly correct  
      - Scores 9-10 (Excellent): Perfectly relevant and correct  
      
      ### Important Notes:  
      - If the response is off-topic or doesn't fit the conversation context, score MUST be 1 or 2, even if grammar is correct.  
      - Consider that the student is a beginner.  
      - Context relevance is the top priority.  
      
      ---
      
      ### Format your response exactly like this:  
      Score : [number]  
      Explanation: [brief reason]  
      Improved Response (only one improved response): [better version if needed, otherwise say "No improvement needed"]  
     Corrections (Separate each concept with):
       Gender Agreement: Original phrase → Corrected phrase  (if needed, other wise say "No correction needed")
       Why: Short reason for the correction  
       Vocabulary: Original phrase → Corrected phrase (if needed, other wise say "No correction needed")
       Why: Short reason for the correction  
       Article: Original phrase → Corrected phrase  (if needed, other wise say "No correction needed")
       Why: Short reason for the correction
      
      ---
      
      ### Recent Chat History (last 4 messages for context)  
      ${recentHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}  
      
      ### Student's Response:  
      "${userMessage}"  
      
      ### Suggested Vocabulary:  
      ${vocabulary
        .map((v) => `${v.targetLanguage} - ${v.nativeLanguage}`)
        .join("\n")}  
      `;

      // New function to extract detailed corrections
      function extractCorrections(responseText) {
        const result = {
          genderAgreement: {},
          vocabulary: {},
          article: {},
          finalNotes: "",
        };
      
        // First, split by "Corrections:" to isolate the corrections section
        const [_, correctionsSection] = responseText.split("Corrections:");
        if (correctionsSection) {
          // Split the corrections section by double newlines to separate each correction type
          const corrections = correctionsSection.split(/\n\n/);
          
          corrections.forEach((section) => {
            if (section.includes("Gender Agreement")) {
              const [correctionLine, whyLine] = section.split("\nWhy: ");
              result.genderAgreement = {
                correction: correctionLine.replace("Gender Agreement:", "").trim(),
                reason: whyLine ? whyLine.trim() : ""
              };
            } else if (section.includes("Vocabulary")) {
              const [correctionLine, whyLine] = section.split("\nWhy: ");
              result.vocabulary = {
                correction: correctionLine.replace("Vocabulary:", "").trim(),
                reason: whyLine ? whyLine.trim() : ""
              };
            } else if (section.includes("Article")) {
              const [correctionLine, whyLine] = section.split("\nWhy: ");
              result.article = {
                correction: correctionLine.replace("Article:", "").trim(),
                reason: whyLine ? whyLine.trim() : ""
              };
            }
          });
        }
      
        // Extract final notes if they exist
        const finalNotesMatch = responseText.match(/The student.*$/s);
        if (finalNotesMatch) {
          result.finalNotes = finalNotesMatch[0].trim();
        }
      
        return result;
      }

      const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 500,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });

      const responseText = response.content[0].text;
      console.log("Claude's raw response for scoring:", responseText);

      // Extract basic information
      const scoreMatch = responseText.match(/Score:\s*(\d+)/);
      const explanationMatch = responseText.match(
        /Explanation:\s*(.*?)(?=\n|$)/s
      );
      const improvedMatch = responseText.match(
        /Improved Response:\s*(.*?)(?=\n|$)/s
      );

      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
      const explanation = explanationMatch
        ? explanationMatch[1].trim()
        : "No explanation provided.";
      const improvedResponse = improvedMatch
        ? improvedMatch[1].trim()
        : "No improvement needed.";

      // Extract detailed corrections
      const detailedCorrections = extractCorrections(responseText);

      // Map numerical scores to qualitative labels
      let label = "OK";
      if (score >= 9) label = "Excellent";
      else if (score >= 7) label = "Great";
      else if (score >= 5) label = "Good";
      else if (score >= 3) label = "OK";
      else label = "Poor";

      // Determine whether a suggestion is needed
      const shouldSuggest =
        score <= 6 && improvedResponse !== "No improvement needed.";

      const shouldCorrect = score <= 6 && detailedCorrections !== " No improvement needed.";

      return {
        score,
        label,
        explanation,
        improvedResponse: shouldSuggest ? improvedResponse : null,
        corrections: shouldCorrect ? detailedCorrections : null, // Now returning the detailed corrections object
      };
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
      label: userScore?.label ?? "OK",
      score: userScore?.score ?? null,
      explanation: userScore?.explanation ?? "No explanation provided.",
      improvedResponse: userScore?.improvedResponse ?? null,
      corrections: userScore?.corrections ?? "No corrections provided.",
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
