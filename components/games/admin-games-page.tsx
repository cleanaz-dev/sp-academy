import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Code2, Dice3 } from "lucide-react";
import GameCodeModal from "./game-code-modal"; // <-- Import the modal

interface Game {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  type: string;
  code?: string | null;
}

export default function AdminGamesPage({ games }: { games: Game[] }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header (Same as before) */}
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Dice3 className="h-8 w-8 text-blue-600" /> Admin Game Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create base game engines, paste component code, and generate AI variations.
            </p>
          </div>
          <Link href="/admin/generate/games/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              <Plus className="mr-2 h-4 w-4" /> Create Game
            </Button>
          </Link>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="rounded-xl border bg-white p-5 shadow-sm space-y-4 dark:bg-slate-900 flex flex-col justify-between">
              
              {/* Card Content (Same as before) */}
              <div>
                <div className="relative h-40 w-full overflow-hidden rounded-lg bg-slate-100 mb-4">
                  <img src={game.imageUrl || "/placeholder.png"} alt={game.title} className="h-full w-full object-cover" />
                  <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {game.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{game.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{game.description}</p>

                <div className="mt-3 flex items-center gap-2 text-xs">
                  <Code2 className="h-4 w-4 text-slate-400" />
                  <span className={game.code ? "text-emerald-600 font-medium" : "text-amber-600"}>
                    {game.code ? "TSX Code Loaded" : "No TSX Code Attached"}
                  </span>
                </div>
              </div>

              {/* Updated Actions Section */}
              <div className="pt-4 border-t flex flex-col gap-2">
                
                {/* 1. Add/Edit Code Modal Button */}
                <GameCodeModal 
                  gameId={game.id} 
                  gameTitle={game.title} 
                  currentCode={game.code} 
                />

                {/* 2. Generate Content Button */}
                <Link href={`/admin/generate/variation?gameId=${game.id}`} className={!game.code ? "pointer-events-none" : ""}>
                  <Button
                    disabled={!game.code}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs disabled:opacity-50"
                  >
                    <Sparkles className="mr-2 h-3.5 w-3.5" /> Generate AI Variation
                  </Button>
                </Link>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}