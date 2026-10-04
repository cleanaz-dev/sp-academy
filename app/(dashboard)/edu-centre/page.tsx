import EduCenterPage from "@/components/edu-centre/edu-centre-page";
import { getAllCourses } from "@/lib/actions";
import { requireUser } from "@/lib/auth-guard";

export default async function Page() {
  const user = await requireUser();
  const courses = await getAllCourses();


  return <EduCenterPage courses={courses} userId={user.id} />;
}