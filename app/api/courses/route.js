// app/api/courses/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    // Get courseId and userId from URL search params
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const userId = searchParams.get("userId");

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: "Course ID and User ID are required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: { userId: userId },
    });

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        enrollments: {
          where: {
            userId: user.id,
          },
        },

        lessons: {
          include: {
            Progress: {
              where: {
                userId: user.id,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { title, description, level } = await request.json();
    console.log("Data from POST request:", { title, description, level });

    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        level,
        status: "PUBLISHED",
      },
    });
    return NextResponse.json(
      {
        message: "Course created successfully",
        course: newCourse,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
