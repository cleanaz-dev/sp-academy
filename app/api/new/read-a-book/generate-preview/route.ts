import { NextResponse } from "next/server";
import { generateBookStory } from "@/lib/moonshot";

export async function POST(req: Request) {
  try {
    let formData = await req.json();

    // 🔥 FIX: ensure contentFocus is ALWAYS an array
    if (typeof formData.contentFocus === "string") {
      try {
        formData.contentFocus = JSON.parse(formData.contentFocus);
      } catch {
        formData.contentFocus = [];
      }
    }

    console.log("Data from book generator", formData);

    const result = await generateBookStory(formData);

    if (!result.success) {
      return NextResponse.json(
        { message: "Generation failed", error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Success",
        data: result.data,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in generate-preview:", error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}
