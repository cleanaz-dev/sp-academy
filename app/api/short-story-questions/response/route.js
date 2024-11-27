import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const data = await request.json();
  

    // Transform the data to match the StoryQuestions schema
    const { metadata, analysis_schema, analysis } = data;
    console.log(metadata + analysis)

    // Validate User
    const user = await prisma.user.findFirst({
      where: { userId: metadata.userId },
    });

    // Validate and construct the data object
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
      userId: user.id
    };

    

    // Save to the database
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