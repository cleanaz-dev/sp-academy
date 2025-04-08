import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  const { userId } = auth();

  try {
    const {
      id,
      liked,
      type,
      item: { type: itemType, typeName },
      userId: itemUserId,
    } = await request.json();

    const userPerformingLike = await prisma.user.findFirst({
      where: { userId },
    });
    if (!userPerformingLike) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_activityId: {
          userId: userPerformingLike.id,
          activityId: id,
        },
      },
    });

    if (liked) {
      if (!existingLike) {
        // Skip notification if the user is liking their own activity
        const isLikingOwnActivity = userPerformingLike.id === itemUserId;

        await prisma.$transaction([
          prisma.like.create({
            data: {
              userId: userPerformingLike.id,
              activityId: id,
              type,
            },
          }),
          // Only create a notification if the user is not liking their own activity
          ...(isLikingOwnActivity
            ? []
            : [
                prisma.notification.create({
                  data: {
                    userId: itemUserId, // Receiver
                    toUserId: itemUserId,
                    fromUserId: userPerformingLike.id, // Sender
                    activityId: id,
                    activityType: itemType,
                    type: "LIKE",
                    activityTitle: `${userPerformingLike.name} liked your ${typeName}`,
                  },
                }),
              ]),
        ]);
      }
    } else {
      if (existingLike) {
        await prisma.$transaction([
          prisma.like.delete({
            where: { id: existingLike.id },
          }),
          prisma.notification.deleteMany({
            where: {
              fromUserId: userPerformingLike.id, // Match liker's ID
              activityId: id,
              type: "LIKE",
            },
          }),
        ]);
      }
    }

    const likeCount = await prisma.like.count({
      where: { activityId: id },
    });

    return NextResponse.json({ likes: likeCount });
  } catch (error) {
    console.error("Error updating like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
