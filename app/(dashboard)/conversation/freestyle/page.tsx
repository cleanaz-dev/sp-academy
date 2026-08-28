import FreestyleWrapper from "@/components/freestyle/freestyle-wrapper";
import { currentUser } from "@clerk/nextjs/server";

export default async function FreestylePage() {
  const user = await currentUser();
  
  const defaultNative = "en-US";
  const defaultTarget = "fr-FR";

  return (
    // 'h-full flex-1' ensures it seamlessly docks into your existing layout's main area
    // without creating a double scrollbar.
    <div className="flex-1 w-full h-full bg-white overflow-hidden flex flex-col">
      <FreestyleWrapper
        userId={user?.id}
        defaultNative={defaultNative}
        defaultTarget={defaultTarget}
      />
    </div>
  );
}