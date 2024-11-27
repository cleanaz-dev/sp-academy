"use server";

import { redirect } from "next/navigation";
import prisma from "./prisma";
import axios from "axios";
import { revalidatePath } from "next/cache";
import { Anthropic } from '@anthropic-ai/sdk';

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
  const user = await prisma.user.findUnique({
   where: { id: userId },
   include: { student },
  });
  return user;
 } catch (error) {
  console.error("Failed to fetch user:", error);
  return null;
 }
}

export const recordJournal = async (formData) => {
  try {
    const name = formData.get('name');
    const phoneNumber = formData.get('phoneNumber');
    const userId = formData.get('userId');
    const journalId = formData.get('journalId') || null;

    console.log(journalId);

    const data = {
      name,
      phoneNumber,
      userId,
      journalId
    };

    const response = await fetch("https://sp-academy.vercel.app/api/journal", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to record journal:", error);
  }
  
  redirect('/home');
};


export const getJournalByUserId = async (userId) => {
  try {
    
    const user = await prisma.user.findFirst({
      where: { userId: userId },
      include: { Journal: true },
    })
    
    if (!user) {
      console.error("User not found")
      return null
    }
    
    return user
  } catch (error) {
    console.error("Journals not found")
  }
}

export const deleteJournalById = async (id) => {
  try {
    await prisma.journal.delete({
      where: { id: id },
    })
  } catch (error) {
    console.error("Failed to delete journal:", error);
  }
  revalidatePath('/journals/history');
}

// lib/actions.js
export async function saveStory(formData) {
  try {
    console.log('Saving story with audio URL:', formData.audioUrl);
    
    const story = await prisma.story.create({
      data: {
        topic: formData.topic,
        difficulty: formData.difficulty,
        paragraphs: parseInt(formData.paragraphs),
        genre: formData.genre,
        grammar: formData.grammar,
        frenchText: formData.frenchText,
        englishText: formData.englishText,
        vocabulary: formData.vocabulary,
        grammarHighlights: formData.grammarHighlights,
        audioUrl: formData.audioUrl
      }
    });
    
    console.log('Story saved successfully:', story.id);
    return { success: true, id: story.id };
  } catch (error) {
    console.error('Failed to save story:', error);
    return { success: false, error: error.message };
  }
}

export async function generateStory(formData) {
  try {
    const topic = formData.get('topic')
    const difficulty = formData.get('difficulty')
    const paragraphs = formData.get('paragraphs')
    const genre = formData.get('genre')
    const grammar = formData.get('grammar')

    // Validation
    if (!topic || !difficulty || !paragraphs || !genre || !grammar) {
      return { success: false, error: 'Missing required fields' }
    }

    const prompt = `Generate a ${genre} story in French with exactly ${paragraphs} paragraphs for ${difficulty} level students about ${topic}. And create a title for it in French.

    Story Requirements:
    - Use primarily ${grammar} tense/mood throughout the story
    - Maintain the ${genre} genre conventions and style
    - Include natural examples of ${grammar} usage
    - Ensure the story is appropriate for ${difficulty} level students
    - Include 5-10 relevant vocabulary words, prioritizing words related to the ${topic} and ${genre}
    Include 5-10 relevant grammar highlights, prioritizing words related to the ${topic} and ${genre}
    
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
      model: 'claude-3-opus-20240229',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const storyData = JSON.parse(response.content[0].text.trim());
    console.log(storyData);
    return { success: true, data: storyData };

  } catch (error) {
    console.error('Story generation error:', error);
    return { success: false, error: error.message };
  }
}

export async function getStoryById(id) {

  const story = await prisma.story.findUnique({
    where: { id }
  });
  
  if (!story) notFound()
  return story
}

export async function getAllShortStories() {
  try {
    const stories = await prisma.story.findMany()
    return stories
  } catch (error) {
    console.error('Story generation error:', error);
    return null
  }
}

export async function recordStoryQuestions(formData) {
  try {
    // Extract values from formData
    const name = formData.get('name');
    const userId = formData.get('userId');
    const storyId = formData.get('storyId');
    const englishText = formData.get('englishText');
    const phoneNumber = formData.get('phoneNumber');

    // Construct the data object
    const data = {
      name,
      userId,
      storyId,
      englishText,
      phoneNumber,
    };

    // Make the API request
    const response = await fetch("http:localhost:3000/api/short-story-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

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
