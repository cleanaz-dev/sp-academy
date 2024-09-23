import JournalHistoryPage from '@/components/JournalHistoryPage'
import React from 'react'
import { getJournalByUserId } from '@/lib/actions'
import { auth } from '@clerk/nextjs/server'

export default async function JournalHistory() {
  const {userId} = auth()
  const userData = await getJournalByUserId(userId)
  const journals = userData.Journal
  console.log(journals)
  
  
  return (
    <div>
      <JournalHistoryPage journals={journals}/>
    </div>
  )
}
