import NewVariationPage from "@/components/games/variations/new-variation-page";
import { getGameForVariations } from "@/lib/actions";

interface Params {
  params: Promise<{
    gameId: string;
  }>;
}

export default async function Page({ params }: Params) {
  const { gameId } = await params; 
  const game = await getGameForVariations(gameId); 

  if (!game) {
    return <div className="p-6">Error: Game not found.</div>;
  }

  
  return <NewVariationPage gameId={gameId} gameName={game.name} />;
}
