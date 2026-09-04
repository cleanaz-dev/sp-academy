
import EduCenterPage from "@/components/edu-centre/edu-centre-page";
import { getAllCourses, getUserbyUserId } from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";

export default async function page() {
  const { userId } = await auth();
  const courses = await getAllCourses();
  const user = await getUserbyUserId(userId);

  return (
    <>
      <EduCenterPage courses={courses} userId={user.id} />
    </>
  );
}
