// practice-vocabulary/[id]/page.jsx
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PracticeSession from "@/components/short-stories/PracticeSession";
import { auth } from "@clerk/nextjs";

async function getPracticeSession(id) {
  const session = await prisma.practiceSession.findUnique({
    where: { id },
    include: {
      practiceWords: true,
      story: true,
    },
  });
  return session;
}

export default async function PracticeVocabularyPage({ params }) {
  const session = await getPracticeSession(params.id);
  if (!session) redirect("/dashboard");

  return (
    <div className="container mx-auto px-4 py-8">
      <PracticeSession
        sessionId={session.id}
        words={session.practiceWords}
        language={session.language}
        storyTitle={session.story.title}
      />
    </div>
  );
}
