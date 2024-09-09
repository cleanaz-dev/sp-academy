import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { lessonId, title, content, questionCount, isMultipleChoice} = await request.json();
    // Send data to webhook for quiz creation
    const webhookResponse = await fetch('https://hook.us1.make.com/wiwpntbjp6w97smxnbwy4x985dkcqxcq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, questionCount, isMultipleChoice }),
    })

    if (!webhookResponse.ok) {
      throw new Error('Failed to create quiz');
    }

    const quizData = await webhookResponse.json();
    console.log("quiz questions:", quizData.questions);

    // Create quiz in the database using webhook response
    const quiz = await prisma.quiz.create({
      data:{
        title: quizData.title,
        questions: {
          create: quizData.questions.map(q => ({
            text: q.text,
            options: q.options,
            answer: q.answer
          })),
        },
        lesson: {connect: {id: lessonId}}
    }})
    return NextResponse.json({ id: quiz.id }, { status: 201 });
  } catch (error) {
    console.error('Error in create-quiz API:', error)
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }
}