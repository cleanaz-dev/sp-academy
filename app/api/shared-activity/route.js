// app/api/shared-activity/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = auth();

  try {
    const user = await prisma.user.findFirst({ where: { userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sharedUsers = await prisma.accountSettings.findMany({
      where: {
        OR: [
          { shareReadingLogs: true },
          { shareConversationActivity: true },
          { shareAchievements: true }
        ],
      },
      select: {
        userId: true,
        shareReadingLogs: true,
        shareConversationActivity: true,
        shareAchievements: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    const sharedUserIds = sharedUsers.map(user => user.userId);

    const [readingLogs, conversations, achievements] = await Promise.all([
      prisma.readingLog.findMany({
        where: {
          bookReport: { userId: { in: sharedUserIds } }
        },
        include: {
          bookReport: {
            include: {
              user: {
                select: {
                  name: true,
                  AccountSettings: {
                    select: {
                      displayName: true,
                      avatarUrl: true,
                    }
                  }
                }
              },
              book: {
                select: {
                  title: true,
                  author: true,
                  coverUrl: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      }),
      prisma.conversationRecord.findMany({
        where: {
          userId: { in: sharedUserIds }
        },
        include: {
          user: {
            select: {
              name: true,
              AccountSettings: {
                select: {
                  displayName: true,
                  avatarUrl: true,
                }
              }
            }
          },
          conversation: {
            select: {
              title: true,
              imageUrl: true,
              tutorLanguage: true,
              level: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      }),
      prisma.userProgress.findMany({
        where: {
          userId: { in: sharedUserIds },
          isUnlocked: true
        },
        include: {
          user: {
            select: {
              name: true,
              AccountSettings: {
                select: {
                  displayName: true,
                  avatarUrl: true,
                }
              }
            }
          },
          achievement: {
            select: {
              name: true,
              description: true,
              imageUrl: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      })
    ]);

    // Get all likes in one query
    const likes = await prisma.like.findMany({
      where: {
        userId: user.id,
        activityId: {
          in: [
            ...readingLogs.map(l => l.id),
            ...conversations.map(c => c.id),
            ...achievements.map(a => a.id)
          ]
        }
      }
    });

    // Get all like counts in one query
    const likeCounts = await prisma.like.groupBy({
      by: ['activityId'],
      _count: {
        _all: true
      },
      where: {
        activityId: {
          in: [
            ...readingLogs.map(l => l.id),
            ...conversations.map(c => c.id),
            ...achievements.map(a => a.id)
          ]
        }
      }
    });

    // Transform function
    const transformData = (items, type) => items.map(item => ({
      ...item,
      type,
      liked: likes.some(like => like.activityId === item.id),
      likes: likeCounts.find(count => count.activityId === item.id)?._count._all || 0
    }));

    return NextResponse.json({
      readingLogs: transformData(readingLogs, 'ReadingLog'),
      conversations: transformData(conversations, 'Conversation'),
      achievements: transformData(achievements, 'Achievement')
    });

  } catch (error) {
    console.error('Error fetching shared activity:', error);
    return NextResponse.json({ error: 'Failed to fetch shared activity' }, { status: 500 });
  }
}