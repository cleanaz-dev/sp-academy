import prisma from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function getUserRelevantData(userId) {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      Like: true,
      ConversationRecord: true,
      Book: {
        select: {
          readingLogs: true,
          readingProgress: true,
        },
      },
    },
  });

  const totalReadingLogs = userData.Book.reduce((total, book) => {
    return total + (book.readingLogs?.length || 0);
  }, 0);

  return {
    totalBooks: userData.Book.length,
    totalReadingLogs: totalReadingLogs,
    hasReadingProgress: userData.Book.some(
      (book) => book.readingProgress !== null
    ),
    totalLikes: userData.Like.length,
    hasLikedContent: userData.Like.length > 0,
    totalConversations: userData.ConversationRecord.length,
    hasStartedConversation: userData.ConversationRecord.length > 0,
    books: userData.Book.map((book) => ({
      readingLogsCount: book.readingLogs?.length || 0,
      hasProgress: book.readingProgress !== null,
      progressDetails: book.readingProgress,
    })),
    dataCollectedAt: new Date().toISOString(),
  };
}

async function evaluateAchievementWithAI(userData, criteria) {
  const prompt = `\n\nHuman: Check if this achievement should be unlocked.

    Achievement Criteria: ${criteria.metric}

    User's Current Statistics:
    - Total Books: ${userData.totalBooks}
    - Total Reading Logs: ${userData.totalReadingLogs}
    - Has Reading Progress: ${userData.hasReadingProgress}
    - Total Likes: ${userData.totalLikes}
    - Total Conversations: ${userData.totalConversations}
    - Has Started Conversation: ${userData.hasStartedConversation}

    Based on the achievement criteria and the user's current data, should this achievement be unlocked?
    Reply with only "true" or "false".

    Assistant: `;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 100,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    const aiResponse = response.content[0].text.trim().toLowerCase();
    return aiResponse === "true";
  } catch (error) {
    console.error("Error evaluating achievement with AI:", error);
    return false;
  }
}

export async function checkAchievements() {
  try {
    console.log("Checking achievements...", new Date().toISOString());

    // Modify query based on whether a specific user is provided
    const whereClause = {
      isUnlocked: false,
      ...(specificUserId && { userId: specificUserId }),
    };

    const userProgress = await prisma.userProgress.findMany({
      where: whereClause,
      include: {
        achievement: true,
      },
    });

    console.log(`Found ${userProgress.length} achievements to check`);

    for (const progress of userProgress) {
      try {
        const userData = await getUserRelevantData(progress.userId);

        const isUnlocked = await evaluateAchievementWithAI(
          userData,
          progress.achievement.criteria
        );

        if (isUnlocked) {
          await prisma.userProgress.update({
            where: { id: progress.id },
            data: {
              isUnlocked: true,
              unlockedAt: new Date(),
            },
          });
          console.log(`Achievement unlocked for user ${progress.userId}`);
        }
      } catch (error) {
        console.error(
          `Error processing achievement for user ${progress.userId}:`,
          error
        );
      }
    }

    console.log("Achievement check completed.");
    return { success: true, message: "Achievements checked successfully" };
  } catch (error) {
    console.error("Error in checkAchievements:", error);
    return { success: false, error: error.message };
  }
}
