//components/book-report/BookReportCard

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

export default function BookReportCard({ book, bookReports }) {
  const { title, author, genre, language, pages, coverUrl, description } = book;
  const { id } = bookReports.find((report) => report.bookId === book.id);

  return (
    <Card className="group relative w-full max-w-sm  flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Cover Image Container */}
      <div className="flex justify-between p-4 bg-slate-100">
        {/* Header */}
        <div className="mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          <p className="text-sm text-gray-600">{author}</p>
        </div>

        <div>
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={`${title} cover`}
              width={100}
              height={100}
              // fill // Using fill instead of width/height
              // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {genre}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {language}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {pages} pages
          </Badge>
        </div>

        {/* Description */}
        <div className="py-4">
          <p className="text-xs text-gray-600 flex-1 line-clamp-6">
            <ScrollArea className="h-24">
              {description || "No summary available."}
            </ScrollArea>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-2">
          <Link href={`/books/${id}`} className="w-full">
            <Button
              variant="default"
              className="w-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white transition-all duration-300"
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
