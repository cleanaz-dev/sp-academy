// app/api/users/[userId]/sprite/image/route.ts
import { NextResponse } from "next/server";
import { isUser } from "@/lib/auth-guard";

const PRUNA_URL =
  "https://api.replicate.com/v1/models/prunaai/p-image/predictions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const user = await isUser(userId);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token =
      process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Missing REPLICATE_API_TOKEN" },
        { status: 500 }
      );
    }

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const safePrompt = `${prompt.trim()}. Unreal Engine 5 fictional character render, 3D game avatar, smooth subsurface skin shading, soft studio lighting, detailed fabric textures. RULES: No words, letters, numbers, or text anywhere in the image.`;

    const res = await fetch(PRUNA_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({
        input: {
          seed: 0,
          prompt: safePrompt,
          lora_scale: 0.5,
          aspect_ratio: "16:9",
          prompt_upsampling: true,
          enable_copyright_filter: false,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[sprite-image] Pruna error:", res.status, errText);
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 502 }
      );
    }

    const prediction = await res.json();
    const out = prediction.output;
    const imageUrl = Array.isArray(out) ? out[0] : out;

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL" }, { status: 502 });
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("[sprite-image] Error:", err);
    return NextResponse.json(
      { error: "Internal image error" },
      { status: 500 }
    );
  }
}