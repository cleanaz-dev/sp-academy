import React from 'react'
import { getStoryById } from '@/lib/actions';
import ShortStorySinglePage from '@/components/short-story-id-page';

export default async function StoryPage({ params }) {
  const story = await getStoryById(params.id)
  return (
    <>
    <ShortStorySinglePage story={story}/>
    </>
  );
}