import prisma from "@/lib/prisma";
import { handleSpeechAnalysisTask } from "@/lib/system-tasks/handlers/handle-speech-analysis-task";
import { SystemTaskType } from "@prisma/client";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    systemTaskId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { systemTaskId } = await params;
    const apiKey = process.env.WEBHOOK_SECRET;

    // 1. Authenticate webhook secret
    const authHeader = req.headers.get("x-webhook-secret");
    if (!apiKey || apiKey !== authHeader) {
      return NextResponse.json({ message: "Access Denied" }, { status: 401 });
    }

    // 2. Lookup SystemTask
    const task = await prisma.systemTask.findUnique({
      where: {
        id: systemTaskId,
      },
    });

    if (!task) {
      return NextResponse.json({ message: "Task does not exist" }, { status: 404 });
    }

    // Parse webhook JSON body
    const body = await req.json();

    // 3. Dispatch Task Handler based on SystemTaskType enum
    switch (task.type) {
      case SystemTaskType.SPEECH_PRONUNCIATION_ANALYSIS: {
        return await handleSpeechAnalysisTask(task, body);
      }

      // Future task handlers can easily be plugged in here:
      // case SystemTaskType.OTHER_TASK:
      //   return await handleOtherTask(task, body);

      default:
        return NextResponse.json(
          { message: `Unhandled task type: ${task.type}` },
          { status: 400 }
        );
    }
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

