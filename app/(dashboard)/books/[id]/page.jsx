import React from 'react'
import { getReadingLogsByBookId } from '@/lib/actions'
import SingleBookReportPage from '@/components/books/SingleBookPage'

export default async function page({ params }) {
  const readingLogs = await getReadingLogsByBookId(params.id)
  return (
    <div>
      <h1 className='header-title'>Daily Reading Log</h1>
    <SingleBookReportPage readingLogs={readingLogs} />
    </div>
  )
}
