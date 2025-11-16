import { replicate } from "../config/client";

interface UserAvatarData {
  description: string;
  style: string;
  type: string;
}

export const createUserAvatar = async (data: UserAvatarData) => {
  console.log("Running createUserAvatar with data:", data);
  try {
    const prediction = await replicate.predictions.create({
      model: "recraft-ai/recraft-v3",
      input: {
        prompt: `User avatar headshot description: ${data.description} with a style:${data.style}`,
        size: "1024x1024",
        style: `${data.type}`,
      },
    });
    const finishedPrediction = await replicate.wait(prediction);
    console.log("Finished prediction:", finishedPrediction);
    
    const replicateImageUrl = finishedPrediction.output;
    if (!replicateImageUrl) {
      throw new Error("No output received from Replicate");
    }
    console.log("Replicate image URL:", replicateImageUrl);
    return replicateImageUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("Error in createUserAvatar:", {
      message,
      stack,
      data,
    });
    throw new Error(`User avatar creation failed: ${message}`);
  }
};