import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createGameImages } from "@/lib/replicate";
import templates from "@/lib/game-templates";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    console.log("Received request for game generation");

    const { gameType, slug, ...data } = await request.json();
    console.log("Parsed request data:", { gameType, data });

    // 1. Get template
    const template = templates.find((t) => t.slug === slug);
    if (!template) {
      console.error("Invalid game type:", gameType);
      return NextResponse.json({ error: "Invalid game type" }, { status: 400 });
    }
    console.log("Selected template:", template.name);

    // 2. Generate prompt
    const prompt = template.createPrompt(data);
    console.log("Generated prompt:", prompt);

    // 3. Get Claude response
    console.log("Sending prompt to Claude...");
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });
    console.log("Received response from Claude:", response);

    // 4. Parse response
    const gameData = template.parseResponse(response.content[0].text);
    console.log("Parsed game data:", gameData);

    // 5. Post-process
    let finalData = template.postProcess(gameData);
    console.log("Post-processed game data:", finalData);

    // 6. Handle images if needed
    if (template.needsImages) {
      console.log("Generating images for game...");
      finalData = await handleImageGeneration(finalData, data.language);
      console.log("Generated images, final game data:", finalData);
    }

    console.log("Game generation complete, returning response");
    return NextResponse.json({
      game: finalData,
      previewComponent: template.slug,
      slug: slug, // Tells frontend which component to use
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleImageGeneration(data, language) {
  // ... existing image generation logic ...
}
