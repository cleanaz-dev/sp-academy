import { getGameById } from "@/lib/actions";
import React from "react";
import GamePlayVisualGame from "@/components/games/components/GamePlayVisualGame";
import Image from "next/image";

export default async function page({ params }) {
  const gameId = params.gameId;
  const gameData = await getGameById(gameId);
  return (
    <div>
      <GamePlayVisualGame gameData={gameData} />
    </div>
  );
}
