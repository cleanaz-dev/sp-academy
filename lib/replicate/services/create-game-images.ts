import { replicate } from "@/lib/replicate";



export const createGameImages = async (prompt: string) => {
  console.log("Running createGameImages with prompt:", prompt);
  try {
    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-schnell",
      input: {
        aspect_ratio: "16:9",
        cfg: 3.5,
        output_format: "webp",
        output_quality: 90,
        num_outputs: 1,
        prompt: prompt,
        num_inference_steps: 4,
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
    console.error("Error in createGameImages:", {
      message: error.message,
      stack: error.stack,
      prompt,
    });
  }
};