import { Lock, Sparkles } from "lucide-react";
import type { LearningPath } from "@/app/actions/get-learning-path";

type FocusState = LearningPath["currentFocus"];
type Lesson = LearningPath["lessons"][number];

export function LearningPathMiniCards({
  currentFocus,
  nextLocked,
}: {
  currentFocus: FocusState;
  nextLocked: FocusState;
}) {
  if (!currentFocus) return null;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* 1. ACTIVE FOCUS */}
      {currentFocus.type === "SPOON" && <CurrentSpoonCard lesson={currentFocus.data} />}
      {currentFocus.type === "BRIDGE" && <VocabBridgeCard lesson={currentFocus.data} />}
      {currentFocus.type === "BOSS" && <BossStageCard lesson={currentFocus.data} />}

      {/* 2. UP NEXT LOCKED */}
      {nextLocked && <LockedNextCard type={nextLocked.type} lesson={nextLocked.data} />}
    </section>
  );
}

function VocabBridgeCard({ lesson }: { lesson: Lesson }) {
  const wordsToReview = lesson.bridge?.vocabMoment 
    ? (lesson.bridge.vocabMoment as Array<{word: string}>).slice(0, 3) 
    : [];

  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border-2 border-amber-400/40 bg-white p-6 shadow-sm ring-1 ring-amber-400/20 relative overflow-hidden">
      {lesson.imageUrl && (
        <div 
          className="absolute inset-0 opacity-[0.03] bg-cover bg-center pointer-events-none" 
          style={{ backgroundImage: `url(${lesson.imageUrl})` }} 
        />
      )}
      
      <div className="relative z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-amber-700 uppercase">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          Current Focus
        </span>
        <h4 className="mt-4 text-lg font-black text-slate-900">
          Vocab Bridge {lesson.orderIndex}
        </h4>
        <p className="mt-1 text-sm font-bold text-slate-600">
          Reviewing: {lesson.title}
        </p>

        {/* VOCAB PREVIEW PILLS */}
        {wordsToReview.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {wordsToReview.map((v, idx) => (
              <span key={idx} className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold border border-amber-200">
                {v.word}
              </span>
            ))}
            {((lesson.bridge?.vocabMoment as Array<any>)?.length ?? 0) > 3 && (
              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs font-bold">
                + more
              </span>
            )}
          </div>
        )}

        <p className="mt-3 text-xs text-slate-500">
          Master the new words to unlock the next step.
        </p>
      </div>
      <div className="mt-6 flex h-2 w-full overflow-hidden rounded-full bg-amber-100 relative z-10">
        <div className="w-1/2 rounded-full bg-amber-500" />
      </div>
    </div>
  );
}

function CurrentSpoonCard({ lesson }: { lesson: Lesson }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border-2 border-indigo-500/20 bg-white shadow-sm ring-1 ring-indigo-500/10">
      {lesson.imageUrl && (
        <div className="relative aspect-[16/8] w-full shrink-0 overflow-hidden bg-slate-100">
          <img
            src={lesson.imageUrl}
            alt={lesson.imageAlt ?? ""}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-indigo-700 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-600" />
            Current Focus
          </span>
          <h4 className="mt-3 text-lg font-black text-slate-900">
            Spoon {lesson.orderIndex}
          </h4>
          <p className="mt-1 text-sm font-bold text-slate-600">{lesson.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            Core audio lesson and speaking drills.
          </p>
        </div>
      </div>
    </div>
  );
}

function BossStageCard({ lesson }: { lesson: Lesson }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border-2 border-fuchsia-500/40 bg-gradient-to-b from-white to-fuchsia-50 p-6 shadow-sm ring-1 ring-fuchsia-500/20">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-fuchsia-800 uppercase shadow-sm">
          <Sparkles className="h-3 w-3 text-fuchsia-600" />
          Milestone Check
        </span>
        <h4 className="mt-4 text-lg font-black text-slate-900">
          AI Conversation
        </h4>
        <p className="mt-1 text-sm font-bold text-slate-600">
          Gauge Stage: Spoons {lesson.orderIndex - 2} - {lesson.orderIndex}
        </p>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          Prove your fluency! Have a live conversation with AI using the patterns you've learned.
        </p>
      </div>
      <button className="mt-6 w-full rounded-xl bg-fuchsia-600 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-fuchsia-700 active:scale-95">
        Start Conversation
      </button>
    </div>
  );
}

function LockedNextCard({ type, lesson }: { type: "SPOON" | "BRIDGE" | "BOSS", lesson: Lesson }) {
  const getTitle = () => {
    if (type === "SPOON") return `Spoon ${lesson.orderIndex}`;
    if (type === "BRIDGE") return `Vocab Bridge ${lesson.orderIndex}`;
    if (type === "BOSS") return `AI Conversation`;
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/50 shadow-sm opacity-80">
      {type === "SPOON" && lesson.imageUrl && (
        <div className="relative aspect-[16/8] w-full shrink-0 bg-slate-200 grayscale">
          <img src={lesson.imageUrl} alt={lesson.imageAlt ?? ""} className="h-full w-full object-cover" />
        </div>
      )}
      
      <div className="p-6 relative">
        <span className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-slate-500 uppercase shadow-sm">
          <Lock className="h-3 w-3" /> Locked
        </span>

        <h4 className="text-lg font-black text-slate-400 mt-2">{getTitle()}</h4>
        
        {type === "SPOON" && <p className="mt-1 text-sm font-bold text-slate-400">{lesson.title}</p>}
        {type === "BOSS" && <p className="mt-1 text-sm font-bold text-slate-400">Fluency Gauge Checkpoint</p>}
        
        <p className="mt-3 text-xs text-slate-400">Finish your current focus to unlock this step.</p>
      </div>
    </div>
  );
}