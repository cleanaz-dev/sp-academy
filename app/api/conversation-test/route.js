// app/api/conversation-test/route.js

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { NextResponse } from "next/server";

// Helper function for formatting context
function formatCharacterContext(context) {
  if (!context) return null;

  // Extract character information
  const characterInfo = context.characters?.split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^[-•]/, '').trim());

  // Extract scenario details
  const scenarioDetails = context.setup?.split('.')
    .filter(line => line.trim())
    .map(line => line.trim());

  return {
    mainCharacter: characterInfo?.[0] || 'French conversation partner',
    setting: scenarioDetails?.[0] || 'General conversation',
    objective: context.setup || 'Practice French conversation',
    vocabulary: context.vocabulary?.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-•]/, '').trim()),
    phrases: context.phrases?.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[-•]/, '').trim()),
  };
}

export async function POST(req) {
  try {
    const { message, context, history = [] } = await req.json();
    console.log("message:", message);
    console.log("context:", context);
    console.log("history:", history);

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Initialize Bedrock client
    const client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Format conversation history
    const formattedHistory = history.map(msg => 
      `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    // Format the character and scenario context
    const formattedContext = formatCharacterContext(context);

    // Enhanced prompt with formatted context
    const prompt = {
      prompt: `\n\nHuman: You are a French conversation partner playing a specific role.

ROLE-PLAY SCENARIO:
Setting: Doctors' office
Your Character: Doctor
Language Level: Beginner (the user is a French beginner, so use simple vocabulary and phrases they can easily understand).

LANGUAGE GUIDELINES:
One sentence per response.

Previous Conversation:
${formattedHistory}

User's Message: "${message}"

CRITICAL INSTRUCTIONS:
1. You MUST stay in character
2. Use ONLY the vocabulary and phrases listed above
3. Maintain the context
4. Respond naturally as your character would in this situation
5. If correcting errors, do so as your character would
6. Keep the conversation flowing within the scenario

Respond in French, fully embodying your character.

\n\nAssistant:`,
      max_tokens_to_sample: 300,
      temperature: 0.8,
      top_p: 0.9,
      top_k: 250,
      stop_sequences: ["\n\nHuman:"]
    };

    // Send to Bedrock
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-v2",
      body: JSON.stringify(prompt),
      contentType: "application/json",
    });

    const response = await client.send(command);
    const responseData = JSON.parse(new TextDecoder().decode(response.body));
    const aiResponse = responseData.completion.trim();

    // Convert AI response to speech using ElevenLabs
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: aiResponse,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            language: "fr",
          }
        }),
      }
    );

    if (!ttsResponse.ok) {
      throw new Error('TTS failed');
    }

    const audioData = await ttsResponse.arrayBuffer();

    // Add debug information in development
    const debugInfo = process.env.NODE_ENV === 'development' ? {
      promptLength: prompt.prompt.length,
      responseLength: aiResponse.length,
      audioSize: audioData.byteLength,
      context: !!context,
      historyLength: history.length,
    } : null;

    return NextResponse.json({
      text: aiResponse,
      audio: Buffer.from(audioData).toString('base64'),
      debug: debugInfo,
    });

  } catch (error) {
    console.error('Test conversation error:', error);
    return NextResponse.json({
      error: 'Test route error: ' + (error.message || 'Internal server error'),
      debug: process.env.NODE_ENV === 'development' ? error.stack : null
    }, {
      status: 500
    });
  }
}