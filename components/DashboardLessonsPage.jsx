import React from "react";

import { Button } from "@/components/ui/button";
import {
 Card,
 CardContent,
 CardFooter,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Clock, Star } from "lucide-react";
import Link from "next/link";
import { getAllLessons } from "@/lib/actions";
import { Badge } from "./ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export default async function DashboardLessonsPage() {
 const lessons = await getAllLessons();

 // const lessons = [
 //   { id: 1, title: "Introduction to Algebra", subject: "Math", duration: "45 min", level: "Beginner", rating: 4.5 },
 //   { id: 2, title: "Ancient Egyptian Civilization", subject: "History", duration: "60 min", level: "Intermediate", rating: 4.8 },
 //   { id: 3, title: "The Water Cycle", subject: "Science", duration: "30 min", level: "Beginner", rating: 4.2 },
 //   { id: 4, title: "Introduction to Poetry", subject: "English", duration: "40 min", level: "Beginner", rating: 4.6 },
 //   { id: 5, title: "Photosynthesis Explained", subject: "Biology", duration: "50 min", level: "Intermediate", rating: 4.7 },
 //   { id: 6, title: "World War II Overview", subject: "History", duration: "70 min", level: "Advanced", rating: 4.9 },
 // ]
 return (
  <div className="">
   <main className="max-w-7xl">
    {" "}
    {/* Added max-width for main content */}
    <header className="bg-white p-4 flex justify-between items-center">
     <h1 className="text-3xl font-bold text-blue-500 ">Available Lessons</h1>
     {/* <div className="flex items-center space-x-4">
   
     </div> */}
    </header>
    {/* Grid container with improved column spacing */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
     {lessons.map((lesson) => (
      <Card
       key={lesson.id}
       className="bg-gradient-to-b from-indigo-200/25 to-yellow-100/25"
      >
       <CardHeader>
        <CardTitle className="min-h-10">{lesson.title}</CardTitle>
       </CardHeader>
       <CardContent>
        <div className="space-x-2">
         <Badge className="text-gray-500 text-sm px-2 py-1 bg-white hover:bg-transparent ">
          {lesson.subject}
         </Badge>
         <Badge className=" text-gray-500 text-sm px-2 py-1 bg-white hover:bg-transparent ">
          Grade {lesson.level}
         </Badge>
        </div>

        <div className="bg-white/50 border my-4 rounded-md h-40">
         <p className="text-sm  p-2  text-slate-500 ">
          {lesson.description}
         </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
         <Clock className="h-4 w-4" />
         <span>{lesson.duration}m</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 my21">
         <Star className="h-4 w-4 text-yellow-400" fill="gold" />
         <Star className="h-4 w-4 text-yellow-400" fill="gold"/>
         <Star className="h-4 w-4 text-yellow-400" fill="gold"/>
         <Star className="h-4 w-4 text-yellow-400" fill="gold"/>
         <Star className="h-4 w-4 text-yellow-400" fill="gold"/>
         <span>{lesson.rating}</span>
        </div>
       </CardContent>
       <CardFooter>
        <Link href={`/lessons/${lesson.id}`} className="block w-full">
         <Button className="w-full bg-gradient-to-br from-blue-600 to-violet-600 hover:animate-pulse">
          Start Lesson
         </Button>
        </Link>
       </CardFooter>
      </Card>
     ))}
    </div>
   </main>
  </div>
 );
}
