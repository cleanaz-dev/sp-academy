// EnrollmentDialog.jsx
"use client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export function EnrollmentDialog({ course, isOpen, onClose }) {
  const { user } = useUser();
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    if (confirmText !== "ENROLL") return;

    setIsLoading(true);
    try {
      // API call to enroll user in course
      const response = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          courseId: course.id,
        }),
      })
      if (!response.ok) {
        throw new Error("Failed to enroll in course");
      }
     
      router.push(`/courses/${course.id}`);
    } catch (error) {
      console.error("Enrollment failed:", error);
      toast.error("Failed to enroll in course contact your instructor or administrator.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>Enroll in {course.title}</DialogTitle>
          <DialogDescription>
            You're about to begin your journey in {course.title}. This course
            requires approximately 8 hours per week.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Course Includes:</h4>
            <ul className="text-sm text-gray-500 space-y-1">
              <li> {course.lessons.length} Lessons</li>
              <li> Hands-on Exercises</li>
              <li> Certificate upon completion</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type 'ENROLL' to confirm your commitment
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ENROLL"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleEnroll}
            disabled={confirmText !== "ENROLL" || isLoading}
            className="bg-gradient-to-r from-blue-600 to-violet-600"
          >
            {isLoading ? "Enrolling..." : "Confirm Enrollment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modified course card with enrollment dialog
function CourseCard({ course }) {
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);

  return (
    <>
      {/* ... existing course card code ... */}
      <Button onClick={() => setShowEnrollDialog(true)}>
        Enroll in Course
      </Button>

      <EnrollmentDialog
        course={course}
        isOpen={showEnrollDialog}
        onClose={() => setShowEnrollDialog(false)}
      />
    </>
  );
}