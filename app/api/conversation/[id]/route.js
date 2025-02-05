// api/conversation/[id]/route.js
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const conversationRecord = await prisma.conversationRecord.findUnique({
      where: { id: params.id },
    });

    if (!conversationRecord) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({
      messages: conversationRecord.messages || [],
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 });
  }
}