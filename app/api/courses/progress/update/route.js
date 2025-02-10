//app/api/courses/progress/update/route.js

import prisma from "@/lib/prisma"; // Ensure you have Prisma setup
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId, lessonId } = await req.json();

    if (!userId || !lessonId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { userId },
    })

    // Find existing progress
    const existingProgress = await prisma.progress.findFirst({
      where: { userId: user.id, lessonId },
    });

    if (existingProgress) {
      // If progress exists, update it to "IN_PROGRESS"
      await prisma.progress.update({
        where: { id: existingProgress.id },
        data: { status: "IN_PROGRESS", updatedAt: new Date() },
      });
    } else {
      // If no progress exists, create a new entry
      await prisma.progress.create({
        data: {
          userId: user.id,
          lessonId,
          status: "IN_PROGRESS",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
