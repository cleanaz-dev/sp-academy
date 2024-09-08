import React from 'react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Star } from "lucide-react"
import Link from "next/link"
import { getAllLessons } from '@/lib/actions'




export default async function DashboardLessonsPage() {
  const lessons = await getAllLessons()
  console.log(lessons)
  // const lessons = [
  //   { id: 1, title: "Introduction to Algebra", subject: "Math", duration: "45 min", level: "Beginner", rating: 4.5 },
  //   { id: 2, title: "Ancient Egyptian Civilization", subject: "History", duration: "60 min", level: "Intermediate", rating: 4.8 },
  //   { id: 3, title: "The Water Cycle", subject: "Science", duration: "30 min", level: "Beginner", rating: 4.2 },
  //   { id: 4, title: "Introduction to Poetry", subject: "English", duration: "40 min", level: "Beginner", rating: 4.6 },
  //   { id: 5, title: "Photosynthesis Explained", subject: "Biology", duration: "50 min", level: "Intermediate", rating: 4.7 },
  //   { id: 6, title: "World War II Overview", subject: "History", duration: "70 min", level: "Advanced", rating: 4.9 },
  // ]
  return (
    <div className="h-screen bg-zinc-100">
  <main className="px-4 py-8 max-w-7xl"> {/* Added max-width for main content */}
    <h1 className="text-3xl font-bold text-blue-500 mb-6">Available Lessons</h1>

    {/* Grid container with improved column spacing */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson) => (
        <Card key={lesson.id}>
          <CardHeader>
            <CardTitle>{lesson.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-2">{lesson.subject}</p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{lesson.duration}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <Star className="h-4 w-4 text-yellow-400" />
              <Star className="h-4 w-4 text-yellow-400" />
              <Star className="h-4 w-4 text-yellow-400" />
              <Star className="h-4 w-4 text-yellow-400" />
              <span>{lesson.rating}</span>
            </div>
            <div className="mt-2">
              <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                Grade {lesson.level}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-gradient-to-br from-blue-600 to-violet-600">
              <Link href={`/lessons/${lesson.id}`}>Start Lesson</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  </main>
</div>

  )
}
