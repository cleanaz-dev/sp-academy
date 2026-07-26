import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{
    gameId: string;
  }>;
}

// Map your Languages enum to flag emoji + label
const LANGUAGE_META: Record<string, { flag: string; label: string }> = {
  ENGLISH: { flag: "🇬🇧", label: "English" },
  FRENCH: { flag: "🇫🇷", label: "French" },
  SPANISH: { flag: "🇪🇸", label: "Spanish" },
  GERMAN: { flag: "🇩🇪", label: "German" },
  ITALIAN: { flag: "🇮🇹", label: "Italian" },
  PORTUGUESE: { flag: "🇵🇹", label: "Portuguese" },
  JAPANESE: { flag: "🇯🇵", label: "Japanese" },
  CHINESE: { flag: "🇨🇳", label: "Chinese" },
};

function langMeta(lang: string) {
  return LANGUAGE_META[lang] ?? { flag: "🌐", label: lang };
}

const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HARD: "bg-orange-50 text-orange-700",
  INSANE: "bg-red-50 text-red-700",
};

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
    <div className="min-h-screen bg-slate-50">
      {/* Hero image, full width, ~30vh */}
      <div className="relative w-full h-[30vh] bg-slate-900">
        {game.imageUrl ? (
          <Image
            src={game.imageUrl}
            alt={game.title}
            fill
            priority
            className="object-contain"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      </div>

      {/* Title + description, centered */}
      <div className="max-w-2xl mx-auto px-6 pt-10 pb-12 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          {game.title}
        </h1>
        {game.description && (
          <p className="text-slate-600 leading-relaxed">
            {game.description}
          </p>
        )}
      </div>

      {/* Variations */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 text-center">
          Select language & level
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {game.variations.map((variation) => {
            const target = langMeta(variation.targetLanguage);
            const native = langMeta(variation.nativeLanguage);
            const diffClass =
              DIFFICULTY_STYLES[variation.difficulty] ??
              "bg-slate-100 text-slate-700";

            return (
              <Link
                key={variation.id}
                href={`/games/${game.id}/${variation.id}`}
                className="group bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                      <span className="text-sm">{target.flag}</span>
                      {target.label}
                    </span>
                    <span
                      className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full ${diffClass}`}
                    >
                      {variation.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 capitalize mb-1">
                    {variation.variation} Mode
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    {native.flag} Native: {native.label}
                  </p>
                </div>

                <Button className="w-full flex items-center justify-between bg-slate-900 group-hover:bg-slate-800 text-white rounded-xl pointer-events-none">
                  <span>Play this variation</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}