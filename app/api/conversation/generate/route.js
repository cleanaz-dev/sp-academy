//api/conversation/generate/route.js

import { NextResponse } from "next/server";
import { saveConversationDialogue } from "@/lib/actions";

export async function POST(request) {
  try {
    const data = await request.json();

    // Save data to your database or wherever you want to store it.
    // await saveConversationDialogue(data);

    return NextResponse.json(
      { message: "Data saved successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { error: "An error occurred while saving data." },
      { status: 500 },
    );
  }
}
