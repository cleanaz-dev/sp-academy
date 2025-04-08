import React from "react";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    const data = await request.json();

    const {
      call_id,
      to,
      from,
      corrected_duration,
      concatenated_transcript,
      completed,
      record,
      recording_url,
      summary,
      variables,
      metadata,
    } = data;

    const user = await prisma.user.findFirst({
      where: { userId: metadata.userId },
    });

    const newJournal = await prisma.journal.create({
      data: {
        userId: user.id,
        callId: call_id,
        length: corrected_duration,
        language: variables.language,
        to,
        from,
        completed,
        record,
        recordingUrl: recording_url,
        transcripts: concatenated_transcript,
        summary,
      },
    });
    console.log("New journal entry created:", newJournal);
    return new NextResponse("Journal entry created successfully", {
      status: 201,
    });
  } catch (error) {
    console.log(error);
    return new NextResponse("Error", { status: 500 });
  }
}
