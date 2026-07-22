import { getGameById } from "@/lib/actions";

import GamePlayVisualGame from "@/components/games/components/GamePlayVisualGame";


export default async function page({ params }) {
  const gameId = params.gameId;
  const gameData = await getGameById(gameId);
  return (
    <div>
      <GamePlayVisualGame gameData={gameData} />
    </div>
  );
}
