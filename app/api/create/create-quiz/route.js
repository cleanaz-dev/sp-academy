// api/create-quiz/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request) {
  try {
    const { lessonId, title, content, questionCount, isMultipleChoice } =
      await request.json();

    if (!isMultipleChoice) {
      return NextResponse.json(
        { error: "Only multiple-choice quizzes are supported" },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const systemPrompt = `
        You are an educational AI tutor that converts lesson content into multiple-choice quizzes for grade 5-6 students. 
        Based on the given content, generate a quiz with exactly ${questionCount} questions. 
        Format your response strictly as JSON in the following structure:

        {
          "title": "${title}",
          "questions": [
            {
              "text": "Question text here",
              "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
              "answer": "Correct Answer"
            }
          ]
        }
          
        OUTPUT JSON ONLY`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: content }],
    });

    const responseText = response.content?.[0]?.text;

    if (!responseText) {
      throw new Error("Invalid AI response format");
    }

    let parsedQuiz;
    try {
      parsedQuiz = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse AI response:", responseText);
      throw new Error("AI response is not valid JSON");
    }

    const { title: quizTitle, questions } = parsedQuiz;

    // Create quiz in the database
    const quiz = await prisma.quiz.create({
      data: {
        title: quizTitle,
        lesson: { connect: { id: lessonId } },
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            options: q.options,
            answer: q.answer,
          })),
        },
      },
    });

    return NextResponse.json({ id: quiz.id }, { status: 201 });
  } catch (error) {
    console.error("Error in create-quiz API:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
