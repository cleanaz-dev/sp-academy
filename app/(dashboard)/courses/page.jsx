import MainUserCoursePage from "@/components/new/courses/pages/main-user-course-page";
import { getAllCoursesByUserId } from "@/prisma/queries/courses";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth();
  const courses = await getAllCoursesByUserId(userId);
  console.log("courses", courses)

  return <MainUserCoursePage courses={courses} />;
}