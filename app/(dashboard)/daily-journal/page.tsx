import MainJournalPage from "@/components/daily-journal/main-journal-page";

import { getDailyJournals } from "@/prisma/queries/daily-journals/get-daily-journals";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();

//   if(!userId) return redirect('/sign-in')

  const dailyJournals = await getDailyJournals(userId);

  return <MainJournalPage journals={dailyJournals} />;
}

