// app/api/text-to-speech/route.js
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const client = new PollyClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.text) {
      return Response.json({ 
        success: false, 
        error: 'Text is required' 
      }, { status: 400 });
    }

    const command = new SynthesizeSpeechCommand({
      Text: body.text,
      OutputFormat: 'mp3',
      VoiceId: 'Lea',
      LanguageCode: 'fr-FR',
      Engine: 'neural' // Using neural engine for better quality
    });

    const response = await client.send(command);
    
    const chunks = [];
    for await (const chunk of response.AudioStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg'
      }
    });
  } catch (error) {
    console.error('Polly Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}