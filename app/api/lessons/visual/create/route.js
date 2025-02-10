//api/lessons/visual/create/route.js
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, level, subject, topic, visualStyle } = await request.json();

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const systemPrompt = `You are creating a visual educational resource. Create detailed descriptions for ${visualStyle} following these guidelines:

Visual Format Guidelines:
- Infographic: Create organized, hierarchical information with visual elements
- Diagram: Create detailed technical or conceptual illustrations
- Timeline: Create chronological representations of events or processes

FORMAT YOUR RESPONSE IN MARKDOWN:

# [Visual Title]

## Description
[Overview of the visual content]

## Visual Elements
[Detailed description of visual components]

## Layout
[Specific layout instructions]

## Content Details
[Detailed content for each section]

## Notes
[Additional context or instructions]`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Create a visual resource with:
Title: "${title}"
Topic: "${topic}"
Grade Level: "${level}"
Subject: "${subject}"
Visual Style: "${visualStyle}"`,
        },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({
      success: true,
      responseText: response.content[0].text,
    });
  } catch (error) {
    console.error("Error creating visual resource:", error);
    return new NextResponse("Error creating visual resource", { status: 500 });
  }
}