import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import Link from "next/link"

export default function CreateBookReportCard() {
  return (
    <Card className="w-full max-w-sm h-64 flex flex-col justify-center items-center">
      <CardHeader>
        <CardTitle className="text-center">Create New Book Report</CardTitle>
      </CardHeader>
      <CardContent>
        <Link href="/book-reports/create">
          <Button variant="outline" size="lg" className="gap-2">
            <PlusCircle className="h-5 w-5" />
            Create Report
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

