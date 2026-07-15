
import SingleReportPage from "@/components/books/SingleBookPage";
import { getReadingLogsByBookId } from "@/lib/actions";


interface Params {
  params: Promise<{
    id: String;
  }>
}

export default async function page({ params }: Params) {
  const { id } = await params
  const readingLogs = await getReadingLogsByBookId(id);
  return (
    <div>
      <h1 className="header-title">Daily Reading Log</h1>
      <SingleReportPage readingLogs={readingLogs} />
    </div>
  );
}
