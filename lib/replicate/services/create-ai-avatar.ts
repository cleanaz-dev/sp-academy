import { replicate } from "../config/client";

export const createAiAvatar = async (
  title: string,
  gender: string = "neutral",
  role: string = "avatar",
): Promise<string> => {
  console.log(
    `Starting createAiAvatar with title: ${title}, gender: ${gender}, and role: ${role}`,
  );

  try {
    // Constructing the prompt
    const prompt =
      gender === "male"
        ? `Male avatar headshot, zoomed in with neutral expression, clean background with a dynamic ${title}, photorealistic style, dressed as a ${role}.`
        : gender === "female"
          ? `Female avatar headshot, zoomed in with neutral expression, clean background with a dynamic ${title}, photorealistic style, dressed as a ${role}.`
          : `AI avatar headshot, zoomed in with neutral expression, clean background with a dynamic ${title}, photorealistic style, dressed as a ${role}.`;

    // Generate image using Replicate
    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-schnell",
      input: {
        aspect_ratio: "1:1",
        cfg: 3.5,
        output_format: "webp",
        output_quality: 90,
        prompt: prompt,
        prompt_strength: 0.85,
        steps: 35,
      },
    });

    const finishedPrediction = await replicate.wait(prediction);

    if (!finishedPrediction?.output?.[0]) {
      throw new Error("No output received from Replicate");
    }

    const replicateImageUrl = finishedPrediction.output[0];
    console.log("Replicate image URL:", replicateImageUrl);

    // Determine API URL for upload
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const uploadUrl = `${apiUrl}/api/conversation/upload-avatar-image`;

    // Upload to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl: replicateImageUrl,
      }),
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log("Upload result:", uploadResult);

    if (!uploadResult.success || !uploadResult.imageUrl) {
      throw new Error(uploadResult.error || "Failed to get upload URL");
    }

    return uploadResult.imageUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("Error in createAiAvatar:", {
      message,
      stack,
      title,
      gender,
      role,
    });
    throw new Error(`Avatar creation failed: ${message}`);
  }
};