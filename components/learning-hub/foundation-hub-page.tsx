"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flame,
  Globe2,
  Headphones,
  Loader2,
  Lock,
  MessageSquare,
  Sparkles,
  Trophy,
  Zap,
  Grid3X3,
  Volume2,
} from "lucide-react";
import type { LearningPath } from "@/app/actions/get-learning-path";
import { formatDate } from "./utils"; // Ensure you have this utility

type Lesson = LearningPath["lessons"][number];

type Props = {
  path: LearningPath | null;
  lang: { nativeLanguage: string; targetLanguage: string | null | any };
};

// --- HELPER FUNCTIONS ---
function vocabWordCount(vocabMoment: unknown): number {
  return Array.isArray(vocabMoment) ? vocabMoment.length : 0;
}

// ⚠️ CHANGE THIS TO YOUR ACTUAL S3 / CLOUDFRONT BASE URL ⚠️
const getImageUrl = (s3Key?: string) => {
  if (!s3Key) return "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop"; // Fallback image
  return `https://your-cloudfront-domain.com/${s3Key}`; 
};

// ============================================================================
// 1. MAIN PAGE COMPONENT
// ============================================================================
export default function FoundationHubPage({ path, lang }: Props) {
  const router = useRouter();
  const lessons = path?.lessons ?? [];
  const courseId = path?.courseId ?? (path as any)?.id ?? "default";

  const getLessonHref = (lessonId: string) => `/foundation/${lessonId}/${courseId}`;

  // State calculations
  const waitingOnVocab = lessons.some((l) => l.completedAt && !l.bridge);
  const vocabDue = lessons.find((l) => l.completedAt && l.bridge && !l.bridge.passed);
  const nextLesson = lessons.find((l) => !l.completedAt);
  const completedLessonsCount = lessons.filter((l) => !!l.completedAt).length;

  const totalWordsLearned = lessons.reduce((acc, l) => {
    return acc + (l.completedAt && l.bridge ? vocabWordCount(l.bridge.vocabMoment) : 0);
  }, 0);

  // Polling for vocab bridge generation
  useEffect(() => {
    if (!waitingOnVocab) return;
    const interval = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(interval);
  }, [waitingOnVocab, router]);

  return (
    <div className="min-h-screen bg-[#F4F6FC] font-sans text-slate-900 selection:bg-indigo-100">
      
      <DashboardHeader 
        lang={lang} 
        completedCount={completedLessonsCount} 
        streak={1} // Replace with actual streak prop when ready
      />

      <main className="relative z-20 mx-auto -mt-12 max-w-7xl px-6 pb-24 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* LEFT / MAIN COLUMN */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            <PrimaryHeroCard
              path={path}
              vocabDue={vocabDue}
              nextLesson={nextLesson}
              waitingOnVocab={waitingOnVocab}
              getLessonHref={getLessonHref}
            />

            {/* 🔥 NEW RICH MINI CARDS 🔥 */}
            <LearningPathMiniCards 
              lessons={lessons}
              vocabDue={vocabDue}
              nextLesson={nextLesson}
            />
          </div>

          {/* RIGHT PANEL */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <WordMatrixWidget totalWordsLearned={totalWordsLearned} />
            <AiTutorWidget />
          </div>

        </div>
      </main>
    </div>
  );
}


// ============================================================================
// 2. DASHBOARD HEADER COMPONENT
// ============================================================================
function DashboardHeader({ lang, completedCount, streak }: { lang: any, completedCount: number, streak: number }) {
  return (
    <header className="relative overflow-hidden bg-slate-950 pt-10 pb-20 text-white shadow-xl">
      <div className="pointer-events-none absolute -top-20 left-1/2 -z-0 h-96 w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-violet-600/35 via-fuchsia-600/25 to-blue-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-1/2 -z-0 h-72 w-72 rounded-full bg-indigo-500/15 blur-2xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-200 backdrop-blur-md">
            <Globe2 className="h-4 w-4 text-violet-400" />
            <span>
              Learning <strong className="text-white uppercase">{lang?.targetLanguage ?? "French"}</strong> from{" "}
              <span className="text-slate-400">{lang?.nativeLanguage ?? "English"}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>Streak: {streak}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-300">
              <Trophy className="h-4 w-4 text-emerald-400" />
              <span>{completedCount} Completed</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Ready to learn today?
          </h1>
          <p className="mt-2 text-base text-slate-300 sm:text-lg">
            Master essential speech patterns step-by-step through bite-sized interactive audio lessons.
          </p>
        </div>
      </div>
    </header>
  );
}


// ============================================================================
// 3. LEARNING PATH MINI CARDS (Rich Image Versions)
// ============================================================================
function LearningPathMiniCards({ 
  lessons, 
  vocabDue, 
  nextLesson 
}: { 
  lessons: Lesson[], 
  vocabDue?: Lesson, 
  nextLesson?: Lesson 
}) {
  if (lessons.length === 0) return null;

  // Determine what is "Up Next" (Could be a Vocab Bridge or a new Spoon)
  const isVocabFocus = !!vocabDue;
  const focusLesson = vocabDue || nextLesson;
  
  // Determine what is "Locked" (The thing immediately after the focus)
  const lockedLessonIndex = focusLesson ? lessons.findIndex(l => l.id === focusLesson.id) + (isVocabFocus ? 0 : 1) : -1;
  const lockedLesson = lockedLessonIndex >= 0 && lockedLessonIndex < lessons.length ? lessons[lockedLessonIndex] : null;

  // --- EXTRACT RICH DATA (Cast to 'any' internally to support the new JSON fields flexibly) ---
  const fl = focusLesson as any;
  const ll = lockedLesson as any;

  // Active Card Data
  const activeImage = isVocabFocus 
    ? fl?.bridge?.bridgeScene?.imageS3Key 
    : fl?.visualContent?.imageS3Key;
    
  const activeTheme = isVocabFocus
    ? fl?.bridge?.handoffFragment?.bridgeLexicon?.join(" • ") || "Vocabulary Review"
    : fl?.lessonHandoff?.theme || fl?.freestyle?.topic || "Foundation Lesson";

  const activeTarget = isVocabFocus
    ? `${fl?.bridge?.vocabMoment?.length || 0} words to master`
    : fl?.grammarContent?.targetSentence || "Core speaking drills";

  // Locked Card Data
  const lockedIsVocab = ll && ll.completedAt && !ll.bridge?.passed;
  
  const lockedImage = lockedIsVocab
    ? ll?.bridge?.bridgeScene?.imageS3Key
    : ll?.visualContent?.imageS3Key;
    
  const lockedTheme = lockedIsVocab
    ? "Vocabulary Review"
    : ll?.lessonHandoff?.theme || ll?.freestyle?.topic || "Foundation Lesson";


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
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              ) : (
                <Volume2 className="h-4 w-4 text-emerald-400 shrink-0" />
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
          {lockedLesson && (
            <>
              <Image 
                src={getImageUrl(lockedImage)} 
                alt="Locked Lesson" 
                fill
                className="object-cover opacity-20 grayscale filter blur-[2px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-white/80 to-white/50" />
            </>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 flex h-full flex-col justify-between">
          
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-3 py-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-wide backdrop-blur-sm border border-slate-300/50">
              <Lock className="h-3 w-3" /> Locked
            </span>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-400 mb-1">
              {lockedLesson 
                ? (lockedIsVocab ? `Vocab Bridge ${lockedLesson.orderIndex}` : `Spoon ${lockedLesson.orderIndex}`)
                : 'Next Steps'
              }
            </h4>
            <h3 className="text-xl font-black text-slate-700 leading-tight line-clamp-2">
              {lockedLesson ? lockedTheme : 'More content coming soon'}
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


// ============================================================================
// 4. PRIMARY HERO CALLOUT CARD
// ============================================================================
function PrimaryHeroCard({
  path,
  vocabDue,
  nextLesson,
  waitingOnVocab,
  getLessonHref,
}: {
  path: LearningPath | null;
  vocabDue?: Lesson;
  nextLesson?: Lesson;
  waitingOnVocab: boolean;
  getLessonHref: (id: string) => string;
}) {
  const cardStyle = "relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs flex flex-col justify-between min-h-[230px]";

  if (!path) {
    return (
      <div className={cardStyle}>
        <div>
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Getting Started</span>
          <h3 className="mt-2 text-2xl font-black text-slate-900">Welcome to your curriculum</h3>
          <p className="mt-1 text-sm text-slate-500">Hold tight while your initial learning path is being prepared.</p>
        </div>
      </div>
    );
  }

  if (vocabDue?.bridge) {
    return (
      <div className={`${cardStyle} border-amber-200 bg-gradient-to-br from-amber-50/50 via-white to-white`}>
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800 uppercase">
            <Lock className="h-3.5 w-3.5" /> Next Spoon Locked
          </div>
          <h3 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
            Review Vocabulary for Spoon {vocabDue.orderIndex}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Solidify the {vocabWordCount(vocabDue.bridge.vocabMoment)} new words you encountered to unlock Spoon {vocabDue.orderIndex + 1}.
          </p>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs font-semibold text-slate-400">⏱️ ~3 mins</span>
          <Link
            href={`/foundation/vocab/${vocabDue.bridge.id}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600 active:scale-95"
          >
            <Zap className="h-4 w-4" /> Start Vocab Bridge <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (waitingOnVocab) {
    return (
      <div className={cardStyle}>
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700 uppercase">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-blue-600" /> Lesson Complete
          </div>
          <h3 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">Synthesizing Your Vocab Bridge...</h3>
          <p className="mt-1 text-sm text-slate-500">Our language engine is extracting the key vocabulary moments from your completed session.</p>
        </div>
        <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> Ready in just a moment
        </div>
      </div>
    );
  }

  if (nextLesson) {
    return (
      <div className={`${cardStyle} border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-white`}>
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Spoon {nextLesson.orderIndex} Ready
            </span>
            <span className="text-xs font-bold text-slate-400">⏱️ 5-7 min session</span>
          </div>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Spoon {nextLesson.orderIndex}: Foundation Lesson
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Target speaking exercises, sentence construction, and listening drills tailored to your level.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Headphones className="h-4 w-4 text-slate-500" />
            <span>Interactive Audio Lesson</span>
          </div>
          <Link
            href={getLessonHref(nextLesson.id)}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
          >
            Start Spoon {nextLesson.orderIndex} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cardStyle}>
      <h3 className="text-2xl font-black text-slate-900">All caught up! 🎉</h3>
      <p className="mt-1 text-sm text-slate-500">
        You've completed every available spoon on this track. Practice in free conversation while new content is baked.
      </p>
    </div>
  );
}


// ============================================================================
// 5. WORD MATRIX WIDGET
// ============================================================================
function WordMatrixWidget({ totalWordsLearned }: { totalWordsLearned: number }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-6 shadow-xs transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider">
          <Grid3X3 className="h-3.5 w-3.5 text-indigo-600" /> Word Matrix
        </span>
        <span className="text-xs font-extrabold text-indigo-600">
          {totalWordsLearned} Words Banked
        </span>
      </div>

      <h3 className="mt-4 text-xl font-black text-slate-900">Vocabulary Retention</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Words automatically cycle into your retention matrix as you finish lessons and vocab bridges.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-center">
          <span className="block text-2xl font-black text-slate-900">{totalWordsLearned}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acquired</span>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-center">
          <span className="block text-2xl font-black text-emerald-600">100%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mastery</span>
        </div>
      </div>

      <Link
        href="/matrix"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-extrabold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-98"
      >
        Open Word Matrix <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}


// ============================================================================
// 6. AI TUTOR WIDGET
// ============================================================================
function AiTutorWidget() {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-violet-300 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-extrabold text-purple-700 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" /> Free Practice
          </span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
        </div>

        <h3 className="mt-3 text-xl font-black text-slate-900">Spoken AI Tutor</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Put whatever words you've learned into conversational practice with live speech feedback.
        </p>
      </div>

      <Link
        href="/learning-hub/conversation"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-800 transition hover:bg-slate-900 hover:text-white"
      >
        <MessageSquare className="h-3.5 w-3.5" /> Start Conversation
      </Link>
    </div>
  );
}