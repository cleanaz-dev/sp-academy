"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Edit } from "lucide-react"
import { Trash2 } from "lucide-react"
import EditReadingLog from "./EditReadingLog"
import DeleteReadingDialog from "./DeleteReadingLog"


export default function ReadingLogs({ data }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const logsPerPage = 5

  const filteredLogs = data.filter(log => 
    log.shortSummary?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const indexOfLastLog = currentPage * logsPerPage
  const indexOfFirstLog = indexOfLastLog - logsPerPage
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog)

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-4">Reading Logs</h1>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search summaries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Search className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date Read</TableHead>
            <TableHead className="w-24">Pages</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead className="flex justify-end">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{new Date(log.dateRead).toLocaleDateString()}</TableCell>
              <TableCell>{log.startPage} - {log.endPage}</TableCell>
              <TableCell>{log.shortSummary}</TableCell>
              <TableCell>
                <div className="flex gap-2 justify-end ">
                  <EditReadingLog log={log} />
                  <DeleteReadingDialog log={log} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

      <div className="flex items-center justify-between mt-4">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        <span>Page {currentPage} of {totalPages + 1}</span>
        <Button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

