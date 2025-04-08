//components/books/BooksCard

import { Card } from "@/components/ui/card";
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
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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
    <Card className="group relative flex w-full max-w-sm flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Header Section */}
      <div className="flex h-36 justify-between bg-gradient-to-br from-slate-100 via-blue-100 to-slate-200 p-4">
        <div className="mb-2">
          <h3 className="line-clamp-1 text-lg font-semibold">{title}</h3>
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
              className="h-full w-auto object-cover transition-transform duration-300 group-hover:scale-105"
              priority
            />
          ) : (
            <BookOpen className="h-16 w-16 text-gray-400" />
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col rounded-lg bg-white p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge className="flex items-center gap-1 border-none bg-blue-100 text-xs text-blue-700 shadow-none hover:bg-blue-300 hover:text-white">
            <BookOpenText size={14} />
            {genre}
          </Badge>
          <Badge className="flex items-center gap-1 border-none bg-green-100 text-xs text-green-700 shadow-none hover:bg-green-300 hover:text-white">
            <Languages size={14} />
            {language.toUpperCase()}
          </Badge>
          <Badge className="flex items-center gap-1 border-none bg-yellow-100 text-xs text-yellow-700 shadow-none hover:bg-amber-300 hover:text-white">
            <FileText size={14} />
            {pages} pages
          </Badge>
        </div>

        {/* Reading Progress */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
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
            className="h-2 bg-blue-200 transition-all"
          />
          <div className="flex items-center justify-between">
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-4 w-4 text-blue-500" /> {lastRead}
            </div>
            <div className="mt-2 flex items-center gap-1">
              <Flame
                className={`h-4 w-4 ${
                  streak === 0
                    ? "text-gray-300"
                    : streak > 3
                      ? "fill-current text-orange-500"
                      : streak > 5
                        ? "fill-current text-red-500"
                        : "fill-current text-amber-400"
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
        <div className="mb-4 flex-1 rounded-md border bg-gray-50 px-4 py-2 shadow-inner">
          <p className="line-clamp-6 text-xs text-gray-600">
            {description || "No quick insight available."}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <Link href={`/books/${id}`} className="w-full">
            <Button
              variant="default"
              className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md transition-all duration-300 hover:from-sky-500 hover:to-blue-600"
            >
              View Reading Logs
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
