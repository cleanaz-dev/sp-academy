import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import GameVariationsPage from "@/components/games/variations/game-variation-page";



interface Params {
  params: Promise<{
    gameId: string;
  }>;
}

export default async function Page({ params }: Params) {
  const { gameId } = await params;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      variations: true,
    },
  });

  if (!game) return notFound();

  return <GameVariationsPage game={game}/>;
}