import FoundationHubPage from "@/components/learning-hub/foundation-hub-page";
import { getLearningPath } from "@/app/actions/get-learning-path";
import { getUserLanguage } from "@/app/actions/get-user-language";
import { requireUser } from "@/lib/auth-guard";
import { getUserGeneration } from "@/lib/upstash";
import { PronunciationProvider } from "@/context/pronunciation-context";
import { MatrixProvider } from "@/context/matrix-context";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const setupToken =
    typeof params?.setup === "string" ? params.setup : undefined;

  const [path, userLang, generationData] = await Promise.all([
    getLearningPath(user.id),
    getUserLanguage(user.id),
    getUserGeneration(setupToken),
  ]);

  return (
  
      <PronunciationProvider>
        <MatrixProvider>
        <FoundationHubPage
          path={path}
          lang={userLang as any}
          generationData={generationData}
        />
        </MatrixProvider>
      </PronunciationProvider>
  );
}
