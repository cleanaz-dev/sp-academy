// app/api/achievements/route.js
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    console.log("body:", body);
    
    // Destructure with the correct structure
    const { 
      name, 
      description, 
      category, // This comes as an object from your form
      imageUrl, 
      criteria 
    } = body;

    if (!name || !category.id || !criteria) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const user = await prisma.user.findFirst({ where: { userId: userId } });

    // Create achievement with correct field names
    const achievement = await prisma.achievement.create({
      data: {
        name,
        description,
        imageUrl,
        criteria,
        categoryId: category.id, // Use categoryId as per your schema
      },
    });

    const users = await prisma.user.findMany({ select: { id: true } });

    const userProgressData = users.map((user) => ({
      userId: user.id,
      achievementId: achievement.id,
      progress: { current: 0, target: criteria.target },
      isUnlocked: false,
    }));

    // Create initial progress record
    await prisma.userProgress.createMany({ data: userProgressData });
    return NextResponse.json(achievement);
  } catch (error) {
    console.error("[ACHIEVEMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Optional: GET route to fetch categories
export async function GET(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}