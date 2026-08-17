// api/generate/generate-dialogue-test-copy/route.ts
import { NextResponse } from "next/server";


export const maxDuration = 60;




export async function POST(req: Request) {
  const model = "deepseek/deepseek-v4-flash-0731"
  try {
    const {
      languages,
      scenario: {
        type: scenarioType,
        context,
        keyPhrases,
        vocabulary,
        culturalNotes,
      },
      level: { type: levelType, requirements },
      focus: { type: focusType, objectives },
    } = await req.json();

    const systemPrompt = `You are a language learning assistant. Create a structured dialogue scenario for learning ${languages.target}. The learner's native language is ${languages.native}.`;

    const userPrompt = `
          CRITICAL FORMAT REQUIREMENT:
          - All language content MUST use "targetLanguage" and "nativeLanguage" as keys
          - DO NOT use specific language codes (like "es", "en", etc.)
          
          EXAMPLE FORMAT:
          {
            "targetLanguage": "word in target language",
            "nativeLanguage": "word in native language"
          }
          NOT:
          {
            "es": "word in Spanish",
            "en": "word in English"
          }
          
          WARNING: Do not use language codes (es, en, etc.) in the response. Always use "targetLanguage" and "nativeLanguage" as keys.
          
          CRITICAL REQUIREMENTS:
          *** YOU MUST PROVIDE EXACTLY 10 VOCABULARY WORDS - NO MORE, NO LESS ***
          
          RULES:
          1. YOU MUST INCLUDE EXACTLY 10 VOCABULARY WORDS that are:
             - Relevant to the scenario
             - Appropriate for the level
             - Each with translation and example sentence
             - This is a strict requirement
          2. Provide 6 dialogue exchanges with at least 2 characters
          3. Provide a cultural context note
          4. Match the specified level requirements


          EXAMPLE OF REQUIRED INTRODUCTION FORMAT:
          {
            "introduction": {
              "targetLanguage": "Dos amigos están planeando actividades para el fin de semana. Quieren hacer algo divertido y relajante.",
              "nativeLanguage": "Two friends are planning activities for the weekend. They want to do something fun and relaxing."
            }
          }

          
          Output Format:
          {
            "introduction": {
              "targetLanguage": "A complete 2-3 sentence introduction describing the scenario",
              "nativeLanguage": "Complete translation of the introduction"
          },
            "culturalNotes": [
              {
                "note": "Cultural insight",
                "explanation": "Detailed explanation"
              }
            ],
            "vocabulary": [
              {
                "targetLanguage": "Word/phrase",
                "nativeLanguage": "Translation",
                "context": "Usage context",
                "example": {
                  "targetLanguage": "Example sentence",
                  "nativeLanguage": "Translation"
                }
              }
            ],
            "characters": [
              {
                "role": "Character role",
                "description": "Description"
              }
            ],
            "dialogue": [
              {
                "speaker": "Character",
                "targetLanguage": "Dialogue line",
                "nativeLanguage": "Translation",
                "notes": "Optional notes"
              }
            ]
          }
          
          SCENARIO DETAILS:
          - SCENARIO: ${scenarioType}
          - CONTEXT: ${context.situation}
          - LOCATION: ${context.location}
          - ROLES: ${context.roles.join(", ")}
          - LEVEL: ${levelType}
          - LEVEL REQUIREMENTS:
            - Grammar Focus: ${requirements.grammarTopics.join(", ")}
            - Expected Fluency: ${requirements.expectedFluency}
            - Conversation Goals: ${requirements.conversationGoals.join(", ")}
          - FOCUS: ${focusType}
          - LEARNING OBJECTIVES: ${objectives.join(", ")}
          - CULTURAL NOTES TO INCORPORATE: ${culturalNotes.join(", ")}
          
          REQUIRED ELEMENTS TO INCLUDE:
          KEY PHRASES: ${JSON.stringify(keyPhrases)}
          VOCABULARY: ${JSON.stringify(vocabulary)}
          
          REMEMBER: 
          - The response MUST include EXACTLY 10 vocabulary items with full details for each.
          - Always use "targetLanguage" and "nativeLanguage" as keys in ALL responses.
          
          Please provide the response in valid JSON format.`;

    const novitaRes = await fetch("https://api.novita.ai/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NOVITA_API_KEY}`,
      },
      body: JSON.stringify({
        model: model, // swap for whatever Novita model you want
        max_tokens: 5000,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!novitaRes.ok) {
      const errText = await novitaRes.text();
      throw new Error(`Novita API error (${novitaRes.status}): ${errText}`);
    }

    const novitaData = await novitaRes.json();
    const rawText = novitaData.choices?.[0]?.message?.content ?? "";

    let scenarioContent;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scenarioContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing scenario content:", parseError);
      scenarioContent = {
        introduction: {
          targetLanguage: "Une erreur s'est produite.",
          nativeLanguage: "An error occurred.",
        },
        culturalNotes: [],
        vocabulary: [],
        characters: [],
        dialogue: [],
      };
    }

    const enhancedResponse = {
      scenario: {
        ...scenarioContent,
        metadata: {
          generatedAt: new Date().toISOString(),
          level: levelType,
          focusArea: focusType,
          scenarioType: scenarioType,
          languages: {
            native: languages.native,
            target: languages.target,
          },
        },
      },
    };

    return NextResponse.json(enhancedResponse, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating dialogue:", error);
    return NextResponse.json(
      {
        error: "Failed to generate dialogue scenario",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}