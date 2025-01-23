import React from 'react'
import { getBookReportById } from '@/lib/actions'
import SingleBookReportPage from '@/components/book-report/SingleBookReportPage'

export default async function page({ params }) {
  const bookReport = await getBookReportById(params.id)
  return (
    <div>
      <h1 className='header-title'>Daily Reading Log</h1>
    <SingleBookReportPage bookReport={bookReport} />
    </div>
  )
}
