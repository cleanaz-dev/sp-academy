import BookReportCard from "@/components/book-report/BookReportCard"
import CreateBookReportCard from "@/components/book-report/CreateBookReportCard"
import { getBooksByUserId } from "@/lib/actions"
import { auth } from "@clerk/nextjs/server"

export default async function BookReportsPage() {
  const { userId } = auth();
  const books = await getBooksByUserId(userId);

  // console.log("Books data:", books);

  return (
    <div className="mx-auto">
      <h1 className="header-title">Book Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <CreateBookReportCard />
        {books.map((book) => (
          <BookReportCard key={book.id} book={book} bookReports={book.bookReports} />
        ))}
      </div>
    </div>
  );
}
