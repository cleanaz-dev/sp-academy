import Link from "next/link";
import Image from "next/image";
import { Game, GameVariation } from "@prisma/client";
import { 
  ArrowRight, 
  BookOpen, 
  MessageCircle, 
  Headphones, 
  PenTool, 
  Swords, 
  GraduationCap 
} from "lucide-react";

interface GameVariationsPageProps {
  game: Game & {
    variations: GameVariation[];
  };
}

// Map languages to flags and readable labels
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

// Map difficulties to your GameDifficulty enum colors
const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HARD: "bg-orange-50 text-orange-700 border-orange-200",
  INSANE: "bg-red-50 text-red-700 border-red-200",
};

// Check the database string for keywords and assign icons/text
function getVariationDetails(mode: string) {
  const text = mode.toLowerCase();
  
  if (text.includes("vocab")) return { icon: <BookOpen className="w-5 h-5 text-blue-500" />, description: "Expand your vocabulary and essential terms." };
  if (text.includes("grammar")) return { icon: <PenTool className="w-5 h-5 text-indigo-500" />, description: "Master sentence structure and conjugations." };
  if (text.includes("listen") || text.includes("audio")) return { icon: <Headphones className="w-5 h-5 text-purple-500" />, description: "Train your comprehension with audio challenges." };
  if (text.includes("speak")) return { icon: <MessageCircle className="w-5 h-5 text-pink-500" />, description: "Practice conversational flows and interactions." };
  if (text.includes("challenge") || text.includes("blitz")) return { icon: <Swords className="w-5 h-5 text-rose-500" />, description: "Race against the clock and prove your fluency." };
  
  return { icon: <GraduationCap className="w-5 h-5 text-slate-500" />, description: "Progressively improve your language skills in this module." };
}

export default function GameVariationsPage({ game }: GameVariationsPageProps) {
  // Group variations by the Native Language
  const groupedVariations = game.variations.reduce((acc, variation) => {
    const nativeLang = variation.nativeLanguage;
    if (!acc[nativeLang]) {
      acc[nativeLang] = [];
    }
    acc[nativeLang].push(variation);
    return acc;
  }, {} as Record<string, GameVariation[]>);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <div className="relative w-full h-[30vh] bg-slate-900 border-b border-slate-200">
        {game.imageUrl ? (
          <Image
            src={game.imageUrl}
            alt={game.title}
            fill
            priority
            className="object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
      </div>

      {/* Game Info Box */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10 text-center mb-16">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {game.title}
          </h1>
          {game.description && (
            <p className="text-slate-600 leading-relaxed text-lg max-w-2xl mx-auto">
              {game.description}
            </p>
          )}
        </div>
      </div>

      {/* Grouped Variations Wrapper */}
      <div className="max-w-5xl mx-auto px-6 space-y-16">
        {Object.entries(groupedVariations).map(([nativeKey, variations]) => {
          const native = langMeta(nativeKey);

          return (
            <div key={nativeKey} className="scroll-mt-6">
              
              {/* Group Header: "If you speak [Native Language]" */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200">
                <span className="text-4xl">{native.flag}</span>
                <div>
                  <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase">
                    If you speak
                  </h2>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {native.label}
                  </h3>
                </div>
              </div>

              {/* Cards Grid for the Target Languages */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {variations.map((variation) => {
                  const target = langMeta(variation.targetLanguage);
                  const diffClass = DIFFICULTY_STYLES[variation.difficulty] ?? "bg-slate-100 text-slate-700 border-slate-200";
                  const details = getVariationDetails(variation.variation);

                  return (
                    <Link
                      key={variation.id}
                      href={`/games/${game.id}/${variation.id}`}
                      className="group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                    >
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-2xl group-hover:bg-blue-50 transition-colors" />

                      <div className="relative z-10 flex-grow">
                        <div className="flex justify-between items-start mb-5">
                          <div className="flex items-center gap-3">
                            <div className="text-4xl drop-shadow-sm transition-transform group-hover:scale-110">
                              {target.flag}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                                Learn
                              </span>
                              <span className="text-lg font-bold text-slate-900 leading-tight">
                                {target.label}
                              </span>
                            </div>
                          </div>
                          
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${diffClass}`}>
                            {variation.difficulty}
                          </span>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 h-full">
                          <div className="flex items-center gap-2 mb-2">
                            {details.icon}
                            <h4 className="text-sm font-bold text-slate-800 capitalize">
                              {variation.variation === "default" ? "Standard" : variation.variation} Mode
                            </h4>
                          </div>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            {details.description}
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10 w-full mt-5 bg-slate-900 group-hover:bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                        Start Playing
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}