//app/(dashboard)/games/[gameId]/[variationId]/page.tsx

import { getGameVariation } from "@/lib/actions";
import { notFound } from "next/navigation";

interface Params {
  params: Promise<{
    gameId: string;
    variationId: string;
  }>;
}
export async function Page({ params }: Params) {
  const { gameId, variationId } = await params;

  const gameVariation = getGameVariation(gameId,variationId)

  if(!gameVariation) return notFound()

// some sort of game engine selector here or something

return 

}
