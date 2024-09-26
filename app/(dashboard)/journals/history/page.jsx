import JournalHistoryPage from '@/components/JournalHistoryPage'
import React from 'react'
import { getJournalByUserId } from '@/lib/actions'
import { auth } from '@clerk/nextjs/server'

export default async function JournalHistory() {
  const { userId } = auth();
  // console.log(userId)
  
  if (!userId) {
    console.error("User is not authenticated");
    return <div>Please log in to view your journals.</div>;
  }

  const userData = await getJournalByUserId(userId);
  const journals = userData?.Journal || []; // Fallback to empty array if undefinedclear

  return (
    <div>
      {journals.length > 0 ? (
        <JournalHistoryPage journals={journals} />
      ) : (
        <div>No journals available.</div>
      )}
    </div>
  );
}
