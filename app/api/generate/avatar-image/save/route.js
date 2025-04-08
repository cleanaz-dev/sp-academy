//api/generate/avatar-image/save/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { uploadImage } from "@/lib/uploadImage";

export async function POST(request) {
  try {
    const { userId } = auth();

    // Destructure aiImageUrl from the request body
    const { aiImageUrl } = await request.json();
    console.log("Image URL:", aiImageUrl);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the user
    const user = await prisma.user.findFirst({ where: { userId: userId } });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Upload the image and get the response
    const imageResponse = await uploadImage(aiImageUrl);

    // Update the user's AccountSettings with the new avatarUrl
    await prisma.user.update({
      where: { id: user.id }, // Use `id` instead of `userId`
      data: {
        AccountSettings: {
          update: {
            avatarUrl: imageResponse, // Update the avatarUrl field
          },
        },
      },
    });

    // Return a JSON success response
    return NextResponse.json(
      { message: "Avatar saved successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
