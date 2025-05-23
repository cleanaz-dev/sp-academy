"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import EditReadingLog from "./EditReadingLog";
import DeleteReadingDialog from "./DeleteReadingLog";
import { CalendarDays } from "lucide-react";
import { BookOpenText } from "lucide-react";
import { Info } from "lucide-react";

export default function ReadingLogs({ data }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const logsPerPage = 5;

  const filteredLogs =
    data.readingLogs?.filter((log) =>
      log.shortSummary?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const sortedLogs = [...filteredLogs].sort(
    (a, b) => new Date(b.dateRead) - new Date(a.dateRead),
  );

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = sortedLogs.slice(indexOfFirstLog, indexOfLastLog);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-4">
        <h1 className="mb-4 text-2xl font-bold">Reading Logs</h1>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search summaries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Search className="h-4 w-4 text-gray-500" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4" />
                  Date
                </span>
              </TableHead>
              <TableHead className="w-24">
                <span className="flex items-center gap-2">
                  <BookOpenText className="size-4" />
                  Pages
                </span>
              </TableHead>
              <TableHead>
                <span className="flex items-center gap-2">
                  <Info className="size-4" />
                  Summary
                </span>
              </TableHead>
              <TableHead>
                <span className="flex items-center gap-2">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.dateRead).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {log.startPage} - {log.endPage}
                </TableCell>
                <TableCell>
                  <span className="line-clamp-3">{log.shortSummary}</span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <EditReadingLog log={log} />
                    <DeleteReadingDialog log={log} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
