import FreestyleWrapper from "@/components/freestyle/freestyle-wrapper";
import { currentUser } from "@clerk/nextjs/server";

export default async function FreestylePage() {
  const user = await currentUser();
  
  const defaultNative = "en-US";
  const defaultTarget = "fr-FR";

  return (

     
    // 'h-full flex-1' ensures it seamlessly docks into your existing layout's main area
    // without creating a double scrollbar.
    <div className="flex-1 w-full h-full animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%]  overflow-hidden flex flex-col">
      <FreestyleWrapper
        userId={user?.id}
        defaultNative={defaultNative}
        defaultTarget={defaultTarget}
      />
    </div>
  );
}