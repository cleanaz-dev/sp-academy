import BookReportCard from "@/components/book-report/BookReportCard"
import CreateBookReportCard from "@/components/book-report/CreateBookReportCard"


// This would typically come from a database or API
const bookReports = [
  { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee", summary: "A story of racial injustice and loss of innocence in the American South." },
  { id: 2, title: "1984", author: "George Orwell", summary: "A dystopian novel set in a totalitarian society, exploring themes of surveillance and control." },
  { id: 3, title: "Pride and Prejudice", author: "Jane Austen", summary: "A romantic novel focusing on the emotional development of Elizabeth Bennet." },
]

export default function BookReportsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Book Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CreateBookReportCard />
        {bookReports.map((report) => (
          <BookReportCard key={report.id} {...report} />
        ))}
      </div>
    </div>
  )
}

