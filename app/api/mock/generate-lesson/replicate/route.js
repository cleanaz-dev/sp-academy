// /api/mock-generate-lesson/replicate/route.js
import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const output = await replicate.run(
      "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863f650d22", // Or your preferred model
      {
        input: {
          prompt: `${prompt}, colorful cartoon style`, // Add style for consistency
          num_outputs: 1,
          width: 512,
          height: 512,
          num_inference_steps: 30, // Faster generation, tweak for speed/quality
        },
      },
    );

    const imageUrl = output[0]; // Replicate returns an array of URLs
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Replicate error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 },
    );
  }
}
