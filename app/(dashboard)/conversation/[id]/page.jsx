import React from 'react'
import { getConversationById } from '@/lib/actions'
import SingleConversationPage from '@/components/conversation/SingleConversationPage'

export default async function page({params}) {
  const conversation = await getConversationById(params.id)
  const id = await params.id; 
  return (
    <div>
      <SingleConversationPage conversation={conversation} id={id} />
    </div>
  )
}
