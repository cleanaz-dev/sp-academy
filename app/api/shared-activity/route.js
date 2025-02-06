// app/api/shared-activity/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sharedUsers = await prisma.accountSettings.findMany({
      where: {
        OR: [
          { shareReadingLogs: true },
          { shareConversationActivity: true }
        ],
      },
      select: {
        userId: true,
        shareReadingLogs: true,
        shareConversationActivity: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    const sharedUserIds = sharedUsers.map(user => user.userId);

    const [readingLogs, conversations] = await Promise.all([
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
      })
    ]);

    return NextResponse.json({ readingLogs, conversations });
  } catch (error) {
    console.error('Error fetching shared activity:', error);
    return NextResponse.json({ error: 'Failed to fetch shared activity' }, { status: 500 });
  }
}