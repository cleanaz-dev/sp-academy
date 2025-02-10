//components/books/BooksCard

import {
  Card,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  BookOpenText,
  Languages,
  FileText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "../ui/progress";
import { formatDistanceToNow } from "date-fns";
import { Flame } from "lucide-react";

export default async function BookCard({ book }) {
  // Destructure book properties
  const {
    id,
    title,
    author,
    genre,
    language,
    pages,
    coverUrl,
    description,
    readingLogs,
  } = book;

  console.log("book ID:", id);

  // Compute reading progress
  const lastReadingLog = readingLogs[readingLogs.length - 1];
  const currentPage = lastReadingLog?.endPage || 0;
  const progress = pages > 0 ? Math.min((currentPage / pages) * 100, 100) : 0;

  // Compute last read information
  const lastRead = lastReadingLog?.createdAt
    ? `Last read ${formatDistanceToNow(lastReadingLog.createdAt, {
        addSuffix: true,
      })}`
    : "Not started yet";

    function calculateCurrentStreak(readingLogs) {
      if (!readingLogs || readingLogs.length === 0) return 0;
  
      // Get user's current time zone
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
      // Sort logs by date in descending order (most recent first)
      const sortedLogs = readingLogs.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  
      let currentStreak = 0;
  
      // Convert UTC date to user's local date
      function getLocalDateString(utcDate) {
          return new Date(utcDate).toLocaleDateString("en-US", {
              timeZone: userTimeZone,
          });
      }
  
      // Start from the most recent log and work backward
      for (let i = 0; i < sortedLogs.length - 1; i++) {
          const currentDate = getLocalDateString(sortedLogs[i].createdAt);
          const nextDate = getLocalDateString(sortedLogs[i + 1].createdAt);
  
          // Convert to Date objects for comparison
          const curr = new Date(currentDate);
          const next = new Date(nextDate);
          const daysDifference = (curr - next) / (1000 * 3600 * 24);
  
          if (daysDifference === 1) {
              currentStreak++;
          } else if (daysDifference > 1) {
              // If there's a gap, stop counting
              break;
          }
      }
  
      // Add 1 for the most recent log (since we started counting from the second log)
      return currentStreak + 1;
  }
  
    
  // Usage
  const streak = calculateCurrentStreak(readingLogs);

  return (
    <Card className="group relative w-full max-w-sm flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Header Section */}
      <div className="flex justify-between p-4 bg-gradient-to-br from-slate-100 via-blue-100 to-slate-200 h-36">
        <div className="mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          <p className="text-sm text-gray-600">{author}</p>
        </div>

        {/* Book Cover */}
        <div>
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={`${title} cover`}
              width={100}
              height={100}
              className="h-full object-cover transition-transform duration-300 group-hover:scale-105 w-auto"
              priority
            />
          ) : (
            <BookOpen className="h-16 w-16 text-gray-400" />
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-4 bg-white rounded-lg">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 border-none shadow-none">
            <BookOpenText size={14} />
            {genre}
          </Badge>
          <Badge className="flex items-center gap-1 text-xs bg-green-100 text-green-700 border-none shadow-none">
            <Languages size={14} />
            {language.toUpperCase()}
          </Badge>
          <Badge className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 border-none shadow-none">
            <FileText size={14} />
            {pages} pages
          </Badge>
        </div>

        {/* Reading Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
              <BookOpen className="h-4 w-4 text-blue-500" /> Reading Progress
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {progress === 100 && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {Math.round(progress)}% ({currentPage}/{pages})
            </div>
          </div>

          <Progress
            value={progress}
            className="transition-all h-2 bg-blue-200"
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
              <Calendar className="h-4 w-4 text-blue-500" /> {lastRead}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Flame
                className={`h-4 w-4 ${
                  streak === 0
                    ? "text-gray-300"
                    : streak > 3
                    ? "text-orange-500 fill-current"
                    : streak > 5
                    ? "text-red-500 fill-current"
                    : "text-amber-400 fill-current"
                }`}
              />
              <span className="text-xs text-gray-500">
                Streak: {streak} days
              </span>
              {streak > 7 && <Trophy className="h-4 w-4 text-yellow-500" />}
            </div>
          </div>
        </div>

        {/* Book Description */}
        <div className="flex-1 py-2 px-4 mb-4 border rounded-md shadow-inner bg-gray-50">
          <p className="text-xs text-gray-600 line-clamp-6">
            {description || "No quick insight available."}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <Link href={`/books/${id}`} className="w-full">
            <Button
              variant="default"
              className="w-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white transition-all duration-300 shadow-md"
            >
              View Reading Logs
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
