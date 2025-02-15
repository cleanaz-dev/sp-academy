// app/api/generate-exercises/route.js
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export async function POST(request) {
  try {
    const client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const { prompt } = await request.json();

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-v2",
      
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        max_tokens_to_sample: 2048, // Changed from max_tokens
        temperature: 0.7,
        top_p: 0.9,
        stop_sequences: ["\n\nHuman:"]
      }),
    });

    const response = await client.send(command);
    const responseData = JSON.parse(new TextDecoder().decode(response.body));

    // Parse the response to extract exercises
    let exercises;
    try {
      // Attempt to parse the response as JSON
      exercises = JSON.parse(responseData.completion);
    } catch (error) {
      // If parsing fails, try to extract structured data from the text response
      console.log("Raw response:", responseData.completion);
      exercises = {
        exercises: [
          // Add default exercise structure if parsing fails
        ]
      };
    }

    return Response.json({ success: true, exercises: exercises.exercises });
  } catch (error) {
    console.error('Exercise generation error:', error);
    return Response.json(
      { success: false, error: 'Failed to generate exercises' }, 
      { status: 500 }
    );
  }
}