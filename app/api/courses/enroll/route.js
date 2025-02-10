// app/api/courses/enroll/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { courseId, userId } = await request.json();
    console.log("Course ID: ", courseId, "User ID: ", userId);

    // Validate input
    if (!courseId || !userId) {
      return NextResponse.json(
        { error: "Course ID and User ID are required" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findFirst({
      where: { userId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if enrollment exists
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        AND: [
          { userId: user.id },
          { courseId: courseId }
        ]
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "User is already enrolled in this course" },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        courseId: courseId.id,
        status: 'NOT_STARTED', // Assuming you have this enum value
        progress: 0,
        user: { connect: { id: user.id } },
        course: { connect: { id: courseId } }
      },
    });

    return NextResponse.json({
      message: "Successfully enrolled in course",
      enrollment
    }, { status: 201 });

  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: "Failed to process enrollment" },
      { status: 500 }
    );
  }
}