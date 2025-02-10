import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    // Fetch the quiz including its questions
    const quiz = await prisma.quiz.findUnique({
      where: { lessonId: params.lessonId },
      include: { 
        questions: true,
        lesson: {
          select: { title: true },
        } 
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Fetch the course that contains this lesson
    const course = await prisma.course.findFirst({
      where: { lessons: { some: { id: params.lessonId } } },
      select: { id: true },
    });

    // Spread the quiz object and add the course as an extra property.
    // This way, the quiz data remains as-is (its keys are at the top level)
    // and you also have a `course` key.
    return NextResponse.json({ ...quiz, course });
  } catch (error) {
    console.error('Failed to fetch quiz:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 });
  }
}
