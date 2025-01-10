"use client";

import { useState } from "react";
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
import { addDailyLog } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";

import "react-big-calendar/lib/css/react-big-calendar.css";

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

// Mock data - in a real app, this would come from your API or database
const mockBookReport = {
  id: "1",
  title: "To Kill a Mockingbird",
  author: "Harper Lee",
  totalPages: 281,
};

const mockLogs = [
  {
    id: 1,
    date: new Date(2025, 0, 1),
    pagesStarted: 1,
    pagesFinished: 20,
    summary: "Started the book. Interesting characters introduced.",
  },
  {
    id: 2,
    date: new Date(2025, 0, 2),
    pagesStarted: 21,
    pagesFinished: 45,
    summary: "The plot thickens. Atticus Finch is an intriguing character.",
  },
  {
    id: 3,
    date: new Date(2025, 0, 4),
    pagesStarted: 46,
    pagesFinished: 70,
    summary: "Scout's perspective on Maycomb is enlightening.",
  },
];

export default function BookReportPage({ params }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("calendar");
  const [calendarView, setCalendarView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { user } = useUser();

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  async function handleSubmit(formData) {
    setIsSubmitting(true);
    try {
      await addDailyLog(params.id, formData);
      router.refresh();
    } catch (error) {
      console.error("Failed to add daily log:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const calendarEvents = mockLogs.map((log) => ({
    title: `📖😁`,
    start: log.date,
    end: log.date,
    allDay: true,
    resource: log,
  }));

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
    <div className="container mx-auto py-8 h-full">
      <Card className="max-w-4xl mx-auto ">
        <CardHeader>
          <CardTitle>
            <span className="text-4xl">{mockBookReport.title}</span>
          </CardTitle>
          <CardDescription>by {mockBookReport.author}</CardDescription>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Daily Reading Log</h2>
          <form action={handleSubmit} className="mb-4">
            <input type="hidden" name="bookId" value={params.id} />
            <input type="hidden" name="userId" value={user.id} />
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="pagesStarted">Page Started</Label>
                  <Input
                    id="pagesStarted"
                    name="pagesStarted"
                    type="number"
                    min="1"
                    max={mockBookReport.totalPages}
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="pagesFinished">Page Finished</Label>
                  <Input
                    id="pagesFinished"
                    name="pagesFinished"
                    type="number"
                    min="1"
                    max={mockBookReport.totalPages}
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Add Daily Log"}
                </Button>
              </div>
          </form>
          <div className="mb-6">
                <Button variant="secondary">
                  Complete Book Report
                </Button>
          </div>

          <Tabs value={viewMode} onValueChange={setViewMode}>
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
