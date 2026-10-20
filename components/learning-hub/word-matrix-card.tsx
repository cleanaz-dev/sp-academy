import Link from "next/link";
import {
  ArrowRight,
  Grid3X3,
  Mic,
  Sparkles,
  MessageSquareQuote,
  BookOpenCheck,
  Lock,
} from "lucide-react";
import type { LearningPath } from "@/app/actions/get-learning-path";

type MatrixStats = LearningPath["matrixStats"];

type WordMatrixCardProps = {
  totalWordsLearned: number;
  matrixStats?: MatrixStats | null;
  fallbackWords?: Array<{ word: string; gloss?: string }>;
  isLocked?: boolean;
};

export function WordMatrixCard({
  totalWordsLearned,
  matrixStats,
  fallbackWords = [],
  isLocked = false,
}: WordMatrixCardProps) {
  // Locked State before Spoon 1 is completed
  if (isLocked) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold tracking-wider text-slate-600 uppercase">
            <Grid3X3 className="h-3.5 w-3.5 text-slate-500" /> Word Matrix
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase">
            <Lock className="h-3 w-3" /> Locked
          </span>
        </div>

        <div className="my-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-9 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-base font-black text-slate-900">
            Word Matrix Locked
          </h3>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
            Complete <strong className="text-slate-700">Spoon 1</strong> to
            unlock your personal vocabulary bank, pronunciation scores, and
            spaced-repetition tracker.
          </p>
        </div>

        <button
          type="button"
          disabled
          className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 text-xs font-extrabold text-slate-400"
        >
          <Lock className="h-3.5 w-3.5" /> Complete Spoon 1 to Unlock
        </button>
      </div>
    );
  }

  const totalCount =
    matrixStats && matrixStats.totalTracked > 0
      ? matrixStats.totalTracked
      : totalWordsLearned;

  const topWord = matrixStats?.topWord ?? null;
  const topPhrase = matrixStats?.topPhrase ?? null;
  const avgPronunciation = matrixStats?.avgPronunciation ?? null;

  const totalTracked = matrixStats?.totalTracked || 0;
  const masteredPct = totalTracked
    ? Math.round((matrixStats!.statusCounts.MASTERED / totalTracked) * 100)
    : 0;
  const familiarPct = totalTracked
    ? Math.round((matrixStats!.statusCounts.FAMILIAR / totalTracked) * 100)
    : 0;
  const learningPct = totalTracked
    ? Math.round((matrixStats!.statusCounts.LEARNING / totalTracked) * 100)
    : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl" />

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-extrabold tracking-wider text-indigo-700 uppercase">
          <Grid3X3 className="h-3.5 w-3.5 text-indigo-600" /> Word Matrix
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-700">
          {totalCount} Banked
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-center">
          <span className="block text-xl font-black text-slate-900">
            {matrixStats?.wordsCount || totalCount}
          </span>
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Words
          </span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-center">
          <span className="block text-xl font-black text-indigo-600">
            {matrixStats?.phrasesCount ?? 0}
          </span>
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Phrases
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-100/80 bg-emerald-50/50 p-3 text-center">
          <span className="block text-xl font-black text-emerald-600">
            {avgPronunciation !== null ? `${avgPronunciation}%` : "—"}
          </span>
          <span className="text-[10px] font-bold tracking-wider text-emerald-700/70 uppercase">
            Speech Avg
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
            Top Spoken Signatures
          </span>
          {matrixStats?.totalSpokenAttempts ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600">
              <Mic className="h-3 w-3" /> {matrixStats.totalSpokenAttempts}x
              spoken
            </span>
          ) : null}
        </div>

        {topWord ? (
          <div className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50/90 to-white p-3.5 transition hover:border-indigo-200">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-indigo-700 uppercase">
                  Top Word
                </span>
                {topWord.partOfSpeech && topWord.partOfSpeech !== "OTHER" && (
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    • {topWord.partOfSpeech}
                  </span>
                )}
                {topWord.gender && (
                  <span
                    className={`rounded px-1 text-[9px] font-black ${
                      topWord.gender === "F"
                        ? "bg-pink-100 text-pink-700"
                        : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {topWord.gender}
                  </span>
                )}
              </div>

              <p className="mt-1 truncate text-base font-black text-slate-900">
                {topWord.word}
              </p>
              {topWord.translation && (
                <p className="truncate text-xs font-medium text-slate-500">
                  &ldquo;{topWord.translation}&rdquo;
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1 pl-3">
              {topWord.avgSpokenScore !== null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">
                  <Sparkles className="h-3 w-3 text-emerald-500" />
                  {topWord.avgSpokenScore}%
                </span>
              )}
              <span className="text-[11px] font-bold text-slate-400">
                {topWord.spokenAttempts > 0
                  ? `Spoken ${topWord.spokenAttempts}x`
                  : `Seen ${topWord.seenCount}x`}
              </span>
            </div>
          </div>
        ) : null}

        {topPhrase ? (
          <div className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-gradient-to-r from-fuchsia-50/40 via-slate-50/60 to-white p-3.5 transition hover:border-fuchsia-200">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded bg-fuchsia-100 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-fuchsia-700 uppercase">
                  <MessageSquareQuote className="h-2.5 w-2.5" /> Top Phrase
                </span>
                {topPhrase.partOfSpeech &&
                  topPhrase.partOfSpeech !== "OTHER" && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      • {topPhrase.partOfSpeech}
                    </span>
                  )}
              </div>

              <p className="mt-1 truncate text-sm font-black text-slate-900">
                {topPhrase.word}
              </p>
              {topPhrase.translation && (
                <p className="truncate text-xs font-medium text-slate-500">
                  &ldquo;{topPhrase.translation}&rdquo;
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1 pl-3">
              {topPhrase.avgSpokenScore !== null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">
                  <Sparkles className="h-3 w-3 text-emerald-500" />
                  {topPhrase.avgSpokenScore}%
                </span>
              )}
              <span className="text-[11px] font-bold text-slate-400">
                {topPhrase.spokenAttempts > 0
                  ? `Spoken ${topPhrase.spokenAttempts}x`
                  : `Seen ${topPhrase.seenCount}x`}
              </span>
            </div>
          </div>
        ) : null}

        {!topWord && !topPhrase && fallbackWords.length > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              <BookOpenCheck className="h-3.5 w-3.5 text-indigo-500" /> Recently
              Unlocked Vocab
            </div>
            <div className="flex flex-wrap gap-1.5">
              {fallbackWords.slice(0, 5).map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 shadow-2xs"
                >
                  <span>{item.word}</span>
                  {item.gloss && (
                    <span className="font-normal text-slate-400">
                      • {item.gloss}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {totalTracked > 0 && (
        <div className="mt-4 pt-1">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>Retention Pipeline</span>
            <span className="text-emerald-600">
              {matrixStats!.statusCounts.MASTERED} Mastered
            </span>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
            {masteredPct > 0 && (
              <div
                style={{ width: `${masteredPct}%` }}
                className="bg-emerald-500 transition-all"
                title="Mastered"
              />
            )}
            {familiarPct > 0 && (
              <div
                style={{ width: `${familiarPct}%` }}
                className="bg-indigo-500 transition-all"
                title="Familiar"
              />
            )}
            {learningPct > 0 && (
              <div
                style={{ width: `${learningPct}%` }}
                className="bg-amber-400 transition-all"
                title="Learning"
              />
            )}
          </div>
        </div>
      )}

      <Link
        href="/matrix"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-extrabold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-98"
      >
        Explore Full Word Matrix <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}