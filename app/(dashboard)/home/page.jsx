import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  BookOpen,
  LogOut,
  Star,
  User,
  BookOpenCheck,
  Clock,
  Trophy,
} from "lucide-react";
import SpoonLogo from "@/components/SpoonLogo";
import { currentUser } from "@clerk/nextjs/server";
import ActivityFeed from "@/components/home/ActivityFeed";

export default async function DashboardHome() {
  const user = await currentUser();

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white border-b p-6 mb-6">
          <div className="max-w-7xl mx-auto">
            <SpoonLogo />
            <h1 className="mt-4 bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text text-4xl font-bold">
              Welcome back, {user?.firstName}!
            </h1>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BookOpenCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completed Lessons</p>
                    <h3 className="text-2xl font-bold">24</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Study Hours</p>
                    <h3 className="text-2xl font-bold">48.5</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Achievements</p>
                    <h3 className="text-2xl font-bold">12</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Lessons */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-lg font-semibold">
                  Recent Lessons
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {[
                    {
                      title: "Introduction to Algebra",
                      status: "Continue",
                      color: "blue",
                    },
                    {
                      title: "World History: Ancient Civilizations",
                      status: "Start",
                      color: "green",
                    },
                    {
                      title: "Biology: Cellular Structure",
                      status: "Review",
                      color: "purple",
                    },
                  ].map((lesson, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium">{lesson.title}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-${lesson.color}-600 border-${lesson.color}-600 hover:bg-${lesson.color}-50`}
                      >
                        {lesson.status}
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weekly Schedule */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-lg font-semibold">
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-7 gap-3">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day, index) => (
                      <div key={day} className="text-center">
                        <div className="text-sm font-medium text-gray-600">
                          {day}
                        </div>
                        <div
                          className={`mt-2 h-16 rounded-lg flex items-center justify-center ${
                            index === new Date().getDay() - 1
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-50"
                          }`}
                        >
                          <p className="text-xs font-medium">2</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-lg font-semibold">
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-around">
                  {[
                    {
                      icon: Star,
                      label: "Math Whiz",
                      color: "text-yellow-500",
                    },
                    {
                      icon: BookOpen,
                      label: "Bookworm",
                      color: "text-blue-500",
                    },
                    {
                      icon: Calendar,
                      label: "Consistent",
                      color: "text-green-500",
                    },
                  ].map(({ icon: Icon, label, color }, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="p-3 bg-gray-100 rounded-full mb-2">
                        <Icon className={`h-6 w-6 ${color}`} />
                      </div>
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Reading */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-lg font-semibold">
                  Current Reading
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { title: "The Great Gatsby", progress: 75 },
                    { title: "To Kill a Mockingbird", progress: 30 },
                  ].map((book, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{book.title}</span>
                        <span className="text-sm text-gray-500">
                          {book.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed Section */}
          <div className="mt-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-gray-50 flex flex-row justify-between items-center">
                <CardTitle className="text-lg font-semibold">
                  Recent Activity
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <ActivityFeed />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
