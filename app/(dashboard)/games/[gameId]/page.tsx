
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, ArrowRight, Trophy } from "lucide-react";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{
    gameId: string;
  }>;
}

export default async function GameVariationsPage({ params }: Params) {
  const { gameId } = await params;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      variations: true,
    },
  });

  if (!game) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{game.title}</h1>
          <p className="text-slate-600">{game.description}</p>
        </div>

        {/* Variations List */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" /> Select Language & Level
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {game.variations.map((variation) => (
              <div
                key={variation.id}
                className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      {variation.targetLanguage}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      {variation.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 capitalize mb-1">
                    {variation.variation} Mode
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Target: {variation.targetLanguage} | Native: {variation.nativeLanguage}
                  </p>
                </div>

                <Link href={`/games/${game.id}/${variation.id}`}>
                  <Button className="w-full flex items-center justify-between bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
                    <span>Play This Variation</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}