// api/lessons/exercise/save/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";

// Helper function to normalize correct answers based on exercise type
function normalizeCorrectAnswer(exercise) {
  switch (exercise.type) {
    case "fill_in_blank":
      // Ensure the answer is always an array
      return JSON.stringify(
        Array.isArray(exercise.correct_answer)
          ? exercise.correct_answer
          : [exercise.correct_answer]
      );

    case "drag_and_drop":
      // Ensure the answer is a string (correct order of words)
      return JSON.stringify(exercise.correct_answer);

    case "matching_pairs":
      // Ensure the answer is a JSON object of pairs
      return JSON.stringify(
        exercise.pairs.reduce((acc, pair) => {
          acc[pair.word] = pair.match;
          return acc;
        }, {})
      );

    case "audio_based":
      // Ensure the answer is a number (index of the correct choice)
      return String(exercise.correct_answer);

    case "image_word_input":
      // Ensure the answer is a string
      return String(exercise.correct_answer);

    default:
      // Fallback for unknown types
      return JSON.stringify(exercise.correct_answer);
  }
}

// Function to analyze exercise data using Anthropic
async function analyzeExerciseData(exercises) {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `
      Analyze the exercises and extract 4 topics and a 20-word description.
      Return the response in the following JSON format ONLY:
      {
        "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
        "description": "A 20-word description."
      }
    `;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1600,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{ role: "user", content: JSON.stringify(exercises) }],
    });

    if (!response) {
      throw new Error("No completion received from Anthropic");
    }

    const responseContent = response.content[0].text;
    return JSON.parse(responseContent);
  } catch (error) {
    console.error("Anthropic error:", error);
    return {
      topics,
      description,
    };
  }
}

// Main API route
export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { exercises, ...lessonData } = await request.json();

    // Validate required fields
    if (!lessonData.title || !lessonData.courseId) {
      return new NextResponse("Missing title or course ID", { status: 400 });
    }

    // Analyze exercise data
    const { topics, description } = await analyzeExerciseData(exercises);

    // Save lesson
    const savedLesson = await prisma.lesson.create({
      data: {
        title: lessonData.title,
        subject: lessonData.subject,
        level: parseInt(lessonData.level, 10),
        type: lessonData.type,
        content: "",
        courseId: lessonData.courseId,
        topics: topics.slice(0, 4), // Ensure max 4 topics
        description,
      },
    });

    // Save exercises
    if (exercises?.length) {
      await prisma.$transaction(
        exercises.map((exercise, index) =>
          prisma.exercise.create({
            data: {
              title: exercise.title,
              type: exercise.type,
              question: exercise.question,
              order: index,
              correctAnswer: normalizeCorrectAnswer(exercise), // Normalize correct answer
              additionalData: {
                header: exercise.header,
                imageUrl: exercise.imageUrl,
                scrambledWords: exercise.scrambled_words,
                sentences: exercise.sentences,
                pairs: exercise.pairs,
                audioScript: exercise.audio_script,
                multipleChoice: exercise.multiple_choice,
                feedback: exercise.feedback,
              },
              lessonId: savedLesson.id,
              objectives: lessonData.objectives,
            },
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      lessonId: savedLesson.id,
      exerciseCount: exercises.length,
    });
  } catch (error) {
    console.error("Save failed:", error);
    return new NextResponse(error.message, { status: 500 });
  }
}