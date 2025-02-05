// api/conversation/update/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request) {
  try {
    const { conversationRecordId, messages } = await request.json();
    console.log("Updating conversation record:", conversationRecordId, "with messages:", messages);

    // Fetch existing record
    const existingRecord = await prisma.conversationRecord.findUnique({
      where: { id: conversationRecordId },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Conversation record not found" },
        { status: 404 }
      );
    }

    // Ensure messages is always an array
    const existingMessages = Array.isArray(existingRecord.messages) ? existingRecord.messages : [];
    const updatedMessages = [...existingMessages, ...messages];

    // Update the conversation record
    const updatedRecord = await prisma.conversationRecord.update({
      where: { id: conversationRecordId },
      data: {
        messages: updatedMessages,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        messages: updatedRecord.messages, // Return the updated messages
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating conversation record:", error);
    return NextResponse.json(
      { error: "Failed to update conversation record" },
      { status: 500 }
    );
  }
}
