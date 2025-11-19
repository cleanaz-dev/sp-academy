import CoursePage from "@/components/courses/CoursesPage";
import { getCourseById, isEnrolled } from "@/prisma/queries/courses";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page({ params }) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const enrolled = await isEnrolled(id, userId);
  
  if (!enrolled) {
    return (
      <div className="mx-auto max-w-7xl py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Enrollment Required</h1>
        <p>You need to enroll in this course to access it.</p>
      </div>
    );
  }

  const course = await getCourseById(id);
  console.log("course:", course)

  if (!course) {
    return (
      <div className="mx-auto max-w-7xl py-10 text-center">
        <p>Course not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <CoursePage course={course} userId={userId} courseId={id} />
    </div>
  );
}