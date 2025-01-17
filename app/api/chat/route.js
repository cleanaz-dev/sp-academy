import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message, conversationHistory } = await req.json();

    const client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const prompt = {
      prompt: `\n\nHuman: You are a French language tutor. Please format your responses using markdown with the following structure:

- Use ### for section headers
- Use ** for bold text
- Use * for italic text
- Use > for important notes or tips
- Use --- for separating sections
- Use \`\` for highlighting words
- Use bullet points for lists
- Always separate French and English translations clearly
- Use tables when comparing words or phrases

Please respond to: ${message}

\n\nAssistant: Let me help you with that:`,
      max_tokens_to_sample: 300,
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
      { response: responseData.completion },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}