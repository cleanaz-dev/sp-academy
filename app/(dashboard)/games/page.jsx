import { Dice3 } from "lucide-react";
import GameCard from "@/components/games/GameCard";
import { getAllGames } from "@/lib/actions";

export default async function page() {
  const games = await getAllGames();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="mb-8 animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="mb-4 flex items-center gap-4 text-4xl font-bold">
            Games{" "}
            <Dice3
              strokeWidth={1.5}
              className="size-10 animate-spin drop-shadow-xl transition-all duration-1000 ease-in-out"
            />
          </h1>
          <p className="text-xl opacity-90">
            Play games with friends, challenge your friends, and learn new
            skills through our engaging and immersive games!
          </p>
        </div>
      </header>
      <div className="mt-6 grid grid-cols-1 gap-6 px-6 sm:grid-cols-2">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
