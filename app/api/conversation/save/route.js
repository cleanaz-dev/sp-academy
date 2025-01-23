//api/conversation/save/route.js
import { NextResponse } from "next/server";
import { saveConversationDialogue } from "@/lib/actions";

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("Received data:", data);

    // Prepare image prompt
    const imagePrompt = `Image representing: Title: ${data.title} with a 9:16 aspect ratio`;

    // Step 1: Call image generation API
    const imageResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: imagePrompt }),
    });

    if (!imageResponse.ok) throw new Error("Failed to generate image");

    const imageData = await imageResponse.json();

    // Ensure the response structure matches expectations
    if (!imageData.success || !imageData.imageUrl) {
      throw new Error("Image URL missing in response");
    }

    // Convert base64 to Blob
    const base64Response = await fetch(`data:image/png;base64,${imageData.imageUrl}`);
    const imageBlob = await base64Response.blob();

    // Step 2: Upload the generated image
    const imageFormData = new FormData();
    imageFormData.append("image", imageBlob);

    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-story-image`, {
      method: "POST",
      body: imageFormData,
    });

    const uploadResult = await uploadResponse.json();
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || "Failed to upload image");
    }

    // Use the uploaded image URL
    const uploadedImageUrl = uploadResult.imageUrl;

    // Step 3: Add uploaded image URL to data and save to database
    const newData = { ...data, imageUrl: uploadedImageUrl };
    await saveConversationDialogue(newData);

    return NextResponse.json({ 
      message: "Data saved successfully!", 
      imageUrl: uploadedImageUrl 
    }, { status: 200 });

  } catch (error) {
    console.error("Error saving data:", error.message);
    return NextResponse.json({ 
      error: "An error occurred while saving data." 
    }, { status: 500 });
  }
}