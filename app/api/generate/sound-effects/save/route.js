//api/generate/sound-effects/save/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadAudioToS3Bucket } from "@/lib/uploadAudio";

export async function POST(request) {
  try {
    // Get FormData from request
    const formData = await request.formData();
    const file = formData.get("file"); // Correct way to extract file from FormData

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("Received file:", file.name, file.type, file.size);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer); // Convert to Buffer

    console.log("File converted to buffer:", buffer.byteLength, "bytes");

    // Upload file to S3
    const audioURL = await uploadAudioToS3Bucket(buffer, file.name, file.type);

    console.log("File uploaded to S3:", audioURL);

    // Save the audio record in the database
    const savedAudio = await prisma.gameSoundEffects.update({
      where: { id: "67b2acfab18d9d65312785b8" }, // This is the condition to find the record
      data: {
        gameStart: audioURL, // This is the field you want to update
      },
    });

    console.log("Database record saved:", savedAudio);

    return NextResponse.json(
      { message: "Audio uploaded successfully", audioURL, savedAudio },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error saving audio:", error);
    return NextResponse.json(
      { error: "Failed to save audio" },
      { status: 500 },
    );
  }
}
