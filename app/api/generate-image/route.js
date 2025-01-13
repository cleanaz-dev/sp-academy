// app/api/generate-image/route.js
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export async function POST(request) {
  const { prompt } = await request.json();

  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    const input = {
      modelId: "amazon.nova-canvas-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        textToImageParams: {
          text: prompt
        },
        taskType: "TEXT_IMAGE",
        imageGenerationConfig: {
          cfgScale: 8,
          seed: 0, // Random seed for variety
          width: 1024,
          height: 1024,
          numberOfImages: 1 // You can increase this if you want multiple options
        }
      }),
    };

    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // The response structure might be different with Titan
    // You might need to adjust this based on the actual response format
    return Response.json({ 
      success: true, 
      imageUrl: responseBody.images[0] // Adjust based on actual response structure
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to generate image' 
    });
  }
}