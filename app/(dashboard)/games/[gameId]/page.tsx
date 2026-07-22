import { getGameById } from "@/lib/actions";
import GamePlayVisualGame from "@/components/games/components/GamePlayVisualGame";
import ImageDescribeGame from "@/components/games/types/image-describe-game";
import { notFound } from "next/navigation";
interface Params {
  params: Promise<{ gameId: string }>;
}

export default async function GamePage({ params }: Params) {
  const { gameId } = await params;
  const gameData = await getGameById(gameId);

  if (!gameData) notFound();

  // Dynamically render based on the game's type in DB!
  return (
    <div>
      {gameData.type === "Visual" && <GamePlayVisualGame gameData={gameData} />}
      {/* {gameData.type === "Speech_Describe" && <ImageDescribeGame gameData={gameData} />} */}
      {/* Add more types as you invent new games! */}
    </div>
  );
}