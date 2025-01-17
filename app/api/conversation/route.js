// app/api/conversation/route.js

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    const { message, history } = data
    console.log("Data stream:",data);

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // AI Response Function
    const getAIResponse = async () => {
      const client = new BedrockRuntimeClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    
      // Include the conversation history in the prompt
      const prompt = {
        prompt: `\n\nHuman: You are a French language conversation partner.
        The conversation history is: "${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}"
        The user has said: "${message}"
        Please respond naturally in French, keeping responses concise.
        \n\nAssistant:`,
        max_tokens_to_sample: 200,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 250,
      };
    
      const command = new InvokeModelCommand({
        modelId: "anthropic.claude-v2:1",
        body: JSON.stringify(prompt),
        contentType: "application/json",
      });
    
      const response = await client.send(command);
      return JSON.parse(new TextDecoder().decode(response.body));
    };
    // Get TTS Function
    const getTextToSpeech = async (text) => {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
              language: "fr",
              use_speaker_boost: true
            },
            optimize_streaming_latency: 3
          }),
        }
      );

      if (!response.ok) {
        throw new Error('TTS failed');
      }

      return response;
    };

    // Run AI response in parallel with any other tasks
    const [aiResponseData] = await Promise.all([
      getAIResponse(),
      // Add other parallel tasks here if needed
    ]);

    const aiResponse = aiResponseData.completion.trim();

    // Get TTS stream
    const ttsResponse = await getTextToSpeech(aiResponse);
    const audioData = await ttsResponse.arrayBuffer();

    return NextResponse.json({
      text: aiResponse,
      audio: Buffer.from(audioData).toString('base64'),
    });

  } catch (error) {
    console.error('Conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}