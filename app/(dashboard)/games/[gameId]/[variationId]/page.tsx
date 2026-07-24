import { getGameVariation } from "@/lib/actions";
import { notFound } from "next/navigation";
import { GameRunner } from "@/components/games/game-runner";

interface Params {
  params: Promise<{
    gameId: string;
    variationId: string;
  }>;
}

export default async function GameVariationPage({ params }: Params) {
  const { gameId, variationId } = await params;

  // Make sure your getGameVariation server function includes the game model:
  // e.g. prisma.gameVariation.findUnique({ where: { id: variationId }, include: { game: true } })
  const gameVariation = await getGameVariation(gameId, variationId);

  if (!gameVariation || !gameVariation.game) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <GameRunner gameVariation={gameVariation} />
    </main>
  );
}