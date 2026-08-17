import { NextResponse } from "next/server";
import { saveConversationDialogue } from "@/lib/actions";
import { createCommand, lambda } from "@/lib/aws/lambda";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, characters = [] } = data;

    // 1. Extract role from characters (fallback safely)
    const role = characters?.[1]?.role || characters?.[0]?.role || "partner";

    // 2. Save dialogue text to DB first
    const savedResult = await saveConversationDialogue({
      ...data,
      imageUrl: null,
      aiAvatarUrl: null,
      maleAiAvatarUrl: null,
      femaleAiAvatarUrl: null,
    });

    const conversationId =
      savedResult?.conversationId

    if (!conversationId) {
      throw new Error("Failed to retrieve conversation ID after saving.");
    }

    // 3. Create System Task in DB linked to this conversation
    const task = await prisma.systemTask.create({
      data: {
        type: "CONVERSATION_IMAGE_GENERATION",
        metadata: {
          conversationId,
          characters,
          title,
          role,
        },
      },
    });

    // 4. Clean prompts without aspect ratio clutter
    const imagesToGenerate = {
      storyImage: `Cinematic establishing shot of two friends happily meeting up on vacation, representing: "${title}", joyful smiles, authentic natural interaction, scenic travel holiday background, warm ambient sunlight, photorealistic storytelling photography, 8k resolution.`,
      aiAvatar: `Close-up headshot portrait of an approachable character working as a ${role}, neutral expression, clean background related to ${title}, soft natural lighting, photorealistic, 8k resolution.`,
      maleAiAvatar: `Close-up headshot portrait of an approachable young man working as a ${role}, friendly expression, clean background related to ${title}, soft studio portrait lighting, photorealistic, 8k resolution.`,
      femaleAiAvatar: `Close-up headshot portrait of an approachable young woman working as a ${role}, friendly expression, clean background related to ${title}, soft studio portrait lighting, photorealistic, 8k resolution.`,
    };

    // 5. Payload for Python Lambda
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "";
    const payload = {
      systemTaskId: task.id,
      conversationId,
      title,
      role,
      images: imagesToGenerate,
      webhookUrl: `${appUrl}/api/webhooks/system-tasks/${task.id}`,
      secret: process.env.LAMBDA_WEBHOOK_SECRET,
    };

    // 6. Asynchronous fire-and-forget invoke (~50ms)
    const command = createCommand({
      functionName: "spoon-conversation-image-generator-prod",
      invocationType: "Event",
      payload: payload,
    });

    await lambda.send(command);

    // 7. Instant response back to frontend
    return NextResponse.json(
      {
        success: true,
        message: "Conversation saved! Images are processing in the background.",
        conversationId,
        systemTaskId: task.id,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error saving conversation:", error);
    return NextResponse.json(
      { error: "An error occurred while saving: " + error.message },
      { status: 500 },
    );
  }
}