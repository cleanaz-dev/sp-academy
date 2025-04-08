//api/conversation/start/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { conversationId, userId } = await request.json();

    if (!conversationId || !userId) {
      throw new Error("Missing required parameters: conversationId and userId");
    }
    const user = await prisma.user.findFirst({
      where: { userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if a record already exists
    const existingRecord = await prisma.conversationRecord.findFirst({
      where: {
        conversationId,
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        {
          message: "Conversation record already exists.",
          conversationRecordId: existingRecord.id,
        },
        { status: 200 },
      );
    }

    // Create new record if none exist
    const newRecord = await prisma.conversationRecord.create({
      data: {
        conversationId,
        userId: user.id,
        messages: [],
      },
    });

    console.log("New conversation record created:", newRecord.id);

    return NextResponse.json(
      {
        conversationRecordId: newRecord.id,
        message: "Data processed successfully!",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error processing data:", error.message);
    return NextResponse.json(
      { error: "An error occurred while processing data." },
      { status: 500 },
    );
  }
}
