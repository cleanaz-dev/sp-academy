import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/foundation-lessons?courseId=X&limit=3
// returns the LAST N lessons' handoff cards, chronological order:

// Query orderBy: { orderIndex: "desc" }, take: N, then reverse before returning — prompts read better oldest→newest. Protect it with the same x-internal-secret header; it's machine-to-machine, not user-facing.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  const limit = parseInt(searchParams.get("limit") as string);

  if (!courseId || isNaN(limit)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const lessons = await prisma.foundationLesson.findMany({
    where: { foundationCourseId: courseId },
    orderBy: { orderIndex: "desc" },
    take: limit,
    select: {
      lessonHandoff: true,
      orderIndex: true,
    },
  });

  // Reverse the lessons to return them in chronological order
  lessons.reverse();

  return NextResponse.json(lessons);
}
