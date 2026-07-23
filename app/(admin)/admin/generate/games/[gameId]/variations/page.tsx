//app/admin/generate/games/[gameId]/variations

interface Params {
  params: Promise<{
    gameId: string;
  }>;
}
export default async function Page({ params }: Params) {
  const { gameId } = await params;

  return <div>Game ID: {gameId}</div>;
}
