import BookCard from "@/components/books/BookCard";
import BookReportCard from "@/components/books/BookReportCard"
import CreateBookReportCard from "@/components/books/CreateBookReportCard"
import { getBooksByUserId, getReadingLogsByBookReportId } from "@/lib/actions"
import { auth } from "@clerk/nextjs/server"

export default async function BookReportsPage() {
  const { userId } = auth();
  const books = await getBooksByUserId(userId);
  console.log("Books data:", books);


  // console.log("Books data:", books);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
    <h1 className="header-title">Books</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
      <CreateBookReportCard />
      {books.map((book) => (
        <BookCard key={book.id} book={book} bookReports={book.bookReports} />
      ))}
    </div>
  </div>
  
  );
}
