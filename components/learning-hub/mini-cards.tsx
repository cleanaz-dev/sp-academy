import { Lock, MapPin, Sparkles, Volume2, ArrowRight } from "lucide-react";
import Image from "next/image";

// 1. Helper to resolve your S3 keys into actual URLs (Adjust to your CDN)
const getImageUrl = (s3Key?: string) => {
  if (!s3Key) return "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop"; // Fallback Paris image
  // Replace this with your actual CloudFront/S3 base URL
  return `https://your-cloudfront-domain.com/${s3Key}`; 
};

// 2. The upgraded Mini Cards Component
export function LearningPathMiniCards({ 
  lessons, 
  vocabDue, 
  nextLesson 
}: { 
  lessons: any[], // Replace 'any' with your extended Lesson type
  vocabDue?: any, 
  nextLesson?: any 
}) {
  if (lessons.length === 0) return null;

  const isVocabFocus = !!vocabDue;
  const focusLesson = vocabDue || nextLesson;
  
  const lockedLessonIndex = focusLesson ? lessons.findIndex(l => l.id === focusLesson.id) + (isVocabFocus ? 0 : 1) : -1;
  const lockedLesson = lockedLessonIndex >= 0 && lockedLessonIndex < lessons.length ? lessons[lockedLessonIndex] : null;

  // Extract rich data for the ACTIVE card based on your JSON payloads
  const activeImage = isVocabFocus 
    ? focusLesson?.bridge?.bridgeScene?.imageS3Key 
    : focusLesson?.visualContent?.imageS3Key;
    
  const activeTheme = isVocabFocus
    ? focusLesson?.bridge?.handoffFragment?.bridgeLexicon?.join(" • ") || "Vocabulary Review"
    : focusLesson?.lessonHandoff?.theme || focusLesson?.freestyle?.topic || "Foundation Lesson";

  const activeTarget = isVocabFocus
    ? `${focusLesson?.bridge?.vocabMoment?.length || 0} words to master`
    : focusLesson?.grammarContent?.targetSentence || "Core speaking drills";

  // Extract rich data for the LOCKED card
  const lockedIsVocab = lockedLesson && lockedLesson.completedAt && !lockedLesson.bridge?.passed;
  const lockedImage = lockedIsVocab
    ? lockedLesson?.bridge?.bridgeScene?.imageS3Key
    : lockedLesson?.visualContent?.imageS3Key;
    
  const lockedTheme = lockedIsVocab
    ? "Vocabulary Review"
    : lockedLesson?.lessonHandoff?.theme || lockedLesson?.freestyle?.topic || "Foundation Lesson";

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      
      {/* ==========================================
          LEFT CARD: CURRENT FOCUS (RICH & COLORFUL)
          ========================================== */}
      <div className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl shadow-lg ring-1 ring-indigo-500/20 transition-all hover:shadow-xl hover:ring-indigo-500/40">
        
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-slate-900">
          <Image 
            src={getImageUrl(activeImage)} 
            alt="Lesson Scene" 
            fill
            className="object-cover opacity-60 mix-blend-overlay transition-transform duration-700 group-hover:scale-105 group-hover:opacity-70"
          />
          {/* Gradients to ensure text is always readable over the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 to-transparent" />
        </div>

        {/* Content (Z-10 keeps it above the image) */}
        <div className="relative z-10 p-6 flex h-full flex-col justify-between">
          
          {/* Top Badge */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-extrabold text-blue-200 uppercase tracking-wide backdrop-blur-md border border-blue-400/30">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" /> 
              Current Focus
            </span>
          </div>

          {/* Bottom Text Area */}
          <div className="mt-4">
            <h4 className="text-sm font-bold text-blue-300 mb-1 drop-shadow-sm">
              {isVocabFocus ? `Vocab Bridge ${focusLesson?.orderIndex}` : `Spoon ${focusLesson?.orderIndex}`}
            </h4>
            <h3 className="text-xl font-black text-white leading-tight drop-shadow-md line-clamp-2">
              {activeTheme}
            </h3>
            
            {/* Sneak Peek Data */}
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-300">
              {isVocabFocus ? (
                <Sparkles className="h-4 w-4 text-amber-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              )}
              <span className="truncate">{activeTarget}</span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative z-10 h-1.5 w-full bg-slate-800/50 backdrop-blur-sm">
          <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-indigo-400" />
        </div>
      </div>


      {/* ==========================================
          RIGHT CARD: ON DECK (LOCKED & MUTED)
          ========================================== */}
      <div className="relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
        
        {/* Blurred Greyscale Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={getImageUrl(lockedImage)} 
            alt="Locked Lesson" 
            fill
            className="object-cover opacity-20 grayscale filter blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-white/80 to-white/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 flex h-full flex-col justify-between">
          
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-3 py-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide backdrop-blur-sm">
              <Lock className="h-3 w-3" /> Locked
            </span>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-400 mb-1">
              {lockedIsVocab ? `Vocab Bridge ${lockedLesson?.orderIndex ?? 'Next'}` : `Spoon ${lockedLesson?.orderIndex ?? 'Next'}`}
            </h4>
            <h3 className="text-xl font-black text-slate-700 leading-tight line-clamp-2">
              {lockedTheme}
            </h3>
            
            <p className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Complete current focus to unlock</span>
            </p>
          </div>
        </div>

        {/* Empty Progress Bar */}
        <div className="relative z-10 h-1.5 w-full bg-slate-200" />
      </div>

    </section>
  );
}