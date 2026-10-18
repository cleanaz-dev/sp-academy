// app/matrix/page.tsx
import { requireUser } from "@/lib/auth-guard";
import { getUserMatrix } from "./actions";
import MatrixClient from "./matrix-client";
import { PronunciationProvider } from "@/context/pronunciation-context"; // adjust path
import { MatrixProvider } from "@/context/matrix-context"; // adjust path

export default async function MatrixPage() {
  const user = await requireUser();
  const userId = user.id;

  const matrix = await getUserMatrix(userId);

  return (
    <MatrixProvider>
      <PronunciationProvider>
        <MatrixClient matrix={matrix} userId={userId} />
      </PronunciationProvider>
    </MatrixProvider>
  );
}