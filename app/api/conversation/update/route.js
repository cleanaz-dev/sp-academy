// api/conversation/update/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request) {
  try {
    const { conversationRecordId, messages, pronunciationScore } = await request.json();

    const existingRecord = await prisma.conversationRecord.findUnique({
      where: { id: conversationRecordId },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Add pronunciation score to user message
    const messagesWithScore = messages.map(msg => {
      if (msg.role === 'user' && pronunciationScore) {
        return { ...msg, pronunciationScore };
      }
      return msg;
    });

    const existingMessages = Array.isArray(existingRecord.messages) ? existingRecord.messages : [];
    const updatedMessages = [...existingMessages, ...messagesWithScore];

    const updatedRecord = await prisma.conversationRecord.update({
      where: { id: conversationRecordId },
      data: { messages: updatedMessages, updatedAt: new Date() },
    });
    // console.log("updatedRecord:", JSON.stringify(updatedRecord, null, 2));

    return NextResponse.json({ success: true, messages: updatedRecord.messages });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}