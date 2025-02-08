"use server";

import { redirect } from "next/navigation";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";
import { Anthropic } from "@anthropic-ai/sdk";
import { headers } from "next/headers";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function getLessonById(id) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { quiz: true },
    });
    return lesson;
  } catch (error) {
    console.error("Failed to fetch lesson:", error);
    return null;
  }
}

export async function getAllLessons() {
  try {
    const lessons = await prisma.lesson.findMany();
    return lessons;
  } catch (error) {
    console.error("Failed to fetch lessons:", error);
    return null;
  }
}

export async function getUserbyUserId(userId) {
  try {
    const user = await prisma.user.findFirst({
      where: { userId: userId },
    });
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}

export const recordJournal = async (formData) => {
  try {
    const name = formData.get("name");
    const phoneNumber = formData.get("phoneNumber");
    const userId = formData.get("userId");
    const journalId = formData.get("journalId") || null;

    console.log(journalId);

    const data = {
      name,
      phoneNumber,
      userId,
      journalId,
    };

    const response = await fetch("https://sp-academy.vercel.app/api/journal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to record journal:", error);
  }

  redirect("/home");
};

export const recordConversation = async (formData) => {
  try {
    const name = formData.get("name");
    const phoneNumber = formData.get("phoneNumber");
    const userId = formData.get("userId");
    const journalId = formData.get("journalId") || null;

    console.log(journalId);

    const data = {
      name,
      phoneNumber,
      userId,
      journalId,
    };

    const response = await fetch(
      "https://sp-academy.vercel.app/api/conversation/call-user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to record journal:", error);
  }

  redirect("/home");
};

export const getJournalByUserId = async (userId) => {
  try {
    const user = await prisma.user.findFirst({
      where: { userId: userId },
      include: { Journal: true },
    });

    if (!user) {
      console.error("User not found");
      return null;
    }

    return user;
  } catch (error) {
    console.error("Journals not found");
  }
};

export const deleteJournalById = async (id) => {
  try {
    await prisma.journal.delete({
      where: { id: id },
    });
  } catch (error) {
    console.error("Failed to delete journal:", error);
  }
  revalidatePath("/journals/history");
};

// lib/actions.js
export async function saveStory(formData) {
  try {
    console.log("Saving story with audio URL:", formData.audioUrl);

    const story = await prisma.story.create({
      data: {
        title: formData.title || "",
        topic: formData.topic,
        difficulty: formData.difficulty,
        paragraphs: parseInt(formData.paragraphs),
        genre: formData.genre,
        grammar: formData.grammar,
        frenchText: formData.frenchText,
        englishText: formData.englishText,
        vocabulary: formData.vocabulary,
        grammarHighlights: formData.grammarHighlights,
        audioUrl: formData.audioUrl,
        imageUrl: formData.imageUrl,
        exercises: formData.exercises,
      },
    });

    console.log("Story saved successfully:", story.id);
    return { success: true, id: story.id };
  } catch (error) {
    console.error("Failed to save story:", error);
    return { success: false, error: error.message };
  }
}

export async function generateStory(formData) {
  try {
    const topic = formData.get("topic");
    const difficulty = formData.get("difficulty");
    const paragraphs = formData.get("paragraphs");
    const genre = formData.get("genre");
    const grammar = formData.get("grammar");
    const learningObjectives = formData.get("learningObjectives");

    // Validation
    if (
      !topic ||
      !difficulty ||
      !paragraphs ||
      !genre ||
      !grammar ||
      !learningObjectives
    ) {
      return { success: false, error: "Missing required fields" };
    }

    const prompt = `Generate a ${genre} story in French with exactly ${paragraphs} paragraphs for ${difficulty} level students about ${topic}. And create a title for it in French.

    Story Requirements:
    - Use primarily ${grammar} tense/mood throughout the story
    - Maintain the ${genre} genre conventions and style
    - Include natural examples of ${grammar} usage
    - Ensure the story is appropriate for ${difficulty} level students
    - Ensure ${learningObjectives} are appiled to story
    - Include 5-15 relevant vocabulary words, prioritizing words related to the ${topic} and ${genre}
    - Include 5-15 relevant grammar highlights, prioritizing words related to the ${topic} and ${genre}
    - Create a title for the story
    
    Respond with ONLY a JSON object in the following format, no additional text:
    {
      "title":"Your title here",
      "frenchText": "Your French story here",
      "englishText": "Your English translation here",
      "vocabulary": [
        {"french": "word1", "english": "translation1", "grammarType": "verb/noun/adjective"},
        {"french": "word2", "english": "translation2", "grammarType": "verb/noun/adjective"},
        {"french": "word3", "english": "translation3", "grammarType": "verb/noun/adjective"}
      ],
      "grammarHighlights": [
        {"expression": "French expression", "explanation": "How it demonstrates ${grammar}"},
        {"expression": "French expression", "explanation": "How it demonstrates ${grammar}"}
      ]
    }`;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const storyData = JSON.parse(response.content[0].text.trim());
    console.log(storyData);
    return { success: true, data: storyData };
  } catch (error) {
    console.error("Story generation error:", error);
    return { success: false, error: error.message };
  }
}

export async function getStoryById(id) {
  const story = await prisma.story.findUnique({
    where: { id },
    include: {
      StoryQuestions: true,
    },
  });

  if (!story) notFound();
  return story;
}

export async function getAllShortStories() {
  try {
    const stories = await prisma.story.findMany({
      include: {
        StoryQuestions: true,
      },
    });
    return stories;
  } catch (error) {
    console.error("Story generation error:", error);
    return null;
  }
}

export async function recordStoryQuestions(formData) {
  try {
    // Extract values from formData
    const name = formData.get("name");
    const userId = formData.get("userId");
    const storyId = formData.get("storyId");
    const englishText = formData.get("englishText");
    const phoneNumber = formData.get("phoneNumber");

    // Construct the data object
    const data = {
      name,
      userId,
      storyId,
      englishText,
      phoneNumber,
    };

    // Make the API request
    const response = await fetch(
      "https://spoon-academy.vercel.app/api/short-story-questions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    // Check for errors in the response
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    // Parse and return the response data
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to record story questions:", error.message);
    return null; // Return null on failure
  }
}

export async function createBookReport(formData) {
  try {
    const userId = formData.get("userId");
    const title = formData.get("title");
    const author = formData.get("author");
    const genre = formData.get("genre");
    const language = formData.get("language");
    const pages = parseInt(formData.get("pages"));
    const description = formData.get("description");
    const coverUrl = formData.get("coverUrl");

    const user = await prisma.user.findFirst({
      where: { userId: userId },
    });

    console.log("User Info:", user);

    if (!user) {
      throw new Error("User not found");
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        genre,
        language,
        pages,
        description,
        coverUrl,
        user: {
          connect: { id: user.id },
        },
      },
    });

    const bookReport = await prisma.bookReport.create({
      data: {
        user: {
          connect: { id: user.id },
        },
        book: {
          connect: { id: book.id },
        },
        status: "NOT_STARTED",
        progress: 0,
        startDate: new Date(),
      },
    });

    return { success: true, bookReport };
  } catch (error) {
    console.error("Error creating book report:", error.message);
    throw new Error("Failed to create book report");
  }
}

