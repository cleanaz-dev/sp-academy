//appi/generate-dialogue/route.js
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { scenario, level, focus } = await req.json();

    const client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const prompt = {
      prompt: `\n\nHuman: You are a French dialogue scenario generator. Create a realistic dialogue scenario for a ${level} level French student. 

Scenario: ${scenario}
Learning Focus: ${focus}

Please provide:
1. A scenario setup in both French and English
2. Key vocabulary for this scenario
3. Common phrases that might be used
4. Character descriptions (who the student will interact with)
5. Potential conversation flow
6. Cultural notes if relevant

Format your response using markdown for clear sections.

\n\nAssistant:`,
      max_tokens_to_sample: 500,
      temperature: 0.7,
      top_p: 0.9,
    };

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-v2",
      body: JSON.stringify(prompt),
      contentType: "application/json",
    });

    const response = await client.send(command);
    const responseData = JSON.parse(new TextDecoder().decode(response.body));

    return NextResponse.json(
      { scenario: responseData.completion },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to generate dialogue scenario" },
      { status: 500 },
    );
  }
}
