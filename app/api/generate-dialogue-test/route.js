//api/generate-dialogue-test/route.js
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {

    // console.log("Scenario Context:", data.scenario.context);

    // console.log("Level Requirements:", data.level.requirements);

    

    const { 
      scenario: { type: scenarioType, context },
      level: { type: levelType, requirements },
      focus: { type: focusType, objectives },
    } = await req.json();

    const client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const prompt = {
      prompt: `\n\nHuman: You are a French language learning assistant. Create a structured dialogue scenario for learning French. Always follow the RULES: 1.Provide at least 10 vocabulary words 2. Provide a at least 6 dialogue responses. Please provide the response in the following JSON format:

{
  "introduction": {
    "french": "A brief introduction to the scenario in French",
    "english": "The same introduction in English"
  },
  "vocabulary": [
    {
      "french": "French word or phrase",
      "english": "English translation",
      "example": "An example sentence using the word"
    }
  ],
  "characters": [
    {
      "role": "Character role (e.g., waiter, customer)",
      "description": "Brief character description"
    }
  ],
  "dialogue": [
    {
      "speaker": "Character name",
      "french": "French dialogue line",
      "english": "English translation"
    }
  ]
}

Create this content based on:

SCENARIO: ${scenarioType}
CONTEXT: Location - ${context.location}, Roles - ${context.roles.join(', ')}
LEVEL: ${levelType} (Vocabulary range: ${requirements.vocabulary} words)
FOCUS: ${focusType}
LEARNING OBJECTIVES: ${objectives.join(', ')}


\n\nAssistant:`,
      max_tokens_to_sample: 2000,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 250,
      stop_sequences: ["\n\nHuman:"],
    };

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-v2:1",
      body: JSON.stringify(prompt),
      contentType: "application/json",
    });

    const response = await client.send(command);
    const responseData = JSON.parse(new TextDecoder().decode(response.body));

    // // Parse the completion to get the JSON structure
    let scenarioContent;
    try {
      // The completion might include markdown or other text before/after the JSON
      const jsonMatch = responseData.completion.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scenarioContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (parseError) {
      console.error('Error parsing scenario content:', parseError);
      // Fallback structure if parsing fails
      scenarioContent = {
        introduction: {
          french: "Une erreur s'est produite.",
          english: "An error occurred."
        },
        vocabulary: [],
        characters: [],
        dialogue: [],
      };
    }



    // Add metadata to the response
    const enhancedResponse = {
      scenario: {
        ...scenarioContent,
        metadata: {
          generatedAt: new Date().toISOString(),
          level: levelType,
          focusArea: focusType,
          scenarioType: scenarioType
        }
      },
    };

    return NextResponse.json(enhancedResponse, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Error generating dialogue:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate dialogue scenario',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

// Optional: Add input validation middleware
export async function validateInput(req) {
  const requiredFields = ['scenario', 'level', 'focus', 'userProgress'];
  const body = await req.json();

  for (const field of requiredFields) {
    if (!body[field]) {
      return {
        isValid: false,
        error: `Missing required field: ${field}`
      };
    }
  }

  return {
    isValid: true,
    data: body
  };
}