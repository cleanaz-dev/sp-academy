import FoundationHubPage from "@/components/learning-hub/foundation-hub-page";
import { getLearningPath } from "@/app/actions/get-learning-path";
import { getUserLanguage } from "@/app/actions/get-user-language";
import { requireUser } from "@/lib/auth-guard";

export default async function Page() {
  const user = await requireUser();

  const [path, userLang] = await Promise.all([
    getLearningPath(user.id),
    getUserLanguage(user.id),
  ]);

  console.log(`[learning-hub] path for ${user.id}:`, JSON.stringify(path, null, 2));

  // Access the inner `.lang` object and cast to any to bypass the Enum vs String type complaint
  return <FoundationHubPage path={path} lang={userLang?.lang as any} />;
}