import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const data = await request.json();

    const { metadata, analysis } = data;

    // Validate User
    const user = await prisma.user.findFirst({
      where: { userId: metadata.userId },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if an entry already exists for this user and story
    const existingQuestion = await prisma.storyQuestions.findFirst({
      where: {
        storyId: metadata.storyId,
        userId: user.id,
      },
    });

    if (existingQuestion) {
      // Delete existing entry
      await prisma.storyQuestions.delete({
        where: { id: existingQuestion.id },
      });
    }

    // Construct the new question data
    const storyQuestionData = {
      storyId: metadata.storyId,
      question: [
        analysis.first_questions,
        analysis.second_questions,
        analysis.third_questions,
        analysis.fourth_questions,
      ],
      answer: [
        analysis.first_answer,
        analysis.second_answer,
        analysis.third_answer,
        analysis.fourth_answer,
      ],
      mark: `${analysis.correct_answers}/${analysis.correct_answers + analysis.incorrect_answers}`,
      userId: user.id,
    };

    // Create a new entry
    const savedData = await prisma.storyQuestions.create({
      data: storyQuestionData,
    });

    return new NextResponse(JSON.stringify(savedData), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving data:", error);

    return new NextResponse(
      JSON.stringify({ error: "Failed to save data", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET() {
  return new NextResponse("Hello from the data processing API!");
}