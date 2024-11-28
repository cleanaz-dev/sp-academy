import StoryGenerator from '@/components/story-generator'

import React from 'react'

export default function CreateStoryPage() {
  return (
    <div>
      <header className='p-4'>
        <h1 className='text-3xl font-bold text-center mb-4'>Create a French Story</h1>       
      </header>
      <StoryGenerator />
    </div>
  )
}
