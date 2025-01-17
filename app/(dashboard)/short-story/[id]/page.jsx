import React from 'react'
import { getStoryById, getUserbyUserId } from '@/lib/actions';
import ShortStorySinglePage from '@/components/short-stories/ShortStorySinglePage';
import { auth } from '@clerk/nextjs/server';

export default async function StoryPage({ params }) {
  const story = await getStoryById(params.id)
  const { userId } = auth()
  const user = await getUserbyUserId(userId)
  const storyData = {...story, user}
  // console.log(storyData)
  return (
    <>
    <ShortStorySinglePage story={storyData}/>
    </>
  );
}