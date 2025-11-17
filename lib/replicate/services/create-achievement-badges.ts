import { replicate } from "../config/client";
import type { Achievement } from "../types";


export const createAchievementBadges = async (achievement: Achievement) => {
  const {
    name,
    description,
    category: { name: categoryName },
  } = achievement;
  console.log(
    "name:",
    name,
    "description:",
    description,
    "categoryName:",
    categoryName,
  );

  try {
    // Constructing the prompt
    const prompt = `A vibrant, illustrative badge titled "${name}" from the "${categoryName}" category. This badge is awarded for: ${description}. The design should feature symbols or elements that represent the essence of the achievement, like a checkmark, a calendar, or a progress bar. The style should be modern, friendly, and approachable with a color palette that conveys both accomplishment and encouragement. The badge should have a polished look, perfect for display on a website's achievement section, with clear, recognizable design elements that highlight the user's commitment.
    Rule: No small text.`;

    // Generate image using Replicate
    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-schnell",
      input: {
        aspect_ratio: "1:1",
        cfg: 3.5,
        output_format: "webp",
        output_quality: 90,
        num_outputs: 4,
        prompt: prompt,
        prompt_strength: 0.85,
        steps: 35,
        num_inference_steps: 4,
      },
    });

    const finishedPrediction = await replicate.wait(prediction);

    if (!finishedPrediction?.output?.length) {
      throw new Error("No output received from Replicate");
    }

    const replicateImageUrls = finishedPrediction.output;
    console.log("Replicate image URLs:", replicateImageUrls);

    return replicateImageUrls;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("Error in createAchievementBadges:", {
      message,
      stack,
      achievement,
    });
    throw new Error(`Achievement badge creation failed: ${message}`);
  }
};