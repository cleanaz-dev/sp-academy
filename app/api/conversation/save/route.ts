import { NextResponse } from "next/server";
import { saveConversationDialogue } from "@/lib/actions";
import { createCommand, lambda } from "@/lib/aws/lambda";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, characters } = data;

    // 1. Extract role from characters (fallback if not present)
    const role = characters?.[1]?.role || "partner";

    // 2. Save dialogue text to DB first (with null images for now)
    const savedConversation = await saveConversationDialogue({
      ...data,
      imageUrl: null,
      aiAvatarUrl: null,
      maleAiAvatarUrl: null,
      femaleAiAvatarUrl: null,
      status: "generating_images", // Optional status flag
    });

    const conversationId = savedConversation?.id || data.id;

    // 3. Prepare clean prompt dictionary for the Lambda
    const imagesToGenerate = {
      storyImage: {
        type: "story",
        aspectRatio: "9:16",
        prompt: `Realistic Animation Image representing: Title: ${title} with a 9:16 aspect ratio`,
      },
      aiAvatar: {
        type: "avatar_neutral",
        aspectRatio: "1:1",
        prompt: `AI avatar headshot, zoomed in with neutral expression, clean background with a dynamic ${title}, photorealistic style, dressed as a ${role}.`,
      },
      maleAiAvatar: {
        type: "avatar_male",
        aspectRatio: "1:1",
        prompt: `Male avatar headshot, zoomed in with neutral expression, clean background with a dynamic ${title}, photorealistic style, dressed as a ${role}.`,
      },
      femaleAiAvatar: {
        type: "avatar_female",
        aspectRatio: "1:1",
        prompt: `Female avatar headshot, zoomed in with neutral expression, clean background with a dynamic ${title}, photorealistic style, dressed as a ${role}.`,
      },
    };

    // 4. Build payload for your Python Lambda
    const payload = {
      conversationId,
      title,
      role,
      images: imagesToGenerate,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.vercel.app"}/api/webhooks/process-conversation-images`,
      secret: process.env.LAMBDA_WEBHOOK_SECRET, // Keep it secure
    };

    // 5. Fire-and-forget Lambda invocation ("Event" returns in ~50ms)
    const command = createCommand({
      functionName: "spoon-conversation-image-generator-prod",
      invocationType: "Event",
      payload: payload,
    });

    await lambda.send(command);

    // 6. Return immediate success back to client
    return NextResponse.json(
      {
        success: true,
        message: "Conversation saved! Images are processing in the background.",
        conversationId,
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