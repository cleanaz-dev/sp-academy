import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const NOVITA_API_KEY = process.env.NOVITA_API_KEY!;

// Helper function to clean DeepSeek output (<think> tags, markdown code blocks)
function cleanDeepSeekJson(content: string): string {
  if (!content) return "";
  
  // 1. Remove DeepSeek reasoning <think>...</think> blocks
  let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // 2. Remove markdown code blocks ```json ... ```
  cleaned = cleaned.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

  return cleaned;
}

// Helper function to poll Novita async task result for Image Generation
async function pollNovitaTaskResult(taskId: string, maxAttempts = 20): Promise<string> {
  console.log(`[Preview API] Polling Novita Task ID: ${taskId}...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
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
      const errText = await response.text();
      console.error(`[Preview API] Novita Poll Error (Attempt ${attempt}):`, errText);
      throw new Error(`Failed to query Novita task result: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[Preview API] Poll Attempt ${attempt} Task Payload:`, JSON.stringify(data, null, 2));

    const task = data.task || data;

    if (task.status === "TASK_STATUS_SUCCEEDED" || task.status === "SUCCESS") {
      const imageUrl = task.images?.[0]?.image_url || task.images?.[0]?.url;
      if (!imageUrl) throw new Error("Image task succeeded but no image URL returned");
      console.log(`[Preview API] Image Task Succeeded! URL: ${imageUrl}`);
      return imageUrl;
    }

    if (task.status === "TASK_STATUS_FAILED") {
      console.error(`[Preview API] Novita Image Task Failed:`, task.reason);
      throw new Error(task.reason || "Novita image generation task failed");
    }
  }

  throw new Error("Novita image generation timed out.");
}

export async function POST(req: Request) {
  console.log("=== [Preview API] Route Called ===");

  try {
    // 1. Clerk Admin Authentication
    const { userId } = await auth();
    console.log("[Preview API] Auth UserId:", userId);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isUserAdmin = await prisma.user.findUnique({
      where: { userId },
      select: { id: true, role: true },
    });

    console.log("[Preview API] User Admin Check Result:", isUserAdmin);

    if (!isUserAdmin || isUserAdmin.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden Request" }, { status: 403 });
    }

    // 2. Parse Request Body
    const body = await req.json();
    console.log("[Preview API] Request Body:", body);

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

    // 3. System Prompt setup
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

    console.log("[Preview API] Calling Novita LLM (deepseek/deepseek-v4-flash)...");

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
        temperature: 0.7,
      }),
    });

    console.log("[Preview API] Novita LLM HTTP Status:", llmResponse.status);

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      console.error("[Preview API] Novita LLM Request Failed:", errText);
      throw new Error(`Novita LLM Error (${llmResponse.status}): ${errText}`);
    }

    const llmData = await llmResponse.json();
    console.log("[Preview API] Full Novita LLM Response:", JSON.stringify(llmData, null, 2));

    const rawContent = llmData.choices?.[0]?.message?.content;
    console.log("[Preview API] Raw Message Content:", rawContent);

    if (!rawContent) {
      throw new Error("DeepSeek returned an empty message content");
    }

    // Clean markdown/think tags and parse JSON
    const sanitizedContent = cleanDeepSeekJson(rawContent);
    console.log("[Preview API] Sanitized JSON Content:", sanitizedContent);

    let itemData: any;
    try {
      itemData = JSON.parse(sanitizedContent);
      console.log("[Preview API] Successfully Parsed Item Data:", itemData);
    } catch (parseErr) {
      console.error("[Preview API] JSON Parse Error on string:", sanitizedContent);
      throw new Error(`Failed to parse LLM JSON output: ${rawContent}`);
    }

    // 4. Submit Image Task
    const imagePrompt = `${itemData.imagePrompt}, ${imageStyle} style, high quality, vibrant colors`;
    console.log("[Preview API] Submitting Image Task to Novita with Prompt:", imagePrompt);

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

    console.log("[Preview API] Image Task Submission HTTP Status:", imageTaskResponse.status);

    if (!imageTaskResponse.ok) {
      const errText = await imageTaskResponse.text();
      console.error("[Preview API] Image Task Submission Failed:", errText);
      throw new Error(`Novita Image Submission Error (${imageTaskResponse.status}): ${errText}`);
    }

    const imageTaskData = await imageTaskResponse.json();
    console.log("[Preview API] Image Task Submission Payload:", JSON.stringify(imageTaskData, null, 2));

    const taskId = imageTaskData.task_id || imageTaskData.task?.task_id;

    if (!taskId) {
      throw new Error("No task_id returned from Novita image submission");
    }

    // 5. Poll Image URL
    const imageUrl = await pollNovitaTaskResult(taskId);

    // 6. Return Payload
    const previewSample = {
      ...itemData,
      imageUrl,
    };

    console.log("[Preview API] Final Preview Sample Payload Ready:", previewSample);

    return NextResponse.json({ previewSample }, { status: 200 });

  } catch (error: any) {
    console.error("=== [Preview API] ERROR ===", error);
    return NextResponse.json(
      { message: error.message || "Failed to generate preview" },
      { status: 500 }
    );
  }
}