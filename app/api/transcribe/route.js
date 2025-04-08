// pages/api/transcribe.js
import { NextResponse } from "next/server";
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from "@aws-sdk/client-transcribe-streaming";
import { Buffer } from "buffer";

const SAMPLE_RATE = 16000;
const CHUNK_SIZE = 1024 * 8;

// Create the client with credentials from server-side environment variables
const client = new TranscribeStreamingClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

class TranscriptionHandler {
  constructor() {
    this.transcripts = [];
  }

  handleTranscript(event) {
    const results = event.Transcript.Results;
    for (const result of results) {
      for (const alt of result.Alternatives) {
        console.log(alt.Transcript);
        this.transcripts.push(alt.Transcript);
      }
    }
  }
}

async function transcribeAudio(audioFile) {
  const handler = new TranscriptionHandler();

  try {
    // Create an async generator to stream audio chunks
    async function* audioStream() {
      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
        const chunk = buffer.slice(i, i + CHUNK_SIZE);
        yield { AudioEvent: { AudioChunk: chunk } };
      }
    }

    // Start transcription
    const command = new StartStreamTranscriptionCommand({
      LanguageCode: "en-US",
      MediaSampleRateHertz: SAMPLE_RATE,
      MediaEncoding: "pcm",
      AudioStream: audioStream(),
    });

    const response = await client.send(command);

    // Process the response stream
    for await (const event of response.TranscriptResultStream) {
      if (event.TranscriptEvent) {
        handler.handleTranscript(event.TranscriptEvent);
      }
    }

    return handler.transcripts;
  } catch (error) {
    console.error("Error during transcription:", error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");
    c;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 },
      );
    }

    const transcripts = await transcribeAudio(audioFile);

    return NextResponse.json({ transcripts });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 },
    );
  }
}
