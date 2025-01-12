"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  dayjsLocalizer,
} from "react-big-calendar";
import dayjs from "dayjs";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addReadingLog } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ReadingLogs from "../ReadingLogs";
import { AddReadingLog } from "../../SubmitButton";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// const localizer = dayjsLocalizer(dayjs)

export default function SingleBookReportPage({ bookReport }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("calendar");
  const [calendarView, setCalendarView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { user } = useUser();
  const [lastPage, setLastPage] = useState(1);

  const bookReportLastPage = bookReport.readingLogs.at(-1);
  // Check if there's a last reading log and set `lastPage` accordingly
  useEffect(() => {
    if (bookReportLastPage) {
      setLastPage(bookReportLastPage.endPage + 1); // Start from the next page
    } else {
      setLastPage(1); // Default to page 1 if no logs exist
    }
  }, [bookReport.readingLogs]);
  // console.log("Book Report Data:", bookReport);

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  async function handleSubmit(formData) {
    setIsSubmitting(true);
    try {
      await addReadingLog(formData);
      router.refresh();
    } catch (error) {
      console.error("Failed to add daily log:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // const calendarEvents = mockLogs.map((log) => ({
  //   title: `📖😁`,
  //   start: log.date,
  //   end: log.date,
  //   allDay: true,
  //   resource: log,
  // }));

  const dayPropGetter = (date) => {
    if (
      mockLogs.some(
        (log) => format(log.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      )
    ) {
      return {
        className: "bg-gray-100 h-full w-full flex items-center justify-center",
      };
    }
    return {};
  };

  return (
    <div className="py-8 h-full">
      <Card className="max-w-4xl ">
        <CardHeader>
          <CardTitle>
            <span className="text-4xl">{bookReport.book.title}</span>
          </CardTitle>
          <CardDescription>by {bookReport.book.author}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="mb-4">
            <input type="hidden" name="bookId" value={bookReport.bookId} />
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="bookReportId" value={bookReport.id} />
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="startPage">Page Started</Label>
                  <Input
                    id="startPage"
                    name="startPage"
                    type="number"
                    min="1"
                    value={lastPage}
                    onChange={(e) => setLastPage(parseInt(e.target.value))}
                    max={bookReport.totalPages}
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="endPage">Page Finished</Label>
                  <Input
                    id="endPage"
                    name="endPage"
                    type="number"
                    min="1"
                    max={bookReport.totalPages}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Short Summary</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  rows={4}
                  placeholder="Write a brief summary of what you've read today..."
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <AddReadingLog />
            </div>
          </form>

          {/* <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
            <TabsContent value="calendar" className="h-[500px]">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                dayPropGetter={dayPropGetter}
                view={calendarView}
                onView={setCalendarView}
                date={currentDate}
                onNavigate={handleNavigate}
                views={["month", "week", "day"]}
                components={{
                  dateCellWrapper: (props) => (
                    <div className="relative h-full">
                      {props.children}
                      {mockLogs.some(
                        (log) =>
                          format(log.date, "yyyy-MM-dd") ===
                          format(props.value, "yyyy-MM-dd")
                      ) && (
                        <span
                          className="absolute bottom-1 right-1"
                          role="img"
                          aria-label="reading log"
                        >
                          😊
                        </span>
                      )}
                    </div>
                  ),
                }}
              />
            </TabsContent>
            <TabsContent value="list">
              <div className="space-y-4">
                {mockLogs.map((log) => (
                  <Card key={log.id}>
                    <CardHeader>
                      <CardTitle>
                        {format(log.date, "MMMM d, yyyy")} - Pages{" "}
                        {log.pagesStarted}-{log.pagesFinished}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{log.summary}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs> */}
          <ReadingLogs data={bookReport.readingLogs} />
        </CardContent>
      </Card>
    </div>
  );
}
