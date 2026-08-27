import { NextResponse } from "next/server";

export const maxDuration = 60;

const VOICE_MAP: Record<string, Record<string, string>> = {
  "en-US": {
    male: "933563129e564b19a115bedd57b7406a",
    female: "802e3bc2b27e49c2995d23ef70e6ac89",
  },

  "fr-FR": {
    male: "83154314d3d64d56b8a434583a659a91",
    female: "690813f2df56491b82ee02a22d1c67fd",
  },

  "es-ES": {
    male: "43e1948b1a544700bd88250916cd31e8",
    female: "0118a35dcb604837abe7961a43e13ba8",
  },
};

const FALLBACK_VOICE_ID =
  "690813f2df56491b82ee02a22d1c67fd";

export async function POST(request: Request) {
  const reqId = Math.random()
    .toString(36)
    .substring(7);

  const startTime = Date.now();

  console.log(`[TTS-${reqId}] Incoming request`);

  try {
    const body = await request.json();

    const {
      text,
      language,
      speed = 0.8,
      gender = "female",
    } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.FISH_AUDIO_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API Key" },
        { status: 500 }
      );
    }

    const referenceId =
      VOICE_MAP[language]?.[gender] ||
      FALLBACK_VOICE_ID;

    console.log(
      `[TTS-${reqId}] Voice: ${referenceId}`
    );

    const response = await fetch(
      "https://api.fish.audio/v1/tts",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          model: "s2.1-pro-free",
        },

        body: JSON.stringify({
          text: text.trim(),

          reference_id: referenceId,

          format: "mp3",

          normalize: true,

          latency: "normal",

          prosody: {
            speed,
            volume: 0,
            normalize_loudness: true,
          },

          chunk_length: 100,
        }),
      }
    );

    console.log(
      `[TTS-${reqId}] Fish responded in ${
        Date.now() - startTime
      }ms`
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        `[TTS-${reqId}] Fish error ${response.status}:`,
        errorText
      );

      return NextResponse.json(
        {
          error: "Fish Audio API Failed",
          details: errorText,
        },
        { status: response.status }
      );
    }

    if (!response.body) {
      return NextResponse.json(
        { error: "Fish Audio returned no audio stream" },
        { status: 500 }
      );
    }

    console.log(
      `[TTS-${reqId}] Streaming audio`
    );

    return new Response(response.body, {
      status: 200,

      headers: {
        "Content-Type":
          response.headers.get("content-type") ||
          "audio/mpeg",

        "Cache-Control": "no-cache",

        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error(
      `[TTS-${reqId}] Error:`,
      error
    );

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}