import React from 'react'
import { getJournalByUserId } from '@/lib/actions'
import { auth } from '@clerk/nextjs/server'



export default function SingleJournalPage({params}) {
  const journalId = params.id
  return (
    <div>
      {journalId}
    </div>
  )
}
