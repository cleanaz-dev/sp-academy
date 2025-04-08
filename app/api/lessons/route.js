import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Assuming you have Prisma set up

export async function POST(request) {
  const { title, content, subject } = await request.json();

  try {
    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        subject,
      },
    });

    return NextResponse.json({ id: lesson.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating lesson" },
      { status: 500 },
    );
  }
}
