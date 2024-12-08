// app/practice-vocabulary/[id]/page.tsx

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs";

export default async function PracticePage({ params }) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const practiceSession = await prisma.practiceSession.findUnique({
    where: { id: params.id },
    include: {
      practiceWords: {
        include: {
          attempts: true,
        },
      },
      session: true, // Original pronunciation session
    },
  });

  if (!practiceSession || practiceSession.userId !== userId) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-6">

    </div>
  );
};
