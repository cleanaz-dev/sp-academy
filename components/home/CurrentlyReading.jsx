//component/home/CurrentlyReading.jsx
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "../ui/badge";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { BookPlus } from "lucide-react";
export default function CurrentlyReading({ books }) {
  return (
<Card className="hover:shadow-lg shadow-inner transition-shadow bg-white/80 backdrop-blur-md border border-gray-200">

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
          className="bg-gray-50 p-4 rounded-lg shadow-sm border hover:bg-gray-100 transition-colors duration-300"
        >
          <div className="flex items-center gap-4">
            <Image
              src={book.coverUrl || "/default-cover.png"}
              alt={book.title || "Book cover"}
              width="50"
              height="50"
              className="object-cover rounded-md"
            />
            <div className="flex w-full flex-col relative">
              <div className="flex gap-2 justify-between">
                <span className="font-medium leading-tight text-sm md:text-base">
                  {book.title}
                </span>
                <div>
                <Button variant="outline" size="icon" className="hover:bg-blue-500 text-green-500 group">
                <Link href={`/books/${book.id}`}>
             
                    <BookPlus strokeWidth={1} className="text-gray-400 group-hover:text-white group-hover:scale-110 transition-all duration-500"/>
            
                </Link>
                </Button>
              </div>
              </div>
              
              <span className="block text-muted-foreground text-sm leading-tight">
                {book.author}
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                Current Page: {book.currentPage} / {book.pages}
              </span>
              <span className="absolute bottom-0 right-0 text-sm text-gray-500">
                {book.readingProgress}%
              </span>
            </div>
          </div>
          <div
            className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden" 
            aria-label={`Reading progress: ${book.readingProgress}%`}
          >
<div
  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-[600ms] ease-out"
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
