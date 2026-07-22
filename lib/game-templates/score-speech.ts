// lib/scoreSpeech.ts

export interface ScoreResult {
  score: number;
  matchedKeywords: string[];
  totalPossible: number;
}

export function evaluateSpeechTranscript(
  transcript: string,
  targetKeywords: string[]
): ScoreResult {
  if (!transcript || !targetKeywords.length) {
    return { score: 0, matchedKeywords: [], totalPossible: targetKeywords.length };
  }

  // Normalize transcript to lowercase and remove punctuation
  const cleanTranscript = transcript.toLowerCase().replace(/[^\w\s]/g, "");
  const wordsInTranscript = cleanTranscript.split(/\s+/);

  // Find matches
  const matchedKeywords = targetKeywords.filter((keyword) => {
    const cleanKeyword = keyword.toLowerCase().trim();
    // Match if keyword is spoken as a single word or partial substring
    return wordsInTranscript.includes(cleanKeyword) || cleanTranscript.includes(cleanKeyword);
  });

  // Calculate points: e.g. 10 points per matched keyword
  const score = matchedKeywords.length * 10;

  return {
    score,
    matchedKeywords,
    totalPossible: targetKeywords.length,
  };
}