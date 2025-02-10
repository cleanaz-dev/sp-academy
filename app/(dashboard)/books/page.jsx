import BookCard from "@/components/books/BookCard";
import BookReportCard from "@/components/books/BookReportCard";
import CreateBookReportCard from "@/components/books/CreateBookReportCard";
import { getBooksByUserId, getReadingLogsByBookReportId } from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";
import { Book, LibraryBig } from "lucide-react";

export default async function BookReportsPage() {
  const { userId } = auth();
  const books = await getBooksByUserId(userId);
  console.log("Books data:", books);

  // console.log("Books data:", books);

  return (
    <div className="max-w-7xl overflow-hidden pb-10">
      <header className="bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] animate-[gradient_6s_ease_infinite] text-white py-16 mb-8">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="flex items-center gap-4 text-4xl font-bold mb-4">
            Books <LibraryBig strokeWidth={1.5} className="size-10 drop-shadow-xl" />
          </h1>
          <p className="text-xl opacity-90">
            Dive into a world of knowledge and let every page inspire your
            journey. Together, let's unlock new adventures and endless
            possibilities!
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 px-6">
        <CreateBookReportCard />
        {books.map((book) => (
          <BookCard key={book.id} book={book} bookReports={book.bookReports} />
        ))}
      </div>
    </div>
  );
}
