// app/api/shared-activity/like/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  const { userId } = auth();

  try {
    const { id, liked, type } = await request.json();
    
    const user = await prisma.user.findFirst({ where: { userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (liked) {
      await prisma.like.create({
        data: {
          userId: user.id,
          activityId: id,
          type
        }
      });
    } else {
      await prisma.like.deleteMany({
        where: {
          userId: user.id,
          activityId: id
        }
      });
    }

    const likeCount = await prisma.like.count({
      where: { activityId: id }
    });

    return NextResponse.json({ likes: likeCount });
  } catch (error) {
    console.error("Error updating like:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}