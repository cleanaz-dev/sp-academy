// components/onboarding/constants.ts

import type { SpriteSlug } from "@/lib/sprites/voices";

export {
  type SpriteSlug,
  type VoiceOption,
  SPRITE_VOICES,
  VOICE_ID_MAP,
  resolveFishVoiceId,
} from "@/lib/sprites/voices";

export const LANGUAGES = [
  { name: "English", flag: "🇬🇧" },
  { name: "French", flag: "🇫🇷" },
  { name: "Spanish", flag: "🇪🇸" },
];

export const LEVELS = [
  { name: "Beginner", description: "I'm just getting started" },
  { name: "Elementary", description: "I know some basics" },
  { name: "Intermediate", description: "I can hold simple conversations" },
  { name: "Advanced", description: "I want to become highly fluent" },
];

export const GOALS = [
  "Speaking",
  "Listening",
  "Reading",
  "Writing",
  "Everything",
];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export { USERNAME_RE } from "@/lib/username-validation";


// export type VoiceOption = {
//   id: string;          // Clean ID: "fr-FR-boy-01"
//   fishVoiceId: string; // Real Fish Audio reference_id
//   sprite: SpriteSlug;
//   label: string;
//   sampleUrl: string;   // Static preview mp3 in /public/samples/...
//   sampleText: string;
// };

export const SPRITES: Array<{
  slug: SpriteSlug;
  name: string;
  avatarUrl: string;
  tagline: string;
}> = [
  {
    slug: "vox",
    name: "Vox",
    avatarUrl: "/sprite-m.png",
    tagline: "High-energy mic master who keeps your pronunciation sharp.",
  },
  {
    slug: "vivi",
    name: "Vivi",
    avatarUrl: "/sprite-f.png",
    tagline: "Chill audio-obsessed guide who breaks down tricky phrases.",
  },
];


export const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  English: "en-US",
  French: "fr-FR",
  Spanish: "es-ES",
  German: "de-DE",
  Italian: "it-IT",
  Portuguese: "pt-BR",
  Japanese: "ja-JP",
  Korean: "ko-KR",
  Chinese: "zh-CN",
  Russian: "ru-RU",
  Arabic: "ar-SA",
};