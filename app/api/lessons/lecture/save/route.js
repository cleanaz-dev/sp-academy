import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadImage } from "@/lib/uploadImage";
import Anthropic from "@anthropic-ai/sdk"; // Import the Anthropic SDK

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Ensure this is set in your environment variables
});

// Function to extract image URLs from Markdown content
const extractImageUrls = (content) => {
  const regex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
  let match;
  const urls = [];
  while ((match = regex.exec(content)) !== null) {
    urls.push(match[1]);
  }
  return urls;
};

export async function POST(request) {
  const { title, content, subject, type, level } = await request.json();

  try {
    // Step 1: Generate newTitle, newDescription, and newTopics using Claude API
    const claudePrompt = `
You are an expert educator. Based on the following lesson content, generate:
1. A concise and engaging title (newTitle)
2. A short description summarizing the lesson (newDescription)
3. A list of 3-5 key topics covered in the lesson (newTopics)

Return the response in the following JSON format:
{
  "newTitle": "Engaging Title Here",
  "newDescription": "A brief summary of the lesson content.",
  "newTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4" ] (only 4)
}

Lesson Content:
${content}
`;

    // Call the Claude API using the SDK
    const response = await anthropic.messages.create({
      messages: [{ role: "user", content: claudePrompt }],
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
    })
    // Parse the response into JSON
    const { newTitle, newDescription, newTopics } = JSON.parse(response.content[0].text);

    // Step 2: Extract image URLs from the content
    const imageUrls = extractImageUrls(content);

    // Step 3: Upload each image using the shared function
    const uploadedUrls = await Promise.all(
      imageUrls.map((url) => uploadImage(url))
    );

    // Step 4: Replace the old URLs with the new ones in the content
    let updatedContent = content;
    imageUrls.forEach((oldUrl, index) => {
      updatedContent = updatedContent.replace(oldUrl, uploadedUrls[index]);
    });

    // Step 5: Create the lesson with the updated content and generated fields
    const lesson = await prisma.lesson.create({
      data: {
        title: newTitle,
        content: updatedContent,
        subject,
        description: newDescription,
        type,
        duration: "30",
        level: parseInt(level, 10),
        topics: newTopics,
      },
    });

    return NextResponse.json({ id: lesson.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json({ error: "Error creating lesson" }, { status: 500 });
  }
}