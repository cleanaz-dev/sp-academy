// app/api/achievements/generate-achievement-badge/route.js
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAchievementBadges } from "@/lib/replicate";

export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formData } = await request.json();

    const badgeData = {
      name: formData.name,
      description: formData.description,
      category: formData.category.name,
    };

    const achievementBadges = await createAchievementBadges(badgeData);

    console.log("Achievement badges created:", achievementBadges);

    return NextResponse.json(
      {
        message: "Achievement badge generated successfully",
        achievementBadges,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error generating achievement badge:", error.message);
    return NextResponse.json(
      { error: "An error occurred while generating achievement badge." },
      { status: 500 },
    );
  }
}
