// components/onboarding/constants.ts
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

export type SpriteSlug = "vox" | "vivi";

export type VoiceOption = {
  id: string;          // Clean ID: "fr-FR-boy-01"
  fishVoiceId: string; // Real Fish Audio reference_id
  sprite: SpriteSlug;
  label: string;
  sampleUrl: string;   // Static preview mp3 in /public/samples/...
  sampleText: string;
};

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

export const SPRITE_VOICES: Record<string, VoiceOption[]> = {
  "fr-FR": [
    {
      id: "fr-FR-boy-01",
      fishVoiceId: "d99596e8405d4651bcd3ebe45df58f97",
      sprite: "vox",
      label: "Vox • Upbeat & Street",
      sampleUrl: "/samples/fr-FR-boy-01.mp3",
      sampleText: "Salut ! Moi c'est Vox, prêt à maîtriser le français ?",
    },
    {
      id: "fr-FR-man-01",
      fishVoiceId: "3bce5f0710f949888abe982ded1ef731",
      sprite: "vox",
      label: "Vox • Smooth & Deep",
      sampleUrl: "/samples/fr-FR-man-01.mp3",
      sampleText: "Bonsoir ! On commence ta première mission ensemble.",
    },
    {
      id: "fr-FR-girl-01",
      fishVoiceId: "5e55054ca1924b81ac69a1590574370e",
      sprite: "vivi",
      label: "Vivi • Bright & Friendly",
      sampleUrl: "/samples/fr-FR-girl-01.mp3",
      sampleText: "Coucou ! C'est Vivi. Mets tes écouteurs, on commence !",
    },
    {
      id: "fr-FR-woman-01",
      fishVoiceId: "a7a679bc8eb04e09abc7dc8ad3158eb3",
      sprite: "vivi",
      label: "Vivi • Bright & Calm",
      sampleUrl: "/samples/fr-FR-woman-01.mp3",
      sampleText: "Bienvenue ! On va avancer étape par étape.",
    },
  ],
  "es-ES": [
    {
      id: "es-ES-boy-01",
      fishVoiceId: "37d28ffbfe0b483da35fef6c72ad70a6",
      sprite: "vox",
      label: "Vox • Upbeat & Street",
      sampleUrl: "/samples/es-ES-boy-01.mp3",
      sampleText: "¡Hola! Soy Vox, ¿listo para dominar el español?",
    },
    {
      id: "es-ES-man-01",
      fishVoiceId: "a335d470fff248e8890dce6550a2874b",
      sprite: "vox",
      label: "Vox • Smooth & Deep",
      sampleUrl: "/samples/es-ES-man-01.mp3",
      sampleText: "¡Buenas! Empecemos tu primera misión hoy.",
    },
    {
      id: "es-ES-girl-01",
      fishVoiceId: "0118a35dcb604837abe7961a43e13ba8",
      sprite: "vivi",
      label: "Vivi • Bright & Friendly",
      sampleUrl: "/samples/es-ES-girl-01.mp3",
      sampleText: "¡Hola! Soy Vivi. Ponte los auriculares y vamos.",
    },
    {
      id: "es-ES-woman-01",
      fishVoiceId: "692eb1e1023242219dc8caae8c56fb12",
      sprite: "vivi",
      label: "Vivi • Warm & Calm",
      sampleUrl: "/samples/es-ES-woman-01.mp3",
      sampleText: "¡Bienvenido! Vamos paso a paso con tu pronunciación.",
    },
  ],
  "en-US": [
    {
      id: "en-US-boy-01",
      fishVoiceId: "4fbed27c40e3465f98bc777fd0cc35ff",
      sprite: "vox",
      label: "Vox • Upbeat & Street",
      sampleUrl: "/samples/en-US-boy-01.mp3",
      sampleText: "Hey! I'm Vox. Ready to level up your speaking skills?",
    },
    {
      id: "en-US-man-01",
      fishVoiceId: "bf322df2096a46f18c579d0baa36f41d",
      sprite: "vox",
      label: "Vox • Smooth & Deep",
      sampleUrl: "/samples/en-US-man-01.mp3",
      sampleText: "Welcome in. Let's start your first mission together.",
    },
    {
      id: "en-US-girl-01",
      fishVoiceId: "0a79ef436e91445fb80bd657d3f80ec1",
      sprite: "vivi",
      label: "Vivi • Bright & Friendly",
      sampleUrl: "/samples/en-US-girl-01.mp3",
      sampleText: "Hi there! I'm Vivi. Grab your headphones and let's go!",
    },
    {
      id: "en-US-woman-01",
      fishVoiceId: "933563129e564b19a115bedd57b7406a",
      sprite: "vivi",
      label: "Vivi • Warm & Calm",
      sampleUrl: "/samples/en-US-woman-01.mp3",
      sampleText: "Welcome! We'll take it step by step at your own pace.",
    },
  ],
};

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