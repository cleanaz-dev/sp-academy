// create-book-cover.ts
import { replicate } from "../config/client";

interface BookCoverData {
  title: string;
  mainCharacter: string;
  description: string;
}

export const createBookCover = async (data: BookCoverData) => {
  try {
    const prompt = `Children's book cover illustration: ${data.mainCharacter} ${data.description}. Title: "${data.title}". Colorful, friendly style suitable for kids.`;

    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-schnell",
      input: {
        prompt: prompt,
        aspect_ratio: "1:1",
        output_format: "webp",
      },
    });

    const result = await replicate.wait(prediction);
    
    if (!result?.output?.[0]) {
      throw new Error("No cover image generated");
    }

    return result.output[0]; // Returns the cover image URL
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Book cover creation failed: ${message}`);
  }
};