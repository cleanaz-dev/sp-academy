import { requireUser } from "@/lib/auth-guard";
import { getUserMatrix } from "./actions";
import MatrixClient from "./matrix-client";

export default async function MatrixPage() {
  const user = await requireUser();
  const userId = user.id;

  const matrix = await getUserMatrix(userId);

  console.log("Matrix:", matrix)

  return <MatrixClient matrix={matrix} />;
}
