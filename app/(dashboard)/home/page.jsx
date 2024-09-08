import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Calendar, BookOpen, LogOut, Star, User } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'

import React from 'react'

export default async function DashboardHome() {
  const user = await currentUser()
  return (
    <div className='bg-white min-h-screen'>
     <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Welcome {user?.firstName}!</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Overall Completion</span>
                  <span className="font-bold">65%</span>
                </div>
                <Progress value={65} className="w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Lessons */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>Introduction to Algebra</span>
                  <Button variant="outline" size="sm">
                    Continue
                  </Button>
                </li>
                <li className="flex justify-between items-center">
                  <span>World History: Ancient Civilizations</span>
                  <Button variant="outline" size="sm">
                    Start
                  </Button>
                </li>
                <li className="flex justify-between items-center">
                  <span>Biology: Cellular Structure</span>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Weekly Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>This Week's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="text-center">
                    <div className="font-bold">{day}</div>
                    <div className="mt-2 h-20 bg-zinc-100 rounded-md flex items-center justify-center">
                      <span className="text-xs">2 lessons</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex flex-col items-center">
                  <Star className="h-8 w-8 text-yellow-400" />
                  <span className="text-sm mt-1">Math Whiz</span>
                </div>
                <div className="flex flex-col items-center">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <span className="text-sm mt-1">Bookworm</span>
                </div>
                <div className="flex flex-col items-center">
                  <Calendar className="h-8 w-8 text-green-500" />
                  <span className="text-sm mt-1">Consistent</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
