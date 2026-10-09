import MainUserCoursePage from "@/components/new/courses/pages/main-user-course-page";
import { requireUser } from "@/lib/auth-guard";
import { getAllCoursesByUserId } from "@/prisma/queries/courses";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const user = await requireUser();
  const courses = await getAllCoursesByUserId(user.id);
  console.log("courses", courses)

  return <MainUserCoursePage courses={courses} />;
}