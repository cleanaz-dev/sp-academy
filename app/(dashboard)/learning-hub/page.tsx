import LearningHubPage from "@/components/learning-hub/LearningHubPage";
import { getAllUserReviews, type UserReviews } from "@/lib/actions";
import { getLearningPath } from "@/app/actions/get-learning-path";
import { requireUser } from "@/lib/auth-guard";

export default async function Page() {
  const user = await requireUser();

  const [reviews, path] = await Promise.all([
    getAllUserReviews(user.id) as Promise<UserReviews>,
    getLearningPath(user.id),
  ]);

  return <LearningHubPage reviews={reviews} path={path} userId={user.id} />;
}