import { getGameVariation } from "@/lib/actions";
import { notFound } from "next/navigation";
import { GameRunner } from "@/components/games/game-runner";

interface Params {
  params: Promise<{
    gameId: string;
    variationId: string;
  }>;
}

export default async function Page({ params }: Params) {
  const { gameId, variationId } = await params;

  const gameVariation = await getGameVariation(gameId, variationId);

  if (!gameVariation || !gameVariation.game) {
    return notFound();
  }

  return (
    <main className="min-h-screen animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] p-4">
      <GameRunner gameVariation={gameVariation} />
    </main>
  );
}
