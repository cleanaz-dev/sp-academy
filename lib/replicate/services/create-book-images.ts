// create-book-images.ts
import { replicate } from "../config/client";

interface PageImage {
  pageNumber: number;
  description: string;
}

interface BookImagesData {
  coverImageUrl: string;
  pages: PageImage[];
}

export const createBookImages = async (data: BookImagesData) => {
  try {
    const imageUrls: string[] = [];

    for (const page of data.pages) {
      const input = {
        image: data.coverImageUrl,
        prompt: `Children's book illustration: ${page.description}. Page ${page.pageNumber}.`,
      };

      const output = await replicate.run("google/nano-banana", { input });
      
      if (output?.[0]) {
        imageUrls.push(output[0]);
      }
    }

    return imageUrls;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Book images creation failed: ${message}`);
  }
};