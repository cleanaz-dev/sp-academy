import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CheckCircle } from "lucide-react";
import { Circle } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

export function RecommendedDetailsDialog({ item, isOpen, onClose }) {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-auto bg-white">
        <ScrollArea className="max-h-[80vh] px-6">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{item.title}</span>
              <Badge variant="outline">{item.matchScore}</Badge>
            </DialogTitle>
            <DialogDescription className="text-base">
              {item.description}
            </DialogDescription>
          </DialogHeader>

          {/* Main Content */}
          <div className="space-y-6 py-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {item.stats.enrolledStudents}
                </div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {item.stats.averageRating}
                </div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {item.stats.completionRate}
                </div>
                <div className="text-sm text-gray-600">Completion</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {item.duration}
                </div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <h3 className="mb-2 text-lg font-semibold">About this Course</h3>
              <p className="text-gray-700">{item.detailedDescription}</p>
            </div>

            {/* Prerequisites */}
            <div>
              <h3 className="mb-2 text-lg font-semibold">Prerequisites</h3>
              <ul className="list-disc space-y-1 pl-5">
                {item.prerequisites.map((prereq, index) => (
                  <li key={index} className="text-gray-700">
                    {prereq}
                  </li>
                ))}
              </ul>
            </div>

            {/* Learning Outcomes */}
            <div>
              <h3 className="mb-2 text-lg font-semibold">What you'll learn</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {item.learningOutcomes.map((outcome, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-gray-700"
                  >
                    <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div>
              <h3 className="mb-2 text-lg font-semibold">Your Instructor</h3>
              <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-300">
                  {/* Add actual image handling */}
                  <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold">{item.instructor.name}</h4>
                  <p className="text-sm text-gray-600">
                    {item.instructor.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.instructor.credentials}
                  </p>
                </div>
              </div>
            </div>

            {/* Syllabus Preview */}
            <div>
              <h3 className="mb-2 text-lg font-semibold">Course Syllabus</h3>
              <div className="space-y-3">
                {item.syllabus.map((week) => (
                  <div
                    key={week.week}
                    className="space-y-2 rounded-lg bg-gray-50 p-4"
                  >
                    <h4 className="font-medium">
                      Week {week.week}: {week.title}
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {week.topics.map((topic, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Circle className="h-2 w-2 text-blue-500" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>Enroll Now</Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
