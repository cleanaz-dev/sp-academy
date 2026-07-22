import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const NOVITA_API_KEY = process.env.NOVITA_API_KEY!;

// Helper function to poll Novita async task result for Image Generation
async function pollNovitaTaskResult(taskId: string, maxAttempts = 15): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Wait 1 second between polls
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await fetch(
      `https://api.novita.ai/v3/async/task-result?task_id=${taskId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${NOVITA_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to query Novita task result: ${response.statusText}`);
    }

    const data = await response.json();
    const task = data.task || data;

    // Check status
    if (task.status === "TASK_STATUS_SUCCEEDED" || task.status === "SUCCESS") {
      const imageUrl = task.images?.[0]?.image_url || task.images?.[0]?.url;
      if (!imageUrl) throw new Error("Image task succeeded but no image URL returned");
      return imageUrl;
    }

    if (task.status === "TASK_STATUS_FAILED") {
      throw new Error(task.reason || "Novita image generation task failed");
    }
  }

  throw new Error("Novita image generation timed out.");
}

export async function POST(req: Request) {
  try {
    // 1. Clerk Admin Authentication
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

    // 2. Parse Request Body from GenerateContext
    const body = await req.json();
    const { type, language, theme, imageStyle } = body;

    if (!theme || !type) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Language Mapping for System Prompt
    const languageNames: Record<string, string> = {
      "en-US": "English",
      "fr-FR": "French",
      "es-ES": "Spanish",
    };
    const targetLanguage = languageNames[language] || "English";

    // 3. Call Novita DeepSeek LLM to generate 1 question schema
    const systemPrompt = `You are an AI game content generator. 
Generate exactly 1 sample item for a ${type} game.
Theme: "${theme}".
Target Language for words/descriptions: ${targetLanguage}.

Format your response ONLY as a valid raw JSON object (no markdown, no code fences):

If type is SPEECH_DESCRIBE:
{
  "imagePrompt": "Detailed English image generation prompt incorporating style '${imageStyle}'",
  "targetKeywords": ["3 to 5 keywords in ${targetLanguage}"],
  "description": "Full reference sentence in ${targetLanguage}"
}

If type is VISUAL:
{
  "imagePrompt": "Detailed English image generation prompt incorporating style '${imageStyle}'",
  "choices": ["Choice 1 in ${targetLanguage}", "Choice 2 in ${targetLanguage}", "Choice 3 in ${targetLanguage}", "Choice 4 in ${targetLanguage}"],
  "answer": "Correct choice in ${targetLanguage}"
}`;

    const llmResponse = await fetch("https://api.novita.ai/openai/v1/chat/completions", {
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
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      throw new Error(`Novita LLM error: ${errText}`);
    }

    const llmData = await llmResponse.json();
    const rawContent = llmData.choices?.[0]?.message?.content;
    const itemData = JSON.parse(rawContent);

    // 4. Generate Image via Novita z-image-turbo
    const imagePrompt = `${itemData.imagePrompt}, ${imageStyle} style, high quality, vibrant colors`;

    const imageTaskResponse = await fetch("https://api.novita.ai/v3/async/z-image-turbo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NOVITA_API_KEY}`,
      },
      body: JSON.stringify({
        seed: Math.floor(Math.random() * 1000000),
        size: "1024*1024",
        prompt: imagePrompt,
        output_format: "webp",
        enable_base64_output: false,
      }),
    });

    if (!imageTaskResponse.ok) {
      const errText = await imageTaskResponse.text();
      throw new Error(`Novita Image Task Submission Error: ${errText}`);
    }

    const imageTaskData = await imageTaskResponse.json();
    const taskId = imageTaskData.task_id || imageTaskData.task?.task_id;

    if (!taskId) {
      throw new Error("No task_id returned from Novita image task submission");
    }

    // 5. Poll Novita task result to get generated image URL
    const imageUrl = await pollNovitaTaskResult(taskId);

    // 6. Return 1-Frame Preview Payload
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