export async function addReadingLog(data) {
  try {
    console.log("readingLog data:", data);
    const bookId = data.bookId;
    const startPage = parseInt(data.startPage);
    const endPage = parseInt(data.endPage);
    const shortSummary = data.summary;

    // Validate input
    if (!bookId) throw new Error("Book ID is required");
    if (isNaN(startPage) || isNaN(endPage)) throw new Error("Invalid page numbers");
    if (startPage >= endPage) throw new Error("End page must be greater than start page");

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) throw new Error("Book not found");
    if (endPage > book.pages) throw new Error("End page cannot exceed total pages");

    // Create reading log
    const readingLog = await prisma.readingLog.create({
      data: {
        book: { connect: { id: bookId } },
        startPage,
        endPage,
        pagesRead: endPage - startPage,
        shortSummary,
      },
    });

    // Calculate reading progress percentage
    const readingProgress = Math.min(100, Math.floor((endPage / book.pages) * 100));

    // Update book
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: {
        isReading: readingProgress < 100, // true if book isn't finished
        currentPage: endPage,
        readingProgress,
      },
    });

    revalidatePath(`/books/${bookId}`);
    return { 
      success: true, 
      readingLog,
      book: updatedBook
    };
  } catch (error) {
    console.error("Error adding reading log:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function getBooksByUserId(userId) {
  try {
    const user = await prisma.user.findFirst({
      where: { userId: userId },
    });
    const books = await prisma.book.findMany({
      where: { user: { id: user.id } },
      include: {
        readingLogs: true,
      }
    });
    return books;
  } catch (error) {
    console.error("Error fetching books:", error.message);
    throw new Error("Failed to fetch books");
  }
}

export async function getBookReportById(bookReportId) {
  try {
    // console.log("Book Report ID:", bookReportId);
    const bookReport = await prisma.bookReport.findUnique({
      where: { id: bookReportId },
      include: {
        book: true,
        user: true,
        readingLogs: true,
      },
    });
    return bookReport;
  } catch (error) {
    console.error("Error fetching book report:", error.message);
    throw new Error("Failed to fetch book report");
  }
}

export async function getReadingLogsByBookReportId(bookReportId) {
  try {
    const readingLogs = await prisma.readingLog.findMany({
      where: { bookReport: { id: bookReportId } },
    });
    return readingLogs;
  } catch (error) {
    console.error("Error fetching reading logs:", error.message);
    throw new Error("Failed to fetch reading logs");
  }
}

export async function editReadingLog(formData) {
  let log = null;
  try {
    const shortSummary = formData.get("shortSummary");
    const readingLogId = formData.get("readingLogId");
    console.log("Form Data:", formData);
    console.log("Short Summary:", shortSummary);
    console.log("Reading Log ID:", readingLogId);

    if (!shortSummary || !readingLogId) {
      throw new Error("Invalid data");
    }

    log = await prisma.readingLog.update({
      where: { id: readingLogId },
      data: { shortSummary },
      select: { bookReportId: true },
    });
    return { success: true };
  } catch (error) {
    console.error("Error editing reading log:", error.message);
    throw new Error("Failed to edit reading log");
  } finally {
    if (log) {
      revalidatePath(`/books/${log.bookReportId}`);
    }
  }
}

export async function deleteReadingLog(readingLogId) {
  try {
    // First get the reading log with its book details before deleting
    const readingLog = await prisma.readingLog.findUnique({
      where: { id: readingLogId },
      include: {
        book: {  // Changed Book to book to match Prisma schema convention
          include: {
            readingLogs: true
          }
        }
      }
    });

    if (!readingLog) {
      throw new Error("Reading log not found");
    }

    // Store book reference before deleting the log
    const book = readingLog.book;

    // Delete the reading log
    await prisma.readingLog.delete({
      where: { id: readingLogId },
    });

    // Get remaining logs for this book
    const remainingLogs = book.readingLogs.filter(
      log => log.id !== readingLogId
    );

    // Find the last page read from remaining logs
    const lastPageRead = remainingLogs.length > 0
      ? Math.max(...remainingLogs.map(log => log.endPage))
      : 0;

    // Calculate new reading progress
    const newProgress = book.pages > 0 
      ? Math.min(100, Math.floor((lastPageRead / book.pages) * 100))
      : 0;

    // Update book progress
    await prisma.book.update({
      where: { id: book.id },
      data: {
        currentPage: lastPageRead,
        readingProgress: newProgress,
        isReading: newProgress < 100 && newProgress > 0
      }
    });

    revalidatePath(`/books/${book.id}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting reading log:", error);
    return {
      success: false,
      error: error.message || "Failed to delete reading log"
    };
  }
}

export async function saveConversationDialogue(data) {
  const languageEnumMap = {
    en: "ENGLISH",
    fr: "FRENCH",
    es: "SPANISH",
  };

  const levelEnumMap = {
    beginner: "BEGINNER",
    intermediate: "INTERMEDIATE",
    advanced: "ADVANCED",
  };

  try {
    console.log("Action.JS :", data);
    const {
      userId,
      introduction,
      vocabulary,
      characters,
      dialogue,
      title,
      imageUrl,
      metadata,
      aiAvatarUrl,
      maleAiAvatarUrl,
      femaleAiAvatarUrl,
      level,
    } = data;

    const user = await prisma.user.findFirst({
      where: { userId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Convert language codes (en, fr, es) to Prisma enum values (ENGLISH, FRENCH, SPANISH)
    const nativeLanguage = languageEnumMap[metadata.languages.native] || null;
    const tutorLanguage = languageEnumMap[metadata.languages.target] || null;
    const levelEnum = levelEnumMap[level] || null;

    const savedConversation = await prisma.conversation.create({
      data: {
        user: { connect: { id: user.id } },
        title,
        metadata,
        nativeLanguage,
        tutorLanguage,
        introduction,
        vocabulary,
        characters,
        dialogue,
        imageUrl,
        aiAvatarUrl,
        aiAvatarFemaleUrl: femaleAiAvatarUrl,
        aiAvatarMaleUrl: maleAiAvatarUrl,
        level: levelEnum,
      },
    });

    return { success: true, conversation: savedConversation };
  } catch (error) {
    console.error("Error saving conversation dialogue:", error);
    throw new Error("Failed to save conversation dialogue");
  } finally {
    revalidatePath("/conversations");
  }
}

export async function getAllConversations() {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        user: true,
      },
    });
    return conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error.message);
    throw new Error("Failed to fetch conversations");
  }
}

export async function getConversationById(conversationId) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user: true,
      },
    });
    return conversation;
  } catch (error) {
    console.error("Error fetching conversation:", error.message);
    throw new Error("Failed to fetch conversation");
  }
}

export async function getConversationAnalysisByUserId(userId) {
  try {
    const user = await prisma.user.findFirst({
      where: { userId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }
    const conversationRecords = await prisma.conversationRecord.findMany({
      where: { user: { id: user.id } },
    });
    return conversationRecords;
  } catch (error) {}
}

export async function updateAccountSettings(data) {
  try {
    console.log("data:", data);
    const {
      userId,
      language,
      avatarUrl,
      displayName,
      aiVoicePreference,
      billingPlan,
      dailyEmails,
      weeklyEmails,
      shareReadingLogs,
      shareConversationActivity,
      shareAchievements
    } = data;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }
    await prisma.accountSettings.update({
      where: { userId: user.id },
      data: {
        displayName,
        language,
        avatarUrl,
        aiVoicePreference,
        billingPlan,
        dailyEmails,
        weeklyEmails,
        shareReadingLogs,
        shareConversationActivity,
        shareAchievements
      },
    });
  } catch (error) {
    console.error("Error updating account settings:", error.message);
    throw new Error("Failed to update account settings");
  } finally {
    // Trigger revalidation after saving data
    revalidatePath(`/account`);
  }
}

export async function getAccountSettingsByUserId(userId) {
  try {
    const user = await prisma.user.findFirst({
      where: { userId: userId },
    });
    const accountSettings = await prisma.accountSettings.findUnique({
      where: { userId: user.id },
    });

    if (!accountSettings) {
      throw new Error("Account settings not found");
    }
    return accountSettings;
  } catch (error) {
    console.error("Error fetching account settings:", error.message);
    throw new Error("Failed to fetch account settings");
  }
}

export async function testApiRoute(formData) {
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const name = formData.get("name");
    console.log("name", name);

    const response = await fetch(`${protocol}://${host}/api/test-api-route`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Response data:", responseData);
    return { success: true, data: responseData };
  } catch (error) {
    console.error("Error in test API route:", error);
    return { success: false, error: error.message };
  }
}

export async function getSharedActivity() {
  try {
    // Get users who have enabled sharing
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
      },
    });

    // Separate user IDs based on what they're sharing
    const readingLogUserIds = sharedUsers
      .filter(user => user.shareReadingLogs)
      .map(user => user.userId);
    
    const conversationUserIds = sharedUsers
      .filter(user => user.shareConversationActivity)
      .map(user => user.userId);

    // Parallel fetch for better performance
    const [readingLogs, conversations] = await Promise.all([
      // Only fetch reading logs if there are users sharing them
      readingLogUserIds.length > 0
        ? prisma.readingLog.findMany({
            where: { 
              bookReport: { 
                userId: { in: readingLogUserIds } 
              } 
            },
            include: {
              bookReport: {
                select: { userId: true }
              }
            },
          })
        : [],

      // Only fetch conversations if there are users sharing them
      conversationUserIds.length > 0
        ? prisma.conversationRecord.findMany({
            where: { 
              userId: { in: conversationUserIds } 
            },
            include: {
              user: {
                select: {
                  displayName: true,
                  avatarUrl: true
                }
              }
            },
          })
        : [],
    ]);

    return {
      readingLogs,
      conversations,
    };

  } catch (error) {
    // Log the error for debugging
    console.error('Error fetching shared activity:', error);
    
    // Rethrow as a more specific error
    throw new Error('Failed to fetch shared activity data');
  }
}

