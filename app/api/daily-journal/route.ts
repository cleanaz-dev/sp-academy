import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await requireUser();
  const userId = user.id;

  try {
    const dailyJournals = await prisma.dailyJournal.findMany({
        where: {
            User: {
                id: userId
            }
        }
    })
    return NextResponse.json(dailyJournals)
  } catch (error) {
    console.error(error)
    return NextResponse.json({message: "Failed to fetch Daily Journals"})
  }
}
