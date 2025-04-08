import BookCard from "@/components/books/BookCard";
import BookReportCard from "@/components/books/BookReportCard";
import CreateBookReportCard from "@/components/books/CreateBookReportCard";
import { getBooksByUserId, getReadingLogsByBookReportId } from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";
import { Book, LibraryBig } from "lucide-react";

export default async function BookReportsPage() {
  const { userId } = auth();
  const books = await getBooksByUserId(userId);

  // console.log("Books data:", books);

  return (
    <div className="overflow-hidden pb-10">
      <header className="mb-8 animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="mb-4 flex items-center gap-4 text-4xl font-bold">
            Books{" "}
            <LibraryBig strokeWidth={1.5} className="size-10 drop-shadow-xl" />
          </h1>
          <p className="text-xl opacity-90">
            Dive into a world of knowledge and let every page inspire your
            journey. Together, let's unlock new adventures and endless
            possibilities!
          </p>
        </div>
      </header>

      <div className="mt-6 grid max-w-7xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
        <CreateBookReportCard />
        {books.map((book) => (
          <BookCard key={book.id} book={book} bookReports={book.bookReports} />
        ))}
      </div>
    </div>
  );
}
