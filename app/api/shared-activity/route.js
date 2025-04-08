// app/api/shared-activity/route.js
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth, getAuth } from "@clerk/nextjs/server";
import { headers as nextHeaders, cookies } from "next/headers";

export async function GET() {
  try {
    // Get the user's ID from the authentication context
    const authData = auth();
    // some lines later...
    const headers = new Headers(nextHeaders());
    const { userId } = authData;

    if (!userId) {
      throw new Error("Unauthorized");
    }
    const user = await prisma.user.findFirst({ where: { userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sharedUsers = await prisma.accountSettings.findMany({
      where: {
        OR: [
          { shareReadingLogs: true },
          { shareConversationActivity: true },
          { shareAchievements: true },
          { shareLessonsAndCourses: true },
        ],
      },
      select: {
        userId: true,
        shareReadingLogs: true,
        shareConversationActivity: true,
        shareAchievements: true,
        shareLessonsAndCourses: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    const sharedUserIds = sharedUsers.map((user) => user.userId);

    const [
      readingLogs,
      conversations,
      achievements,
      enrollments,
      completedLessons,
      completedBooks,
    ] = await Promise.all([
      // Reading Logs Query
      prisma.readingLog.findMany({
        where: {
          book: { userId: { in: sharedUserIds } },
        },
        include: {
          book: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  AccountSettings: {
                    select: {
                      displayName: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),

      // Conversations Query
      prisma.conversationRecord.findMany({
        where: {
          userId: { in: sharedUserIds },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              AccountSettings: {
                select: {
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          conversation: {
            select: {
              title: true,
              imageUrl: true,
              tutorLanguage: true,
              level: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),

      // Achievements Query
      prisma.userProgress.findMany({
        where: {
          userId: { in: sharedUserIds },
          isUnlocked: true,
          unlockedAt: { not: null },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              AccountSettings: {
                select: {
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          achievement: {
            select: {
              id: true,
              name: true,
              description: true,
              imageUrl: true,
              criteria: true,
            },
          },
        },
        orderBy: {
          unlockedAt: "desc",
        },
        take: 20,
      }),

      // New query for course enrollments
      prisma.enrollment.findMany({
        where: {
          userId: { in: sharedUserIds },
          status: { in: ["NOT_STARTED", "IN_PROGRESS"] }, // Include both statuses for new enrollments
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              AccountSettings: {
                select: {
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          course: {
            select: {
              title: true,
              description: true,
              level: true,
              status: true,
              coverUrl: true, // You might want to only show PUBLISHED courses
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),

      // New query for completed lessons
      prisma.progress.findMany({
        where: {
          userId: { in: sharedUserIds },
          status: "COMPLETED", // Make sure this matches your Status enum
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              AccountSettings: {
                select: {
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          lesson: {
            select: {
              title: true,
              description: true,
              level: true,
              course: {
                select: {
                  title: true,
                  coverUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc", // Changed from completedAt to updatedAt since that's what we have
        },
        take: 20,
      }),

      prisma.book.findMany({
        where: {
          userId: { in: sharedUserIds },
          isCompleted: true, // Only fetch completed books
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              AccountSettings: {
                select: {
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc", // Sort by when the book was marked as completed
        },
        take: 20,
      }),
    ]);

    // Get all likes in one query (updated to include new activity types)
    const likes = await prisma.like.findMany({
      where: {
        userId: user.id,
        activityId: {
          in: [
            ...readingLogs.map((l) => l.id),
            ...conversations.map((c) => c.id),
            ...achievements.map((a) => a.id),
            ...enrollments.map((e) => e.id),
            ...completedLessons.map((l) => l.id),
            ...completedBooks.map((b) => b.id),
          ],
        },
      },
    });

    // Get all like counts in one query (updated to include new activity types)
    const likeCounts = await prisma.like.groupBy({
      by: ["activityId"],
      _count: {
        _all: true,
      },
      where: {
        activityId: {
          in: [
            ...readingLogs.map((l) => l.id),
            ...conversations.map((c) => c.id),
            ...achievements.map((a) => a.id),
            ...enrollments.map((e) => e.id),
            ...completedLessons.map((l) => l.id),
            ...completedBooks.map((b) => b.id),
          ],
        },
      },
    });

    // Transform data function (updated to handle completedBooks)
    const transformData = (items, type) =>
      items.map((item) => ({
        ...item,
        type,
        createdAt:
          type === "Achievement"
            ? item.unlockedAt
            : type === "CompletedLesson" || type === "CompletedBook" // Handle completedBooks
              ? item.updatedAt
              : item.createdAt,
        liked: likes.some((like) => like.activityId === item.id),
        likes:
          likeCounts.find((count) => count.activityId === item.id)?._count
            ._all || 0,
      }));

    return NextResponse.json({
      readingLogs: transformData(readingLogs, "ReadingLog"),
      conversations: transformData(conversations, "Conversation"),
      achievements: transformData(achievements, "Achievement"),
      enrollments: transformData(enrollments, "CourseEnrollment"),
      completedLessons: transformData(completedLessons, "CompletedLesson"),
      completedBooks: transformData(completedBooks, "CompletedBook"),
    });
  } catch (error) {
    console.error("Error fetching shared activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared activity" },
      { status: 500 },
    );
  }
}
