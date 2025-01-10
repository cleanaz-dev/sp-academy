import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen } from 'lucide-react'

export default function BookReportCard({ title, author, summary }) {
  return (
    <Card className="w-full max-w-sm h-64 flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{author}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3">{summary}</p>
      </CardContent>
      <CardContent>
        <Button variant="outline" className="w-full">View</Button>
      </CardContent>
    </Card>
  )
}

