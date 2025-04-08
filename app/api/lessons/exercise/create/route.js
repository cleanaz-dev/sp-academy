//api/lessons/exercise/create/route.js
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { createLanguageExercisePrompt } from "@/lib/claudePrompts";

export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
      title,
      subject,
      level,
      type,
      objectives,
      generateImage,
      generateVideo,
      createQuiz,
      questionCount,
      isMultipleChoice,
      exercises,
    } = await request.json();

    console.log("Data from create lecture API:", {
      title,
      subject,
      level,
      type,
      objectives,
      generateImage,
      generateVideo,
      createQuiz,
      questionCount,
      isMultipleChoice,
      exercises,
    });

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const scenarios1 = [
      "a student writing in a notebook",
      "a dog playing with a red ball",
      "a boy kicking a soccer ball",
      "a family having breakfast",
      "two kids eating lunch together",
      "children studying in the library",
    ];

    const scenarios2 = [
      "students raising their hands",
      "a cat sleeping in the sunshine",
      "children playing basketball",
      "kids brushing their teeth",
      "children sharing toys",
      "birds feeding at a bird feeder",
    ];

    const scenarios3 = [
      "kids putting books in backpacks",
      "butterflies on colorful flowers",
      "kids swimming in a pool",
      "students packing their lunch",
      "students working in a group",
      "squirrels collecting acorns",
    ];

    const scenarios4 = [
      "a child reading at a desk",
      "rabbits hopping in a garden",
      "students playing tennis",
      "children making their bed",
      "friends playing board games",
      "children riding bicycles",
    ];

    const scenarios5 = [
      "students working on science",
      "children washing their hands",
      "kids playing baseball",
      "kids getting dressed",
      "children playing at recess",
      "kids helping each other",
    ];

    // Random scenario selectors
    const getRandomScenario = (array) =>
      array[Math.floor(Math.random() * array.length)];

    const randomScene1 = getRandomScenario(scenarios1);
    const randomScene2 = getRandomScenario(scenarios2);
    const randomScene3 = getRandomScenario(scenarios3);
    const randomScene4 = getRandomScenario(scenarios4);
    const randomScene5 = getRandomScenario(scenarios5);

    const systemPrompt = createLanguageExercisePrompt(
      level,
      type,
      randomScene1,
      randomScene2,
      randomScene3,
      randomScene4,
      randomScene5,
    );
    const exercisePrompts = Object.entries(exercises).map(([type, count]) => {
      return `Generate ${count} ${type.replace(
        /_/g,
        " ",
      )} exercises for ${title}.`;
    });

    const userPrompt = `Create exercises for:
      - Title: "${title}"
      - Subject: "${subject}"
      - Grade Level: "${level}"
      - Objectives: "${objectives.join(", ")}"

      Exercise Types:
      ${exercisePrompts.join("\n")}`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
    });

    const responseText = response.content[0].text;
    console.log("Response From Anthropic:", responseText);

    let exercisesResponse;
    try {
      exercisesResponse = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse Claude response:", error);
      return new NextResponse("Failed to parse exercise data", { status: 500 });
    }

    return NextResponse.json({
      success: true,
      exercises: exercisesResponse.exercises,
    });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return new NextResponse("Error creating exercise", { status: 500 });
  }
}