export async function getAllAchievements() {
  try {
    const achievements = await prisma.achievement.findMany({
      include: {
        category: true,
        UserProgress: true,
      },
    });
    return achievements;
  } catch (error) {
    console.error("Error fetching achievements:", error.message);
    throw new Error("Failed to fetch achievements");
  }
}
export async function getAchievementsByUserId(userId) {
  try {
    const user = await prisma.user.findFirst({
      where: { userId: userId },
    })
    const userAchievements = await prisma.userProgress.findMany({
      where: { userId: user.id },
      include: {
        achievement: {
          include: {
            category: true,
          },
        },
      },
    });
    return userAchievements;
  } catch (error) {
    console.error("Error fetching achievements by user ID:", error.message);
    throw new Error("Failed to fetch achievements by user ID");
  }
}

export async function getUserDataByUserId(userId) {
  try {
    const user = await prisma.user.findFirst({
      where: { userId: userId },
    })

    const userData = await prisma.user.findFirst({
      where: { id: user.id },
      include: {
        Book: true,
        UserProgress: true,
      },
    });
    return userData;
  } catch (error) {
    console.error("Error fetching user data by user ID:", error.message);
    throw new Error("Failed to fetch user data by user ID");
  }
}

export async function getReadingLogsByBookId(bookId) {
  try {
    const book = await prisma.book.findFirst({
      where: { id: bookId },
      select: {
        title: true,
        author: true,
        pages: true,
        id: true,
        readingLogs: true, 
      },
    });

    if (!book) {
      throw new Error("Book not found");
    }

    return {
      readingLogs: book.readingLogs,
      totalPages: book.pages,
      title: book.title,
      author: book.author,
      id: book.id,
    };
  } catch (error) {
    console.error("Error fetching reading logs by book ID:", error.message);
    throw new Error("Failed to fetch reading logs by book ID");
  }
}

export async function updateAllBooksProgress() {
  try {
    // Fetch all books with their pages and last reading log
    const books = await prisma.book.findMany({
      select: {
        id: true,
        pages: true,
        readingLogs: {
          orderBy: { endPage: 'desc' },
          take: 1,
          select: { endPage: true }
        }
      }
    });

    const updates = books.map(async (book) => {
      if (book.pages === 0) return; // Avoid division by zero

      const lastEndPage = book.readingLogs[0]?.endPage || 0;
      const readingProgress = Math.round((lastEndPage / book.pages) * 100);

      return prisma.book.update({
        where: { id: book.id },
        data: {
          currentPage: lastEndPage,
          readingProgress
        }
      });
    });

    // Run all updates in parallel
    await Promise.all(updates);

    console.log("Updated reading progress for all books.");
  } catch (error) {
    console.error("Failed to update reading progress for all books:", error.message);
    throw new Error("Error updating reading progress");
  }
}