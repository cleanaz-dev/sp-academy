import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { lessonId: params.id },
      include: { questions: true }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Failed to fetch quiz:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 });
  }
}