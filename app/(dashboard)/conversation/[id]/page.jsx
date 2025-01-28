//app/(dashboard)/conversation/[id]/route.js

import React from 'react'
import { getConversationById } from '@/lib/actions'
import SingleConversationPage from '@/components/conversation/SingleConversationPage'
import SingleConversationPageCopy from '@/components/conversation/SingleConversationPage-copy';

export default async function page({params}) {
  const conversation = await getConversationById(params.id)
  const id = await params.id; 
  
  return (
    <div>
      <SingleConversationPageCopy conversation={conversation} id={id} />
    </div>
  )
}
