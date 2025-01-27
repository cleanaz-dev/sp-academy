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
      model: "claude-3-opus-20240229",
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
    console.log(data);
    const bookReportId = data.bookReportId;
    const startPage = parseInt(data.startPage);
    const endPage = parseInt(data.endPage);
    const shortSummary = data.summary;
    const userId = data.userId;
    const bookId = data.bookId;

    const readingLog = await prisma.readingLog.create({
      data: {
        bookReport: { connect: { id: bookReportId } },
        startPage, // Convert to number
        endPage, // Convert to number
        pagesRead: endPage - startPage,
        shortSummary,
      },
    });

    const bookReport = await prisma.bookReport.findUnique({
      where: { id: readingLog.bookReportId },
      include: {
        book: true,
        readingLogs: true,
      },
    });

    const totalPagesRead = bookReport?.readingLogs.reduce(
      (sum, log) => sum + log.pagesRead,
      0
    );

    const progress = totalPagesRead / bookReport?.book.pages;

    await prisma.bookReport.update({
      where: { id: bookReportId },
      data: {
        progress,
        status: progress === 1 ? "COMPLETED" : "IN_PROGRESS",
        ...(progress === 1 ? { endDate: new Date() } : {}),
      },
    });
    revalidatePath(`/books/${bookReportId}`);
    return { success: true, readingLog };
  } catch (error) {
    console.error("Error adding reading log:", error.message);
    throw new Error("Failed to add reading log");
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
        bookReports: true,
      },
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
  let log = null;
  try {
    log = await prisma.readingLog.delete({
      where: { id: readingLogId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting reading log:", error.message);
    throw new Error("Failed to delete reading log");
  } finally {
    if (log) {
      revalidatePath(`/books/${log.bookReportId}`);
    }
  }
}

export async function saveConversationDialogue(data) {
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
    } = data;

    const user = await prisma.user.findFirst({
      where: { userId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    await prisma.conversation.create({
      data: {
        user: { connect: { id: user.id } },
        introduction,
        vocabulary,
        characters,
        dialogue,
        title,
        imageUrl,
      },
    });
    // Trigger revalidation after saving data
    revalidatePath(`/conversation`);

    return { success: true };
  } catch (error) {
    console.error("Error saving conversation dialogue:", error.message);
    throw new Error("Failed to save conversation dialogue");
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
    const { userId, language, avatarUrl, displayName, aiVoicePreference, billingPlan } = data;
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
      },

    })
  } catch (error) {
    console.error("Error updating account settings:", error.message);
    throw new Error("Failed to update account settings");
  } finally {
    // Trigger revalidation after saving data
    revalidatePath(`/account-settings`);
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
  const headersList = headers()
  const host = headersList.get('host')
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'

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