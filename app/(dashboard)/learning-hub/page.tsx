import LearningHubPage from "@/components/learning-hub/LearningHubPage";
import {
  getAllUserReviews,
  getUserbyUserId,
  type UserReviews,
} from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId: clerkId } = await auth();
  const user = await getUserbyUserId(clerkId);

  if (!user) {
    redirect("/sign-in");
  }
  const reviews: UserReviews = await getAllUserReviews(user.id);

  console.log("reviews", reviews);

  return (
    <>
      <LearningHubPage reviews={reviews} userId={user.id} />
    </>
  );
}
