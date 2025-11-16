import { replicate } from "../config/client";

export const createMainImageForLecture = async (imagePrompt: string) => {
  console.log("Running createMainImageForLecture with prompt:", imagePrompt);
  try {
    const prediction = await replicate.predictions.create({
      model: "recraft-ai/recraft-v3",
      input: {
        prompt: `Course named: ${imagePrompt} create professional cover image that will be shown a website next to course information. [do not create any glasses]`, // Use the passed prompt
        size: "1365x1024",
        style: "digital_illustration",
      },
    });
    const finishedPrediction = await replicate.wait(prediction);
    console.log("Finished prediction:", finishedPrediction);
    // Ensure output exists and extract the image URL
    const replicateImageUrl = finishedPrediction.output;
    if (!replicateImageUrl) {
      throw new Error("No output received from Replicate");
    }
    console.log("Replicate image URL:", replicateImageUrl);
    return replicateImageUrl;
  } catch (error) {
    console.error("Error in createMainImageForLecture:", {
      message: error.message,
      stack: error.stack,
      imagePrompt,
    });
    throw new Error(`Image creation failed: ${error.message}`);
  }
};
