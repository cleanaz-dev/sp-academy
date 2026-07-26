import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  BookOpen, 
  MessageCircle, 
  Headphones, 
  PenTool, 
  Swords, 
  GraduationCap 
} from "lucide-react";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{
    gameId: string;
  }>;
}

// 1. Language Meta
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

// 2. Difficulty Styles (Soft background, bold text, specific borders)
const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HARD: "bg-orange-50 text-orange-700 border-orange-200",
  INSANE: "bg-red-50 text-red-700 border-red-200",
};

// 3. Helper to generate descriptions and icons based on the variation type
function getVariationDetails(mode: string) {
  const normalizedMode = mode.toLowerCase();
  
  if (normalizedMode.includes("vocab")) {
    return {
      icon: <BookOpen className="w-5 h-5 text-blue-500" />,
      description: "Expand your word bank. Focus on high-frequency vocabulary and essential terms.",
    };
  }
  if (normalizedMode.includes("grammar")) {
    return {
      icon: <PenTool className="w-5 h-5 text-indigo-500" />,
      description: "Master sentence structure, conjugations, and the rules that tie the language together.",
    };
  }
  if (normalizedMode.includes("listen") || normalizedMode.includes("audio")) {
    return {
      icon: <Headphones className="w-5 h-5 text-purple-500" />,
      description: "Improve your ear. Train your comprehension with native-spoken audio challenges.",
    };
  }
  if (normalizedMode.includes("speak") || normalizedMode.includes("dialogue")) {
    return {
      icon: <MessageCircle className="w-5 h-5 text-pink-500" />,
      description: "Practice conversational flows and real-world interactions to speak with confidence.",
    };
  }
  if (normalizedMode.includes("challenge") || normalizedMode.includes("blitz")) {
    return {
      icon: <Swords className="w-5 h-5 text-rose-500" />,
      description: "A fast-paced test of your skills. Race against the clock and prove your fluency.",
    };
  }
  
  // Fallback for generic/unmatched modes
  return {
    icon: <GraduationCap className="w-5 h-5 text-slate-500" />,
    description: "Engage in this focused learning module to progressively improve your language skills.",
  };
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
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="relative w-full h-[35vh] bg-slate-900">
        {game.imageUrl ? (
          <Image
            src={game.imageUrl}
            alt={game.title}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
      </div>

      {/* Game Info */}
      <div className="max-w-3xl mx-auto px-6 -mt-16 relative z-10 text-center mb-12">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {game.title}
          </h1>
          {game.description && (
            <p className="text-slate-600 leading-relaxed text-lg">
              {game.description}
            </p>
          )}
        </div>
      </div>

      {/* Variations Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-800">
            Available Modules
          </h2>
          <span className="text-sm font-medium text-slate-500">
            {game.variations.length} {game.variations.length === 1 ? 'variation' : 'variations'} found
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {game.variations.map((variation) => {
            const target = langMeta(variation.targetLanguage);
            const native = langMeta(variation.nativeLanguage);
            const diffClass = DIFFICULTY_STYLES[variation.difficulty] ?? "bg-slate-100 text-slate-700 border-slate-200";
            const details = getVariationDetails(variation.variation);

            return (
              <Link
                key={variation.id}
                href={`/games/${game.id}/${variation.id}`}
                className="group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Background decorative blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-2xl group-hover:bg-blue-50 transition-colors" />

                <div className="relative z-10">
                  {/* Top Row: Language Direction & Difficulty */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      {/* Big Target Flag */}
                      <div className="text-5xl drop-shadow-sm transition-transform group-hover:scale-110">
                        {target.flag}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                          Learn
                        </span>
                        <span className="text-xl font-bold text-slate-900">
                          {target.label}
                        </span>
                      </div>
                    </div>
                    
                    {/* Difficulty Badge */}
                    <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full border ${diffClass}`}>
                      {variation.difficulty}
                    </span>
                  </div>

                  <hr className="border-slate-100 mb-5" />

                  {/* Middle Row: Variation Mode & Description */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      {details.icon}
                      <h3 className="text-lg font-bold text-slate-800 capitalize">
                        {variation.variation} Mode
                      </h3>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                      {details.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Native Lang & CTA */}
                <div className="relative z-10 flex items-center justify-between mt-auto pt-4">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">Native:</span>
                    <span className="text-sm">{native.flag}</span>
                    <span className="text-xs font-bold text-slate-700">{native.label}</span>
                  </div>

                  {/* Replaced <Button> with a styled div to prevent nested <a> and <button> HTML hydration errors */}
                  <div className="flex items-center justify-center gap-2 bg-slate-900 group-hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                    <span>Play</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}