import LearningHubPage from "@/components/learning-hub/LearningHubPage";
import { getAllUserReviews, getUserbyUserId, type UserReviews } from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId: clerkId } = await auth();
  const user = await getUserbyUserId(clerkId);
  const reviews: UserReviews = await getAllUserReviews(user.id);

  return (
    <>
      <LearningHubPage reviews={reviews} userId={user.id} />
    </>
  );
}