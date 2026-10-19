// app/(dashboard)/conversation/page.tsx
import { getUserLanguage } from "@/app/actions/get-user-language";
import FreestyleWrapper from "@/components/freestyle/freestyle-wrapper";
import { requireUser } from "@/lib/auth-guard";

export default async function ConversationPage() {
  const user = await requireUser();
  const { lang } = await getUserLanguage(user.id);

  const defaultNative = lang?.nativeLanguage ?? "ENGLISH";
  const defaultTarget = lang?.targetLanguage ?? "fr-FR";

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-100/80">
      <FreestyleWrapper
        userId={user.id}
        userName={user.firstName}
        defaultNative={defaultNative}
        defaultTarget={defaultTarget}
      />
    </div>
  );
}