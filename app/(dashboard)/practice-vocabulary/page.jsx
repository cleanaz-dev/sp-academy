import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function PracticeVocabularyPage() {
  const { userId } = auth();

  const user = await prisma.user.findFirst({
    where: { userId }
  })


  // Fetch practice sessions grouped by story
  const practiceSessions = await prisma.practiceSession.findMany({
    where: { userId: user.id },
    include: {
      story: true,
      practiceWords: {
        select: {
          id: true,
          status: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Practice Vocabulary</h1>
      
      {practiceSessions.length === 0 ? (
        <div className="text-center text-gray-500">
          No practice sessions available
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceSessions.map(session => (
            <div 
              key={session.id} 
              className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{session.story.title}</h2>
                <span className="text-sm text-gray-500">
                  {session.language}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <span className="mr-2">Words to Practice:</span>
                  <span className="font-bold">
                    {session.practiceWords.filter(w => w.status === 'NEEDS_PRACTICE').length}
                  </span>
                </div>
              </div>
              
              <Link 
                href={`/practice-vocabulary/${session.id}`}
                className="w-full block text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Start Practice
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}