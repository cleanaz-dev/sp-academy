import MainJournalPage from "@/components/daily-journal/main-journal-page";
import { requireUser } from "@/lib/auth-guard";

import { getDailyJournals } from "@/prisma/queries/daily-journals/get-daily-journals";

import { redirect } from "next/navigation";

export default async function Page() {
  const user = await requireUser();

  if(!user) return redirect('/sign-in')

  const dailyJournals = await getDailyJournals(user.id);

  return <MainJournalPage journals={dailyJournals} />;
}

