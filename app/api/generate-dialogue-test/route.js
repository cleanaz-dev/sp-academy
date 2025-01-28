//api/generate-dialogue-test-copy/route.js
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { NextResponse } from "next/server";

export async function POST(req) {
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

    console.log("Request Data:", {
      languages,
      scenarioType,
      context,
      keyPhrases,
      vocabulary,
      culturalNotes,
      levelType,
      requirements,
      focusType,
      objectives,
    });

    const client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const prompt = {
      prompt: `\n\nHuman: You are a language learning assistant. Create a structured dialogue scenario for learning ${languages.target}. The learner's native language is ${languages.native}.
    
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
    
    Output Format:
    {
      "introduction": {
        "targetLanguage": "Brief introduction",
        "nativeLanguage": "Translation"
      },
      "culturalNotes": [
        {
          "note": "Cultural insight",
          "explanation": "Detailed explanation"
        }
      ],
      "vocabulary": [ // MUST CONTAIN EXACTLY 10 ITEMS
        {
          "targetLanguage": "Word/phrase",
          "nativeLanguage": "Translation",
          "context": "Usage context",
          "example": {
            "targetLanguage": "Example sentence",
            "nativeLanguage": "Translation"
          }
        }
        // ... continue until exactly 10 vocabulary items are listed
      ],
      "characters": [
        {
          "role": "Character role",
          "description": "Description"
        }
      ],
      "dialogue": [  // MUST CONTAIN EXACTLY 6 EXCHANGES
        {
          "speaker": "Character",
          "targetLanguage": "Dialogue line",
          "nativeLanguage": "Translation",
          "notes": "Optional notes"
        }
        // ... continue until exactly 6 dialogue exchanges are listed
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
    
    REMEMBER: The response MUST include EXACTLY 10 vocabulary items with full details for each.
    
    \n\nAssistant:`,
      max_tokens_to_sample: 2500,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 250,
      stop_sequences: ["\n\nHuman:"],
    };
    

    console.log("Prompt:", prompt);

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-v2:1",
      body: JSON.stringify(prompt),
      contentType: "application/json",
    });

    const response = await client.send(command);
    const responseData = JSON.parse(new TextDecoder().decode(response.body));

    console.log("Response Data:", responseData);

    let scenarioContent;
    try {
      const jsonMatch = responseData.completion.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scenarioContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing scenario content:", parseError);
      scenarioContent = {
        introduction: {
          [languages.target]: "Une erreur s'est produite.",
          [languages.native]: "An error occurred.",
        },
        culturalNotes: [],
        vocabulary: [],
        characters: [],
        dialogue: [],
      };
    }

    console.log("Scenario Content:", scenarioContent);

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

    console.log("Enhanced Response:", enhancedResponse);

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
      }
    );
  }
}
