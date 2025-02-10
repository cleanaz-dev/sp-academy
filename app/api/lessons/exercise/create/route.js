//api/lessons/lecture/create/route.js
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, level, subject, topic, exerciseType } = await request.json();

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const systemPrompt = `You are creating an educational exercise. Create age-appropriate ${exerciseType} exercises following these guidelines:

Exercise Format Guidelines:
- Practice: Create practice problems with step-by-step solutions
- Assessment: Create assessment questions with answer keys
- Interactive: Create interactive scenarios with guided responses

FORMAT YOUR RESPONSE IN MARKDOWN:

# [Exercise Title]

## Overview
[Brief description of the exercise]

## Learning Objectives
[2-3 clear objectives]

## Exercise Content
[Series of problems/questions based on exerciseType]

## Solutions/Answer Key
[Detailed solutions or answer key]

## Additional Notes
[Any special instructions or tips]`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Create an exercise with:
            Title: "${title}"
            Topic: "${topic}"
            Grade Level: "${level}"
            Subject: "${subject}"
            Exercise Type: "${exerciseType}"`,
        },
      ],
      temperature: 0.7,
    });

    const responseText = response.content[0].text;

    console.log("Response From Anthropic:", responseText);


    return NextResponse.json({
      success: true,
      responseText: response.content[0].text,
    });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return new NextResponse("Error creating exercise", { status: 500 });
  }
}