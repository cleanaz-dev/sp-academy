import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    console.log("form data:", formData);
    const audioFile = formData.get("user_audio_file");
    const text = formData.get("text");
    const dialect = formData.get("dialect") || "fr-FR";

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 },
      );
    }

    const apiFormData = new FormData();
    apiFormData.append("user_audio_file", audioFile);
    apiFormData.append("text", text || "");

    const apiKey = process.env.SPEECHACE_API_KEY;
    const apiUrl = `https://api.speechace.co/api/scoring/text/v9/json?key=${apiKey}&dialect=${dialect}&user_id=${userId}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: apiFormData,
    });

    console.log("Speechace Response Status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Speechace API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Speechace Result:", result);

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
