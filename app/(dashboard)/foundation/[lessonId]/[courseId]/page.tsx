import { FoundationWrapperProd } from "@/components/foundation/foundation-wrapper-prod";
import { requireUser } from "@/lib/auth-guard";
import { getUserFoundation } from "../../actions/get-foundation-user";

interface Params {
  params: Promise<{
    lessonId: string;
    courseId: string;
  }>;
}

export default async function Page({ params }: Params) {
  const { courseId, lessonId } = await params;

  // 1. Get the authenticated user
  const user = await requireUser();
  const userId = user.id;

  // 2. Pass userId, courseId, and lessonId to your query
  const foundation = await getUserFoundation({
    userId,
    courseId,
    lessonId,
  });

  return (
    <div className="min-h-screen animate-bg">
      <FoundationWrapperProd foundation={foundation} />
    </div>
  );
}