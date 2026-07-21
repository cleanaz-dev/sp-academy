import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { userId } = await auth();

  try {
    const dailyJournals = await prisma.dailyJournal.findMany({
        where: {
            User: {
                userId
            }
        }
    })
    return NextResponse.json(dailyJournals)
  } catch (error) {
    console.error(error)
    return NextResponse.json({message: "Failed to fetch Daily Journals"})
  }
}
