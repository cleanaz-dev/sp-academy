//api/conversation/save/route.js
import { NextResponse } from "next/server";
import { saveConversationDialogue } from "@/lib/actions";
import { createAiAvatar } from "@/lib/replicate"; // Importing the avatar function

// Shared function to generate and upload an image
const generateAndUploadImage = async (prompt) => {
  console.log("Starting generateAndUploadImage with prompt:", prompt);

  try {
    const imageResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/generate-image`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      },
    );

    if (!imageResponse.ok) {
      throw new Error(`Failed to generate image: ${imageResponse.statusText}`);
    }

    const imageData = await imageResponse.json();
    console.log("Image generation response:", imageData);

    if (!imageData.success || !imageData.imageUrl) {
      throw new Error("Image URL missing in response");
    }

    // Convert base64 to Blob
    const base64Response = await fetch(
      `data:image/png;base64,${imageData.imageUrl}`,
    );
    const imageBlob = await base64Response.blob();

    // Upload Image
    const imageFormData = new FormData();
    imageFormData.append("image", imageBlob);

    const uploadResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/upload-story-image`,
      {
        method: "POST",
        body: imageFormData,
      },
    );

    const uploadResult = await uploadResponse.json();
    console.log("Upload result:", uploadResult);

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || "Failed to upload image");
    }

    return uploadResult.imageUrl;
  } catch (error) {
    console.error("Error in generateAndUploadImage:", error);
    throw error;
  }
};

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("Received data:", data);
    const { title, characters } = data;

    const role = characters[1].role;

    // Function to create an image for the story
    const createImageForStory = async (title) => {
      const prompt = `Image representing: Title: ${title} with a 9:16 aspect ratio`;
      return await generateAndUploadImage(prompt);
    };

    // Generate the story image
    const storyImageUrl = await createImageForStory(title);
    console.log("Story image URL generated:", storyImageUrl);

    // Generate an AI avatar image (general avatar)
    const aiAvatarUrl = await createAiAvatar(title);
    console.log("AI Avatar URL generated:", aiAvatarUrl);

    // Generate a male AI avatar image
    const maleAiAvatarUrl = await createAiAvatar(title, "male", role);
    console.log("Male AI Avatar URL generated:", maleAiAvatarUrl);

    // Generate a female AI avatar image
    const femaleAiAvatarUrl = await createAiAvatar(title, "female", role);
    console.log("Female AI Avatar URL generated:", femaleAiAvatarUrl);

    // Save to database with the generated images
    const newData = {
      ...data,
      imageUrl: storyImageUrl,
      aiAvatarUrl,
      maleAiAvatarUrl,
      femaleAiAvatarUrl,
    };
    await saveConversationDialogue(newData);

    return NextResponse.json(
      {
        message: "Data saved successfully!",
        imageUrl: storyImageUrl,
        aiAvatarUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error saving data:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "An error occurred while saving data: " + error.message },
      { status: 500 },
    );
  }
}
