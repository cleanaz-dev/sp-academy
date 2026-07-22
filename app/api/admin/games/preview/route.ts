import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const NOVITA_API_KEY = process.env.NOVITA_API_KEY!;

// 1. Tell Vercel to allow up to 60 seconds for this function
export const maxDuration = 60;

// Helper to clean DeepSeek output
function cleanDeepSeekJson(content: string): string {
  if (!content) return "";
  let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  cleaned = cleaned.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  return cleaned;
}

// Helper function to poll Novita async task result
async function pollNovitaTaskResult(taskId: string, maxAttempts = 15): Promise<string> {
  // Wait 2.5s initially since z-image-turbo takes ~3s minimum
  await new Promise((resolve) => setTimeout(resolve, 2500));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(
      `https://api.novita.ai/v3/async/task-result?task_id=${taskId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${NOVITA_API_KEY}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to query Novita task result: ${response.statusText}`);
    }

    const data = await response.json();
    const status = data.task?.status;

    if (status === "TASK_STATUS_SUCCEED") {
      const imageUrl = data.images?.[0]?.image_url;
      if (!imageUrl) throw new Error("Image task succeeded but no image URL returned");
      return imageUrl;
    }

    if (status === "TASK_STATUS_FAILED") {
      throw new Error(data.task?.reason || "Novita image generation task failed");
    }

    // status is TASK_STATUS_QUEUED or TASK_STATUS_PROCESSING — keep polling
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Novita image generation timed out.");
}

export async function POST(req: Request) {
  try {
    // Auth Check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isUserAdmin = await prisma.user.findUnique({
      where: { userId },
      select: { id: true, role: true },
    });

    if (!isUserAdmin || isUserAdmin.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden Request" }, { status: 403 });
    }

    const body = await req.json();
    const { type, language, theme, imageStyle } = body;

    if (!theme || !type) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const languageNames: Record<string, string> = {
      "en-US": "English",
      "fr-FR": "French",
      "es-ES": "Spanish",
    };
    const targetLanguage = languageNames[language] || "English";

    // --- PARALLEL TASK 1: Call DeepSeek LLM ---
    const systemPrompt = `You are an AI game content generator. 
Generate exactly 1 sample item for a ${type} game.
Theme: "${theme}".
Target Language for words/descriptions: ${targetLanguage}.

Format your response ONLY as a valid raw JSON object (no markdown, no code fences):

If type is SPEECH_DESCRIBE:
{
  "targetKeywords": ["3 to 5 keywords in ${targetLanguage}"],
  "description": "Full reference sentence in ${targetLanguage}"
}

If type is VISUAL:
{
  "choices": ["Choice 1 in ${targetLanguage}", "Choice 2 in ${targetLanguage}", "Choice 3 in ${targetLanguage}", "Choice 4 in ${targetLanguage}"],
  "answer": "Correct choice in ${targetLanguage}"
}`;

    const llmPromise = fetch("https://api.novita.ai/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NOVITA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate 1 sample item for topic: ${theme}` },
        ],
        temperature: 0.7,
      }),
    });

    // --- PARALLEL TASK 2: Submit Novita Image Task ---
    const imagePrompt = `${theme}, ${imageStyle} style, detailed, vibrant colors, high quality`;

    const imageTaskPromise = fetch("https://api.novita.ai/v3/async/z-image-turbo-lora", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NOVITA_API_KEY}`,
      },
      body: JSON.stringify({
        seed: Math.floor(Math.random() * 1000000),
        size: "1024*1024",
        prompt: imagePrompt,
      }),
    });

    // Run both LLM & Image Task Submission concurrently!
    const [llmResponse, imageTaskResponse] = await Promise.all([
      llmPromise,
      imageTaskPromise,
    ]);

    if (!llmResponse.ok) {
      throw new Error(`Novita LLM error: ${await llmResponse.text()}`);
    }
    if (!imageTaskResponse.ok) {
      throw new Error(`Novita Image error: ${await imageTaskResponse.text()}`);
    }

    // Process LLM Output
    const llmData = await llmResponse.json();
    const rawContent = llmData.choices?.[0]?.message?.content;
    const sanitizedContent = cleanDeepSeekJson(rawContent);
    const itemData = JSON.parse(sanitizedContent);

    // Process Image Task Submission
    const imageTaskData = await imageTaskResponse.json();
    const taskId = imageTaskData.task_id;

    if (!taskId) {
      throw new Error("No task_id returned from Novita image submission");
    }

    // Poll for final image URL
    const imageUrl = await pollNovitaTaskResult(taskId);

    // Return combined result
    const previewSample = {
      ...itemData,
      imageUrl,
    };

    return NextResponse.json({ previewSample }, { status: 200 });

  } catch (error: any) {
    console.error("Preview Route Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to generate preview" },
      { status: 500 }
    );
  }
}