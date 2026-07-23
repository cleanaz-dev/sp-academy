//app/admin/generate/games/[gameId]/variations

interface Params {
  params: Promise<{
    gameId: string;
  }>;
}
export async function Page({ params }: Params) {
  const { gameId } = await params;

  return <div>Game ID: {gameId}</div>;
}
