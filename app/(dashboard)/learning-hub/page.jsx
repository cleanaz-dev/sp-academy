import LearningHubPage from '@/components/learning-hub/LearningHubPage'
import React from 'react'
import { getAllCourses, getUserbyUserId } from '@/lib/actions'
import { auth } from '@clerk/nextjs/server'


export default async function page() {
  const { userId } = auth()
  const courses = await getAllCourses()
  const user = await getUserbyUserId(userId)

  return (
    <>
    <LearningHubPage courses={courses} userId={user.id}/>
    </>
  )
}
