//app/component/book-report/CreateBookReportCard.jsx
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function CreateBookReportCard() {
  return (
    <Card className="w-full max-w-sm flex flex-col justify-center items-center bg-gray-50 shadow-sm hover:shadow-md transition-shadow rounded-md">
      <CardContent className="flex flex-col items-center space-y-3 p-6">
      <Link
      href="/books/create"
      className="w-full max-w-sm flex flex-col items-center bg-gray-50 hover:shadow-md transition-shadow rounded-md p-6 text-center space-y-3"
    >
      <PlusCircle className="h-8 w-8 text-gray-500" />
      <p className="text-sm text-gray-700">
        Start a new journey by creating a book report.
      </p>
    </Link>
      </CardContent>
    </Card>
  );
}
