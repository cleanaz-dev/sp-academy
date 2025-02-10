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
import AchievementCard from "@/components/home/AchievementCard";
import { getUserDataByUserId, updateAllBooksProgress } from "@/lib/actions";
import Image from "next/image";
import TestButton from "@/components/test/TestButton";
import WeeklySchedule from "@/components/home/WeeklySchedule";
import RecentLessons from "@/components/home/RecentLessons";

export default async function DashboardHome() {
  const user = await currentUser();
  const userData = await getUserDataByUserId(user.id);
  const books = userData.Book;
  const achievements = userData.UserProgress;
  const progress = userData.Progress
  // console.log("user data:", userData);
   
  // await updateAllBooksProgress();


  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <SpoonLogo />
        <header className="bg-white border-b p-6 mb-6">
          <div className="max-w-7xl mx-auto">
           
            <h1 className="mt-4 bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text text-4xl font-bold">
              Welcome back, {user?.firstName}! <TestButton />
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

            <Card className="hover:shadow-lg transition-shadow gdri">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Achievements</p>
                    <h3 className="text-2xl font-bold">{achievements.filter((a) => a.isUnlocked).length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
            {/* Recent Lessons */}
            <RecentLessons progress={progress} />        
            {/* Weekly Schedule */}
            <WeeklySchedule />

            <AchievementCard achievements={achievements} />

            {/* Current Reading */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-lg font-semibold">
                  Currently Reading
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {books.map((book, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg shadow-sm border"
                    >
                      <div className="flex items-center gap-4">
                        <Image
                          src={book.coverUrl || "/default-cover.png"}
                          alt={book.title || "Book cover"}
                          width="50"
                          height="50"
                          className="object-cover rounded-md"
                        />
                        <div className="flex w-full flex-col relative ">
                          {" "}
                          {/* Added relative positioning */}
                          <div>
                            <span className="font-medium leading-tight">
                              {book.title}
                            </span>
                            <span className="block text-muted-foreground text-sm leading-tight">
                              {book.author}
                            </span>
                            <span className="text-xs text-muted-foreground leading-tight">
                              Current Page: {book.currentPage}
                            </span>
                          </div>
                          <span className="absolute bottom-0 right-0 text-sm text-gray-500">
                            {/* Positioned absolutely */}
                            {book.readingProgress}%
                          </span>
                        </div>
                      </div>
                      <div
                        className="h-2 bg-gray-200 rounded-full mt-1"
                        aria-label={`Reading progress: ${book.readingProgress}%`}
                      >
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${book.readingProgress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed Section */}
          <div className="mt-6 pb-6">
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
