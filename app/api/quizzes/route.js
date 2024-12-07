import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(request) {
  const { lessonId, title, questions } = await request.json();
  

  try {
    const quiz = await prisma.quiz.create({
      data: {
        title,
        lessonId,
        questions: {
          create: questions.map(q => ({
            text: q.text,
            options: q.options,
            answer: q.answer
          }))
        }
      },
      include: {
        questions: true
      }
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error('Failed to create quiz:', error);
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }
}

// export async function GET(request) {
//   console.log("hello from quizzes api");

//   // Create a response object
//   const response = {
//     message: "Hello from the quizzes API!",
//     data: [], // You can add your quiz data or other relevant information here
//   };

//   // Return the response using NextResponse
//   return NextResponse.json(response);
// }