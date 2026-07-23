import NewVariationPage from "@/components/games/variations/new-variation-page";
import { getGameForVariations } from "@/lib/actions";

interface Params {
  params: Promise<{
    gameId: string;
  }>;
}

export async function Page({ params }: Params) {
  const { gameId } = await params; // ✅ Await the promise
  const game = await getGameForVariations(gameId); // ✅ Await the DB call

  if (!game) {
    return <div className="p-6">Error: Game not found.</div>;
  }

  // ✅ Pass data directly as props (no client-side fetching needed)
  return <NewVariationPage gameId={gameId} gameName={game.name} />;
}
