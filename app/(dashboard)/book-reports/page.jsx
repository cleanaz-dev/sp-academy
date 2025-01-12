import BookReportCard from "@/components/book-report/BookReportCard"
import CreateBookReportCard from "@/components/book-report/CreateBookReportCard"
import { getBooksByUserId } from "@/lib/actions"
import { auth } from "@clerk/nextjs/server"


// This would typically come from a database or API
const bookReports = [
  { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee", summary: "A story of racial injustice and loss of innocence in the American South." },
  { id: 2, title: "1984", author: "George Orwell", summary: "A dystopian novel set in a totalitarian society, exploring themes of surveillance and control." },
  { id: 3, title: "Pride and Prejudice", author: "Jane Austen", summary: "A romantic novel focusing on the emotional development of Elizabeth Bennet." },
]

export default async function BookReportsPage() {
  const { userId } = auth();
  const books = await getBooksByUserId(userId);

  console.log("Books data:", books);

  return (
    <div className="container mx-auto">
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
