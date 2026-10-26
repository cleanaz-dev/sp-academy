// app/api/users/[userId]/sprite/report/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUser } from "@/lib/auth-guard";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({
  region: process.env.AWS_REGION || "us-east-1",
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const user = await isUser(userId);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const lockKey = `sprite-report:${userId}`;

    // 1. Create the SystemTask in Prisma
    const task = await prisma.systemTask.create({
      data: {
        type: "SPRITE_REPORT",
        status: "PENDING",
        lockKey,
        // Add userId / metadata if your SystemTask model has those columns:
        // userId,
        // metadata: body,
      },
    });

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/lambda`;

    // 2. Invoke `spoon-sprite-report` asynchronously (Event mode)
    const lambdaPayload = {
      systemTaskId: task.id,
      userId,
      dossier: body.dossier || {},
      webhookUrl,
      webhookSecret: process.env.LAMBDA_WEBHOOK_SECRET,
    };

    await lambda.send(
      new InvokeCommand({
        FunctionName: "spoon-sprite-report",
        InvocationType: "Event", // Async invocation so API returns immediately
        Payload: Buffer.from(JSON.stringify(lambdaPayload)),
      })
    );

    return NextResponse.json({
      systemTaskId: task.id,
      status: "PENDING",
    });
  } catch (error) {
    console.error("[SpriteReport] Failed to start task:", error);
    return NextResponse.json(
      { error: "Failed to initiate progress report" },
      { status: 500 }
    );
  }
}