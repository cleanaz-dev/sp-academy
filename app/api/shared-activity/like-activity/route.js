//api/shared-activity/like-activity/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { id, liked } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Activity ID is required" }, { status: 400 });
    }

    // Update the like count
    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        likes: {
          increment: liked ? 1 : -1, // Increment if liked, decrement if unliked
        },
      },
      select: { id: true, likes: true }, // Return only necessary data
    });

    return NextResponse.json({ likes: updatedActivity.likes }, { status: 200 });
  } catch (error) {
    console.error("Error updating like count:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}