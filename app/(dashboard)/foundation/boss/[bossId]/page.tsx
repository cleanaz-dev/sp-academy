// app/(dashboard)/foundation/boss/[bossId]/page.tsx
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-guard";
import { getBossData } from "../../actions/get-boss-data";
import BossFoundationClient from "@/components/foundation/boss/boss-foundation-client";

interface Params {
  params: Promise<{ bossId: string }>;
}

export default async function BossIdPage({ params }: Params) {
  const { bossId } = await params;
  const user = await requireUser();

  const bossData = await getBossData(bossId, user.id);
  if (!bossData) notFound();

  return <BossFoundationClient session={bossData} />;
}