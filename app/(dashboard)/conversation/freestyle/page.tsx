import FreestyleWrapper from "@/components/freestyle/freestyle-wrapper";
import { currentUser } from "@clerk/nextjs/server";

export default async function FreestylePage() {
  const user = await currentUser();
  
  const defaultNative = "en-US";
  const defaultTarget = "fr-FR";

  // const userReviews = getUserReview() need to add this here or somewhere else....

  return (
    // 1. Removed 'h-full'
    // 2. Added 'h-[calc(100dvh-72px)]' <-- Adjust 72px to the exact height of your top nav!
    <div className="flex-1 w-full h-[calc(100dvh-50px)] animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] overflow-hidden flex flex-col">
      <FreestyleWrapper
        userId={user?.id}
        defaultNative={defaultNative}
        defaultTarget={defaultTarget}
      />
    </div>
  );
}