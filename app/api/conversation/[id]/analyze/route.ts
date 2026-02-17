import { NextResponse } from "next/server";
import { analyzeConversation } from "@/lib/minimax/actions/analyze-conversation";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { conversationRecordId, userId } = await req.json();
    const analysis = await analyzeConversation(conversationRecordId, userId);
    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json({ error: "Failed to analyze conversation" }, { status: 500 });
  }
}