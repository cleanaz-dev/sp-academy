import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import axios from "axios"; // Ensure axios is imported

export async function POST(request) {
  try {
    // Parse the incoming request body
    const { title, level, subject, topic } = await request.json();

    const levelInt = parseInt(level, 10) || 0;

    // Send data to the webhook endpoint
    const webhookResponse = await axios.post(
      "https://hook.us1.make.com/g8vr0fxdc4tv88e2pwrahhl3trd6n6pz",
      {
        title,
        level: levelInt,
        subject,
        topic,
      },
    );

    // Handle the webhook response
    if (webhookResponse.status === 200) {
      const webhookData = webhookResponse.data; // Assuming webhook returns data for lesson creation
      console.log(webhookData);
      // Use the webhook response to create a lesson in Prisma
      const newLesson = await prisma.lesson.create({
        data: {
          title: webhookData.title || title, // Use the response data if available, fallback to original data
          subject: webhookData.subject || subject, // Example: Handle missing fields gracefully
          level: levelInt,
          content: webhookData, // Adjust based on your schema and data needs
        },
      });

      // Return the created lesson
      return NextResponse.json(newLesson);
    } else {
      // Handle unexpected webhook response status
      return NextResponse.json(
        { error: "Failed to get valid response from the webhook" },
        { status: 500 },
      );
    }
  } catch (error) {
    // Log and handle any errors
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the lesson" },
      { status: 500 },
    );
  }
}
