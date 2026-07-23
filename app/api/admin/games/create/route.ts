import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { uploadImage } from "@/lib/aws/services/s3-upload-image";

const createGameSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  rules: z.string().min(5, "Rules are required"),
  imageUrl: z.string().optional(), 
  difficulty: z.coerce.number().min(1).max(10),
  type: z.enum(["Verbal", "Visual", "Acoustic", "Speech_Describe"]),
  code: z.string().optional(),
  theme: z.string().optional(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isUserAdmin = await prisma.user.findUnique({
    where: { userId },
    select: { id: true, role: true },
  });

  if (!isUserAdmin || isUserAdmin.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden Request" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validation = createGameSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, rules, imageUrl, difficulty, type, code, theme } = validation.data;

    // Upload to S3 privately and get the Key
    let finalImageUrl: string | null = null;
    if (imageUrl) {
      try {
        finalImageUrl = await uploadImage(imageUrl);
      } catch (uploadError) {
        console.error("S3 Upload failed:", uploadError);
        return NextResponse.json({ message: "Failed to upload image to S3" }, { status: 500 });
      }
    }

    // Save to DB (Storing the S3 Key in the imageUrl field)
    const newGame = await prisma.game.create({
      data: {
        title,
        description,
        rules,
        imageUrl: finalImageUrl, // Now stores something like "lessons/uuid.png"
        type,
        code,
      },
    });

    return NextResponse.json(newGame, { status: 201 });

  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
