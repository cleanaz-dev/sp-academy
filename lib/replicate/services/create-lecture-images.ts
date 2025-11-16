import { replicate } from "../config/client";

export const createImagesForLecture = async (imagePrompt: string) => {
  console.log("Running createImagesForLecture with prompt:", imagePrompt);
  try {
    const prediction = await replicate.predictions.create({
      model: "recraft-ai/recraft-v3",
      input: {
        prompt: imagePrompt, // Use the passed prompt
        size: "1365x1024",
        style: "realistic_image",
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
    console.error("Error in createImagesForLecture:", {
      message: error.message,
      stack: error.stack,
      imagePrompt,
    });
    throw new Error(`Image creation failed: ${error.message}`);
  }
};