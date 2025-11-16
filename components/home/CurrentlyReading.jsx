//component/home/CurrentlyReading.jsx
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/old-ui/card";
import { Badge } from "../old-ui/badge";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "../old-ui/button";
import { BookPlus } from "lucide-react";
export default function CurrentlyReading({ books }) {
  return (
    <Card className="border border-gray-200 bg-white/80 shadow-inner backdrop-blur-md transition-shadow hover:shadow-lg">
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
              className="rounded-lg border bg-gray-50 p-4 shadow-sm transition-colors duration-300 hover:bg-gray-100"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={book.coverUrl || "/default-cover.png"}
                  alt={book.title || "Book cover"}
                  width="50"
                  height="50"
                  className="rounded-md object-cover"
                />
                <div className="relative flex w-full flex-col">
                  <div className="flex justify-between gap-2">
                    <span className="text-sm font-medium leading-tight md:text-base">
                      {book.title}
                    </span>
                    <div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="group text-green-500 hover:bg-blue-500"
                      >
                        <Link href={`/books/${book.id}`}>
                          <BookPlus
                            strokeWidth={1}
                            className="text-gray-400 transition-all duration-500 group-hover:scale-110 group-hover:text-white"
                          />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <span className="block text-sm leading-tight text-muted-foreground">
                    {book.author}
                  </span>
                  <span className="text-xs leading-tight text-muted-foreground">
                    Current Page: {book.currentPage} / {book.pages}
                  </span>
                  <span className="absolute bottom-0 right-0 text-sm text-gray-500">
                    {book.readingProgress}%
                  </span>
                </div>
              </div>
              <div
                className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200"
                aria-label={`Reading progress: ${book.readingProgress}%`}
              >
                <div
                  className="duration-[600ms] h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all ease-out"
                  style={{ width: `${book.readingProgress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
