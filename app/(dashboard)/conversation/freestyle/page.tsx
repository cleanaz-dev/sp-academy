import { getUserLanguage } from "@/app/actions/get-user-language";
import FreestyleWrapper from "@/components/freestyle/freestyle-wrapper";
import { requireUser } from "@/lib/auth-guard";

export default async function FreestylePage() {
  const user = await requireUser();
  const { lang } = await getUserLanguage(user.id);

  const defaultNative = lang.nativeLanguage;
  const defaultTarget = lang.targetLanguage ?? "fr-FR";

  return (
    <div className="flex-1 w-full h-full animate-gradient bg-linear-to-r from-sky-400 via-emerald-400 to-violet-400 bg-size-[300%_300%] overflow-hidden flex flex-col">
      <FreestyleWrapper
        userId={user.id}
        defaultNative={defaultNative}
        defaultTarget={defaultTarget}
      />
    </div>
  );
}