"use server";

import { redirect } from "next/navigation";
import prisma from "./prisma";
import axios from "axios";

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