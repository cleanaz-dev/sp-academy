//api/generate/games/preview/route.js
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createGameImages } from "@/lib/replicate";
import {
  createVisualGamePrompt,
  createGrammarDetectiveGamePrompt,
} from "@/lib/claudePrompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("data:", data);

    const systemPrompt = createGrammarDetectiveGamePrompt();

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: systemPrompt,
        },
      ],
    });

    if (!response || !response.content || !response.content[0]) {
      return NextResponse.json(
        { error: "An error occurred while generating the game." },
        { status: 500 },
      );
    }

    const responseText = response.content[0].text;
    console.log("responseText:", responseText);

    let gameData;
    try {
      gameData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON Parsing Error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON format received from Claude." },
        { status: 500 },
      );
    }
    return NextResponse.json({ game: responseText });
    // Extract image prompts
    function extractImagePrompts(gameData) {
      return gameData
        .map((item) => {
          const imageKey = Object.keys(item).find((key) =>
            key.startsWith("image-"),
          );
          return imageKey ? item[imageKey] : null;
        })
        .filter(Boolean);
    }

    const imagePrompts = extractImagePrompts(gameData);
    console.log("imagePrompts:", imagePrompts);

    // Generate images for each prompt and store URLs
    const imageUrls = [];
    for (const prompt of imagePrompts) {
      try {
        const imageUrl = await createGameImages(prompt, data.language);
        console.log("Image URL generated:", imageUrl);
        imageUrls.push(imageUrl); // Store the generated URL
      } catch (error) {
        console.error("Error generating image for prompt:", prompt, error);
        imageUrls.push(null); // Push null if image generation fails
      }
    }

    // Attach image URLs to gameData
    const enhancedGameData = gameData.map((item, index) => ({
      ...item,
      imageUrl: imageUrls[index] || null, // Add imageUrl to each question
    }));

    return NextResponse.json({ game: enhancedGameData });
  } catch (error) {
    console.error("Anthropic API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while generating the game." },
      { status: 500 },
    );
  }
}
