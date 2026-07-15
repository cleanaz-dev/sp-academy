
import SingleReportPage from "@/components/books/SingleBookPage";
import { getReadingLogsByBookId } from "@/lib/actions";

interface Params {
  params: Promise<{
    bookId: string;
  }>
}

export default async function page({ params }: Params) {
  const { bookId } = await params
  const readingLogs = await getReadingLogsByBookId(bookId);

  console.log("Reading Logs:", readingLogs.readingLogs)
  return (
    <div>
      <h1 className="header-title">Daily Reading Log</h1>
      <SingleReportPage readingLogs={readingLogs} />
    </div>
  );
}
