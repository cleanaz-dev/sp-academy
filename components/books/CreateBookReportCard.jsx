//app/component/books/CreateBookReportCard.jsx
import { Card, CardHeader, CardContent } from "@/components/old-ui/card";
import { Button } from "@/components/old-ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function CreateBookReportCard() {
  return (
    <Card className="flex w-full max-w-sm flex-col items-center justify-center rounded-md bg-gray-50 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col items-center space-y-3 p-6">
        <Link
          href="/books/create"
          className="flex w-full max-w-sm flex-col items-center space-y-3 rounded-md bg-gray-50 p-6 text-center transition-shadow hover:shadow-md"
        >
          <PlusCircle className="h-8 w-8 text-gray-500" />
          <p className="text-sm text-gray-700">
            Start your reading journey by adding a new book.
          </p>
        </Link>
      </CardContent>
    </Card>
  );
}
