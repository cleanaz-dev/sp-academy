import prisma from "@/lib/prisma";

export async function getDailyJournals(userId:string) {
    const dailyJournals = await prisma.dailyJournal.findMany({
        where: {
            userId
        }
    })
    return dailyJournals
}