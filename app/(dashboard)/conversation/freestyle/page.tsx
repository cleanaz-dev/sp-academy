import FreestyleWrapper from "@/components/freestyle/freestyle-wrapper";
import { currentUser } from "@clerk/nextjs/server"; // Or your auth provider

export default async function FreestylePage() {
  const user = await currentUser();
  
  // You can fetch user's saved preferences from your DB here
  const defaultNative = "en-US";
  const defaultTarget = "es-ES";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-8">
      <div className="container mx-auto w-full max-w-5xl px-4">
        <FreestyleWrapper
          userId={user?.id}
          defaultNative={defaultNative}
          defaultTarget={defaultTarget}
        />
      </div>
    </div>
  );
}