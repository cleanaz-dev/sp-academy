import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { createUserAvatar } from "@/lib/replicate";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { type, description, style } = await request.json();
    const data = { type, description, style };

    const imageUrl = await createUserAvatar(data);
    console.log("Generated Avatar URL:", imageUrl);

    if (!imageUrl) {
      return NextResponse.json(
        { message: "Error generating avatar" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Avatar generated successfully",
      imageUrl,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the request" },
      { status: 500 },
    );
  }
}
