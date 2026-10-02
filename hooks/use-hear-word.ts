import { getWordAudioUrls } from "@/app/actions/word-audio";

type WordAudio = Record<string, { m?: string; f?: string }>;

// must match normalize_word() in the Python builders
const slug = (w: string) =>
  w
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\s-]/gu, "")
    .replace(/\s+/g, "_");

let urls: Record<string, string> = {}; // s3 key -> signed url
let current: HTMLAudioElement | undefined;

// call once when the lesson loads
export async function preloadWordAudio(wordAudio: WordAudio) {
  const keys = Object.values(wordAudio)
    .flatMap((v) => [v.m, v.f])
    .filter((k): k is string => !!k);
  if (!keys.length) return;

  try {
    urls = { ...urls, ...(await getWordAudioUrls(keys)) };
  } catch {
    // no signed urls -> every word falls back to the browser voice
  }
}

export async function hearWord(
  word: string,
  lang: string,
  gender: "m" | "f"
) {
  current?.pause();
  speechSynthesis.cancel();

  const url = urls[`foundation/words/${lang}/${gender}/${slug(word)}.mp3`];

  try {
    if (!url) throw new Error("no recorded audio");
    current = new Audio(url);
    await current.play();
  } catch {
    // not in S3 / failed to load -> browser voice
    const u = new SpeechSynthesisUtterance(word);
    u.lang = lang;
    speechSynthesis.speak(u);
  }
}