import LearningHubPage from "@/components/learning-hub/LearningHubPage";
import { getAllUserReviews, type UserReviews } from "@/lib/actions";
import { requireUser } from "@/lib/auth-guard";

export default async function Page() {
  const user = await requireUser();
  const reviews: UserReviews = await getAllUserReviews(user.id);

  return <LearningHubPage reviews={reviews} userId={user.id} />;
}