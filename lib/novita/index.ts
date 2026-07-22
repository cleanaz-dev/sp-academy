// lib/novita/index.ts

const NOVITA_API_KEY = process.env.NOVITA_API_KEY!;

/**
 * Strips DeepSeek's <think> tags and markdown code fences from raw LLM output.
 */
function cleanDeepSeekJson(content: string): string {
  if (!content) return "";
  let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  cleaned = cleaned.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  return cleaned;
}

/**
 * Calls Novita's OpenAI-compatible chat completions endpoint with DeepSeek,
 * and returns the parsed JSON object from the model's response.
 *
 * Throws if the request fails or the response isn't valid JSON.
 */
export async function generateNovitaText<T = any>(
  systemPrompt: string,
  userPrompt: string,
  options?: { model?: string; temperature?: number }
): Promise<T> {
  const model = options?.model ?? "deepseek/deepseek-v4-flash";
  const temperature = options?.temperature ?? 0.7;

  const response = await fetch("https://api.novita.ai/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NOVITA_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Novita LLM error: ${errText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  const sanitized = cleanDeepSeekJson(rawContent);

  try {
    return JSON.parse(sanitized) as T;
  } catch {
    throw new Error(`Novita LLM returned invalid JSON: ${sanitized}`);
  }
}

/**
 * Submits an async image generation task to Novita (z-image-turbo-lora)
 * and polls until it succeeds, fails, or times out. Returns the final image URL.
 */
export async function generateNovitaImage(
  prompt: string,
  options?: { size?: string; maxAttempts?: number; initialDelayMs?: number; pollIntervalMs?: number }
): Promise<string> {
  const size = options?.size ?? "1024*1024";
  const maxAttempts = options?.maxAttempts ?? 15;
  const initialDelayMs = options?.initialDelayMs ?? 2500;
  const pollIntervalMs = options?.pollIntervalMs ?? 1000;

  // Submit the task
  const submitResponse = await fetch("https://api.novita.ai/v3/async/z-image-turbo-lora", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NOVITA_API_KEY}`,
    },
    body: JSON.stringify({
      seed: Math.floor(Math.random() * 1000000),
      size,
      prompt,
    }),
  });

  if (!submitResponse.ok) {
    const errText = await submitResponse.text();
    throw new Error(`Novita Image error: ${errText}`);
  }

  const submitData = await submitResponse.json();
  const taskId = submitData.task_id;

  if (!taskId) {
    throw new Error(`No task_id returned from Novita image submission: ${JSON.stringify(submitData)}`);
  }

  // Wait initially since z-image-turbo takes ~3s minimum
  await new Promise((resolve) => setTimeout(resolve, initialDelayMs));

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
      if (!imageUrl) {
        throw new Error(`Image task succeeded but no image URL returned: ${JSON.stringify(data)}`);
      }
      return imageUrl;
    }

    if (status === "TASK_STATUS_FAILED") {
      throw new Error(data.task?.reason || "Novita image generation task failed");
    }

    // TASK_STATUS_QUEUED or TASK_STATUS_PROCESSING — keep polling
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error("Novita image generation timed out.");
}